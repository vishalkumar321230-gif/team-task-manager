"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, Clock3 } from "lucide-react";
import { api } from "@/lib/api";
import type { Dashboard, Priority, Project, ProjectRole, Task, TaskStatus, User } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { MemberPanel } from "@/components/projects/member-panel";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskForm } from "@/components/tasks/task-form";
import { Select } from "@/components/ui/select";

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const currentRole = useMemo<ProjectRole>(() => {
    if (!project || !user) return "MEMBER";
    return project.members.find((member) => member.user.id === user.id)?.role ?? "MEMBER";
  }, [project, user]);

  async function loadProject() {
    const taskQuery = new URLSearchParams();
    if (status !== "ALL") taskQuery.set("status", status);
    if (priority !== "ALL") taskQuery.set("priority", priority);

    const [meResponse, projectResponse, taskResponse, dashboardResponse] = await Promise.all([
      api.get("/auth/me"),
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/tasks${taskQuery.toString() ? `?${taskQuery}` : ""}`),
      api.get(`/projects/${projectId}/dashboard`)
    ]);

    setUser(meResponse.data.user);
    setProject(projectResponse.data.project);
    setTasks(taskResponse.data.tasks);
    setDashboard(dashboardResponse.data.dashboard);
    setIsLoading(false);
  }

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, status, priority]);

  if (isLoading || !project) {
    return <p className="text-sm text-muted-foreground">Loading project...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={project.description || "Manage members, assignments, status, and delivery risk."}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tasks" value={dashboard?.totalTasks ?? 0} icon={ClipboardList} />
        <StatCard label="In progress" value={dashboard?.tasksByStatus.IN_PROGRESS ?? 0} icon={Clock3} />
        <StatCard label="Done" value={dashboard?.tasksByStatus.DONE ?? 0} icon={CheckCircle2} />
        <StatCard label="Overdue" value={dashboard?.overdueTasks ?? 0} icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_25rem]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">Filter tasks by status and priority.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus | "ALL")}>
                <option value="ALL">All statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </Select>
              <Select value={priority} onChange={(event) => setPriority(event.target.value as Priority | "ALL")}>
                <option value="ALL">All priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </div>
          </div>

          <TaskBoard tasks={tasks} role={currentRole} onChanged={loadProject} />
        </div>

        <div className="space-y-6">
          {currentRole === "ADMIN" ? (
            <TaskForm project={project} onCreated={(task) => setTasks((current) => [task, ...current])} />
          ) : null}
          <MemberPanel project={project} currentRole={currentRole} onProjectChange={setProject} />
        </div>
      </div>
    </div>
  );
}
