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
    <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 max-w-2xl space-y-2">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em]">
          {eyebrow}
        </Badge>
        <div className="space-y-1">
          <h1 className="max-w-3xl break-words text-[1.7rem] font-semibold leading-tight tracking-tight md:text-[1.95rem]">{title}</h1>
          <p className="max-w-2xl break-words text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
