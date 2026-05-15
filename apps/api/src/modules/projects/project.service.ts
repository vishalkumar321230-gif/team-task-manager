import { ProjectRole } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { logActivity } from "../activity/activity.service.js";

const projectInclude = {
  members: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "asc" as const }
  },
  _count: {
    select: {
      tasks: true
    }
  }
};

export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: projectInclude,
    orderBy: { updatedAt: "desc" }
  });
}

export async function createProject(
  userId: string,
  input: { name: string; description?: string | null }
) {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      members: {
        create: {
          userId,
          role: ProjectRole.ADMIN
        }
      }
    },
    include: projectInclude
  });

  await logActivity({
    action: `Created project "${project.name}"`,
    userId,
    projectId: project.id
  });

  return project;
}

export async function getProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: { userId }
      }
    },
    include: projectInclude
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
}

export async function addMember(
  projectId: string,
  actorId: string,
  input: { email: string; role: ProjectRole }
) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new ApiError(404, "User not found. Ask them to sign up first.");
  }

  const member = await prisma.projectMember.upsert({
    where: { userId_projectId: { userId: user.id, projectId } },
    update: { role: input.role },
    create: {
      projectId,
      userId: user.id,
      role: input.role
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  await logActivity({
    action: `Added ${user.name} as ${input.role.toLowerCase()}`,
    userId: actorId,
    projectId
  });

  return member;
}

export async function removeMember(projectId: string, actorId: string, userId: string) {
  const adminCount = await prisma.projectMember.count({
    where: { projectId, role: ProjectRole.ADMIN }
  });

  const target = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
    include: { user: true }
  });

  if (!target) {
    throw new ApiError(404, "Member not found");
  }

  if (target.role === ProjectRole.ADMIN && adminCount <= 1) {
    throw new ApiError(400, "A project must keep at least one admin");
  }

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId, projectId } }
  });

  await prisma.task.updateMany({
    where: { projectId, assignedToId: userId },
    data: { assignedToId: null }
  });

  await logActivity({
    action: `Removed ${target.user.name} from project`,
    userId: actorId,
    projectId
  });
}
