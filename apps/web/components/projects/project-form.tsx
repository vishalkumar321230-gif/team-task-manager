"use client";

import { useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export function ProjectForm({ onCreated }: { onCreated: (project: Project) => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsLoading(true);

    try {
      const response = await api.post("/projects", {
        name: String(formData.get("name")),
        description: String(formData.get("description") || "")
      });
      onCreated(response.data.project);
      form.reset();
      toast({ title: "Project created", description: "Your new workspace is ready." });
    } catch (error) {
      toast({
        title: "Could not create project",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input id="project-name" name="name" required minLength={2} placeholder="Website redesign" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              name="description"
              placeholder="Short project context for the team"
            />
          </div>
          <Button disabled={isLoading}>{isLoading ? "Creating..." : "Create project"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
