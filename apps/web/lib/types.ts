export type User = {
  id: string;
  name: string;
  email: string;
};

export type ProjectRole = "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type ProjectMember = {
  id: string;
  role: ProjectRole;
  user: User;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  members: ProjectMember[];
  _count?: {
    tasks: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: Priority;
  status: TaskStatus;
  assignedTo?: User | null;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
};

export type Dashboard = {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  overdueTasks: number;
  tasksPerUser: Array<{ user: User | null; count: number }>;
  recentActivity: Array<{
    id: string;
    action: string;
    createdAt: string;
    user: User;
  }>;
};
