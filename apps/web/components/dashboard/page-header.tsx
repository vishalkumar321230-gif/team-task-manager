import { Button } from "@/components/ui/button";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
};

export function PageHeader({ eyebrow, title, description, action }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}
