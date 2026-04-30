import { type ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
}

export function MetricCard({ label, value, detail, icon }: MetricCardProps) {
  return (
    <Card className="rounded-2xl border-0 bg-white/72 shadow-none ring-1 ring-slate-200/75">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3 pb-1.5">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <CardTitle className="text-lg leading-tight">{value}</CardTitle>
        </div>
        {icon ? <div className="text-primary/78">{icon}</div> : null}
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-xs leading-5 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
