import bcrypt from "bcryptjs";
import { PrismaClient, Priority, ProjectRole, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Avery Admin",
      email: "admin@example.com",
      passwordHash
    }
  });

  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: {
      name: "Mina Member",
      email: "member@example.com",
      passwordHash
    }
  });

  const project = await prisma.project.upsert({
    where: { id: "demo-project" },
    update: {},
    create: {
      id: "demo-project",
      name: "Launch Operations",
      description: "Coordinate launch tasks, ownership, and weekly progress."
    }
  });

  await prisma.projectMember.upsert({
    where: { userId_projectId: { userId: admin.id, projectId: project.id } },
    update: { role: ProjectRole.ADMIN },
    create: { userId: admin.id, projectId: project.id, role: ProjectRole.ADMIN }
  });

  await prisma.projectMember.upsert({
    where: { userId_projectId: { userId: member.id, projectId: project.id } },
    update: { role: ProjectRole.MEMBER },
    create: { userId: member.id, projectId: project.id, role: ProjectRole.MEMBER }
  });

  const existingTasks = await prisma.task.count({ where: { projectId: project.id } });
  if (existingTasks === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: "Prepare launch checklist",
          description: "Collect all launch dependencies and owners.",
          projectId: project.id,
          createdById: admin.id,
          assignedToId: admin.id,
          priority: Priority.HIGH,
          status: TaskStatus.IN_PROGRESS,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
        },
        {
          title: "Review QA feedback",
          description: "Triage QA notes and update the project board.",
          projectId: project.id,
          createdById: admin.id,
          assignedToId: member.id,
          priority: Priority.MEDIUM,
          status: TaskStatus.TODO,
          dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24)
        },
        {
          title: "Publish team update",
          description: "Share status summary with stakeholders.",
          projectId: project.id,
          createdById: admin.id,
          assignedToId: member.id,
          priority: Priority.LOW,
          status: TaskStatus.DONE,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
        }
      ]
    });
  }

  await prisma.activityLog.create({
    data: {
      action: "Seeded demo project",
      userId: admin.id,
      projectId: project.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
