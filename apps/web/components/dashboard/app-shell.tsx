"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FolderKanban, LayoutDashboard, LogOut, Plus, Users } from "lucide-react";
import { api } from "@/lib/api";
import type { Project, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [meResponse, projectResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/projects")
        ]);

        if (!mounted) return;
        setUser(meResponse.data.user);
        setProjects(projectResponse.data.projects);
      } catch {
        router.replace("/login");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function logout() {
    await api.post("/auth/logout");
    toast({ title: "Signed out" });
    router.replace("/login");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-b bg-background/80 backdrop-blur lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between px-5 lg:h-20">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">TeamFlow</p>
              <p className="text-xs text-muted-foreground">Task Manager</p>
            </div>
          </Link>
          <Button className="lg:hidden" variant="ghost" size="icon" onClick={logout} aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-fit items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden px-5 py-5 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Projects
            </p>
            <Link href="/projects">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
          <div className="space-y-1">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block truncate rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {project.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden border-t p-5 lg:block">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          <Button className="mt-4 w-full" variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 md:px-8 lg:px-10">{children}</main>
    </div>
  );
}
