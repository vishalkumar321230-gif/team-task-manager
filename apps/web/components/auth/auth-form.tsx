"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      ...(isSignup ? { name: String(formData.get("name")) } : {}),
      email: String(formData.get("email")),
      password: String(formData.get("password"))
    };

    setIsLoading(true);
    try {
      await api.post(`/auth/${mode}`, payload);
      toast({
        title: isSignup ? "Account created" : "Welcome back",
        description: "Opening your workspace now."
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">{isSignup ? "Create your account" : "Sign in"}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {isSignup
            ? "Start managing projects, members, and team tasks."
            : "Continue to your project dashboard."}
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignup ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Avery Johnson" required minLength={2} />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
          <Button className="w-full" disabled={isLoading}>
            {isLoading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <Link className="font-medium text-primary hover:underline" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
