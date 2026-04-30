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
    <Card className="rounded-[1rem] border-border/60 bg-card/64 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3.5 pb-2">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <CardTitle className="text-xl">{value}</CardTitle>
        </div>
        {icon ? <div className="text-primary">{icon}</div> : null}
      </CardHeader>
      <CardContent className="p-3.5 pt-0">
        <p className="text-sm leading-5 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
