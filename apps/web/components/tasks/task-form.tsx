"use client";

import { useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import type { Priority, Project, Task, TaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type Props = {
  project: Project;
  onCreated: (task: Task) => void;
};

export function TaskForm({ project, onCreated }: Props) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsLoading(true);

    try {
      const response = await api.post(`/projects/${project.id}/tasks`, {
        title: String(formData.get("title")),
        description: String(formData.get("description") || ""),
        dueDate: formData.get("dueDate") ? new Date(String(formData.get("dueDate"))).toISOString() : null,
        priority: formData.get("priority") as Priority,
        status: formData.get("status") as TaskStatus,
        assignedToId: formData.get("assignedToId") || null
      });

      onCreated(response.data.task);
      form.reset();
      toast({ title: "Task created" });
    } catch (error) {
      toast({
        title: "Could not create task",
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
        <CardTitle>Create Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 xl:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" name="title" required minLength={2} placeholder="Review launch copy" />
          </div>
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea id="task-description" name="description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-due">Due date</Label>
            <Input id="task-due" name="dueDate" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-assignee">Assignee</Label>
            <Select id="task-assignee" name="assignedToId" defaultValue="">
              <option value="">Unassigned</option>
              {project.members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-priority">Priority</Label>
            <Select id="task-priority" name="priority" defaultValue="MEDIUM">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-status">Status</Label>
            <Select id="task-status" name="status" defaultValue="TODO">
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </Select>
          </div>
          <div className="xl:col-span-2">
            <Button disabled={isLoading}>{isLoading ? "Creating..." : "Create task"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
