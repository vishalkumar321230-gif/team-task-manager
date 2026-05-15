"use client";

import { format } from "date-fns";
import { CalendarClock, Trash2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import type { ProjectRole, Task, TaskStatus } from "@/lib/types";
import { formatStatus, isOverdue } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

function priorityTone(priority: string) {
  if (priority === "HIGH") return "danger" as const;
  if (priority === "MEDIUM") return "warning" as const;
  return "muted" as const;
}

type Props = {
  tasks: Task[];
  role: ProjectRole;
  onChanged: () => void;
};

export function TaskBoard({ tasks, role, onChanged }: Props) {
  const { toast } = useToast();

  async function updateStatus(taskId: string, status: TaskStatus) {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      onChanged();
      toast({ title: "Task updated" });
    } catch (error) {
      toast({
        title: "Could not update task",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    }
  }

  async function deleteTask(taskId: string) {
    try {
      await api.delete(`/tasks/${taskId}`);
      onChanged();
      toast({ title: "Task deleted" });
    } catch (error) {
      toast({
        title: "Could not delete task",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    }
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center p-8 text-center">
          <div>
            <p className="font-medium">No tasks match this view</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a task or adjust the filters to see more work items.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {statuses.map((status) => {
        const statusTasks = tasks.filter((task) => task.status === status);
        return (
          <Card key={status} className="min-h-[24rem]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm">{formatStatus(status)}</CardTitle>
              <Badge tone="muted">{statusTasks.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <div
                    key={task.id}
                    className="rounded-lg border bg-background/60 p-4 transition hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold">{task.title}</p>
                        {task.description ? (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        ) : null}
                      </div>
                      {role === "ADMIN" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete task"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
                      {overdue ? <Badge tone="danger">Overdue</Badge> : null}
                      {task.dueDate ? (
                        <Badge tone="muted" className="gap-1">
                          <CalendarClock className="h-3 w-3" />
                          {format(new Date(task.dueDate), "MMM d")}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Assigned to</p>
                        <p className="truncate text-sm">{task.assignedTo?.name ?? "Unassigned"}</p>
                      </div>
                      <Select
                        className="w-36"
                        value={task.status}
                        onChange={(event) => updateStatus(task.id, event.target.value as TaskStatus)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
