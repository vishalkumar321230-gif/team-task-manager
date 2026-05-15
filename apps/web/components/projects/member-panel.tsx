"use client";

import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

type Props = {
  project: Project;
  currentRole: "ADMIN" | "MEMBER";
  onProjectChange: (project: Project) => void;
};

export function MemberPanel({ project, currentRole, onProjectChange }: Props) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const isAdmin = currentRole === "ADMIN";

  async function refreshProject() {
    const response = await api.get(`/projects/${project.id}`);
    onProjectChange(response.data.project);
  }

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api.post(`/projects/${project.id}/members`, { email, role });
      setEmail("");
      await refreshProject();
      toast({ title: "Member added" });
    } catch (error) {
      toast({
        title: "Could not add member",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    }
  }

  async function removeMember(userId: string) {
    try {
      await api.post(`/projects/${project.id}/members/${userId}/remove`);
      await refreshProject();
      toast({ title: "Member removed" });
    } catch (error) {
      toast({
        title: "Could not remove member",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdmin ? (
          <form className="grid gap-3 md:grid-cols-[1fr_9rem_auto]" onSubmit={addMember}>
            <div className="space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="member@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <Select id="member-role" value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>
            <Button className="self-end">
              <UserPlus className="h-4 w-4" />
              Add
            </Button>
          </form>
        ) : null}

        <div className="space-y-2">
          {project.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{member.user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={member.role === "ADMIN" ? "default" : "muted"}>{member.role}</Badge>
                {isAdmin ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove member"
                    onClick={() => removeMember(member.user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
