import { type ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <Card className="min-w-0 rounded-[1.15rem] border-border/70 bg-card/88 shadow-sm">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="break-words text-lg leading-tight">{title}</CardTitle>
        {description ? <CardDescription className="break-words leading-6">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="min-w-0 p-4 pt-0">{children}</CardContent>
    </Card>
  );
}
