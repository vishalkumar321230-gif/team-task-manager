import { ProjectRole, TaskStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export async function getDashboard(projectId: string, userId: string, role: ProjectRole) {
  const visibleTaskWhere = {
    projectId,
    ...(role === ProjectRole.MEMBER ? { assignedToId: userId } : {})
  };

  const [totalTasks, statusGroups, overdueTasks, tasksPerUser, recentActivity] =
    await Promise.all([
      prisma.task.count({ where: visibleTaskWhere }),
      prisma.task.groupBy({
        by: ["status"],
        where: visibleTaskWhere,
        _count: { _all: true }
      }),
      prisma.task.count({
        where: {
          ...visibleTaskWhere,
          dueDate: { lt: new Date() },
          status: { not: TaskStatus.DONE }
        }
      }),
      prisma.task.groupBy({
        by: ["assignedToId"],
        where: visibleTaskWhere,
        _count: { _all: true }
      }),
      prisma.activityLog.findMany({
        where: { projectId },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);

  const assigneeIds = tasksPerUser
    .map((item) => item.assignedToId)
    .filter((id): id is string => Boolean(id));

  const users = await prisma.user.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true, email: true }
  });

  const userById = new Map(users.map((user) => [user.id, user]));

  return {
    totalTasks,
    tasksByStatus: {
      TODO: statusGroups.find((item) => item.status === TaskStatus.TODO)?._count._all ?? 0,
      IN_PROGRESS:
        statusGroups.find((item) => item.status === TaskStatus.IN_PROGRESS)?._count._all ?? 0,
      DONE: statusGroups.find((item) => item.status === TaskStatus.DONE)?._count._all ?? 0
    },
    overdueTasks,
    tasksPerUser: tasksPerUser.map((item) => ({
      user: item.assignedToId ? userById.get(item.assignedToId) ?? null : null,
      count: item._count._all
    })),
    recentActivity
  };
}
