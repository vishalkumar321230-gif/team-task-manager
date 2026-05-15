import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  note?: string;
};

export function StatCard({ label, value, icon: Icon, note }: Props) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
            {note ? <p className="mt-2 text-xs text-muted-foreground">{note}</p> : null}
          </div>
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
