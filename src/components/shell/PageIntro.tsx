import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageIntro({ eyebrow, title, description, actions }: PageIntroProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl space-y-4">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {eyebrow}
        </Badge>
        <div className="space-y-3">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
