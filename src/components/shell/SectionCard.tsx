import { type ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <Card className="tv-surface min-w-0 border-0">
      <CardHeader className="p-4 pb-2.5">
        <CardTitle className="break-words text-[1.02rem] leading-tight">{title}</CardTitle>
        {description ? <CardDescription className="break-words text-sm leading-6">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="min-w-0 p-4 pt-0">{children}</CardContent>
    </Card>
  );
}
