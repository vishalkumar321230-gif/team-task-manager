import { Priority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const taskIdParams = z.object({
  taskId: z.string().min(1)
});

export const projectTasksParams = z.object({
  projectId: z.string().min(1)
});

export const taskQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional()
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(1000).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  assignedToId: z.string().min(1).optional().nullable()
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(140).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedToId: z.string().min(1).optional().nullable()
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus)
});
