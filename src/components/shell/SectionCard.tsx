import { type ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <Card className="min-w-0 border-border/70 bg-card/85 shadow-sm">
      <CardHeader>
        <CardTitle className="break-words text-xl leading-tight">{title}</CardTitle>
        {description ? <CardDescription className="break-words leading-6">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  );
}
