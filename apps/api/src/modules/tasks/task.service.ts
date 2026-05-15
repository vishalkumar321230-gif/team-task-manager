import { ProjectRole, TaskStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { logActivity } from "../activity/activity.service.js";

const taskInclude = {
  assignedTo: {
    select: { id: true, name: true, email: true }
  },
  createdBy: {
    select: { id: true, name: true, email: true }
  }
};

async function assertAssigneeInProject(projectId: string, assignedToId?: string | null) {
  if (!assignedToId) return;

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: assignedToId, projectId } }
  });

  if (!membership) {
    throw new ApiError(400, "Assigned user must belong to the project");
  }
}

export async function listTasks(
  projectId: string,
  userId: string,
  role: ProjectRole,
  filters: { status?: TaskStatus; priority?: "LOW" | "MEDIUM" | "HIGH" }
) {
  return prisma.task.findMany({
    where: {
      projectId,
      ...(role === ProjectRole.MEMBER ? { assignedToId: userId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {})
    },
    include: taskInclude,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }]
  });
}

export async function createTask(
  projectId: string,
  actorId: string,
  input: {
    title: string;
    description?: string | null;
    dueDate?: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: TaskStatus;
    assignedToId?: string | null;
  }
) {
  await assertAssigneeInProject(projectId, input.assignedToId);

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      priority: input.priority,
      status: input.status,
      assignedToId: input.assignedToId,
      createdById: actorId,
      projectId
    },
    include: taskInclude
  });

  await logActivity({
    action: `Created task "${task.title}"`,
    userId: actorId,
    projectId
  });

  return task;
}

export async function updateTask(
  taskId: string,
  actorId: string,
  role: ProjectRole,
  input: {
    title?: string;
    description?: string | null;
    dueDate?: string | null;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    status?: TaskStatus;
    assignedToId?: string | null;
  }
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (role === ProjectRole.MEMBER) {
    if (task.assignedToId !== actorId) {
      throw new ApiError(403, "Members can only update assigned tasks");
    }

    const allowedKeys = ["status"];
    const requestedKeys = Object.keys(input);
    if (requestedKeys.some((key) => !allowedKeys.includes(key))) {
      throw new ApiError(403, "Members can update task status only");
    }
  }

  await assertAssigneeInProject(task.projectId, input.assignedToId);

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.dueDate !== undefined
        ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
        : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.assignedToId !== undefined ? { assignedToId: input.assignedToId } : {})
    },
    include: taskInclude
  });

  await logActivity({
    action: `Updated task "${updated.title}"`,
    userId: actorId,
    projectId: updated.projectId
  });

  return updated;
}

export async function deleteTask(taskId: string, actorId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await prisma.task.delete({ where: { id: taskId } });
  await logActivity({
    action: `Deleted task "${task.title}"`,
    userId: actorId,
    projectId: task.projectId
  });
}

export async function getTaskProjectRole(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true }
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId: task.projectId } }
  });

  if (!membership) {
    throw new ApiError(403, "You do not belong to this project");
  }

  return membership.role;
}
