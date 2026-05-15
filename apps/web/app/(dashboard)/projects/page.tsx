"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, FolderKanban } from "lucide-react";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectForm } from "@/components/projects/project-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await api.get("/projects");
      setProjects(response.data.projects);
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Projects"
        title="Project portfolio"
        description="Create projects, view membership, and jump into each task board."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-52 items-center justify-center p-8 text-center">
                <div>
                  <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 font-medium">No projects yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create one from the panel to begin.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="transition hover:border-primary/50 hover:bg-card/80">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{project.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {project.description || "No description"}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Badge tone="muted">{project.members.length} members</Badge>
                        <Badge>{project._count?.tasks ?? 0} tasks</Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        <ProjectForm onCreated={(project) => setProjects((current) => [project, ...current])} />
      </div>
    </div>
  );
}
