import * as React from "react";
import { cn } from "@/lib/utils";

const toneMap = {
  default: "border-primary/30 bg-primary/10 text-primary",
  muted: "border-border bg-muted text-muted-foreground",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  danger: "border-red-400/30 bg-red-400/10 text-red-200",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
};

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof toneMap }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        toneMap[tone],
        className
      )}
      {...props}
    />
  );
}
