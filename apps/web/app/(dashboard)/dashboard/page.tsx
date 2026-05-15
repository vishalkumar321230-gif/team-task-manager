"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FolderKanban } from "lucide-react";
import { api } from "@/lib/api";
import type { Dashboard, Project } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const projectResponse = await api.get("/projects");
      const loadedProjects = projectResponse.data.projects as Project[];
      setProjects(loadedProjects);

      if (loadedProjects[0]) {
        const dashboardResponse = await api.get(`/projects/${loadedProjects[0].id}/dashboard`);
        setDashboard(dashboardResponse.data.dashboard);
      }

      setIsLoading(false);
    }

    load();
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Workspace dashboard"
        description="A quick read on your active project health, overdue work, and recent team activity."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-64 items-center justify-center p-8 text-center">
            <div>
              <p className="text-lg font-semibold">No projects yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first project to start assigning tasks and inviting members.
              </p>
              <Link
                href="/projects"
                className="focus-ring mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create project
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total tasks" value={dashboard?.totalTasks ?? 0} icon={FolderKanban} />
            <StatCard label="In progress" value={dashboard?.tasksByStatus.IN_PROGRESS ?? 0} icon={Clock3} />
            <StatCard label="Done" value={dashboard?.tasksByStatus.DONE ?? 0} icon={CheckCircle2} />
            <StatCard
              label="Overdue"
              value={dashboard?.overdueTasks ?? 0}
              icon={AlertTriangle}
              note="Open tasks past due date"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Tasks per user</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard?.tasksPerUser.length ? (
                  dashboard.tasksPerUser.map((item, index) => (
                    <div key={`${item.user?.id ?? "unassigned"}-${index}`} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium">{item.user?.name ?? "Unassigned"}</p>
                        <p className="text-xs text-muted-foreground">{item.user?.email ?? "No owner"}</p>
                      </div>
                      <p className="text-lg font-semibold">{item.count}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No assigned tasks yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard?.recentActivity.length ? (
                  dashboard.recentActivity.map((activity) => (
                    <div key={activity.id} className="rounded-md border p-3">
                      <p className="text-sm">{activity.action}</p>
                      <p className="mt-1 text-xs text-muted-foreground">by {activity.user.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
