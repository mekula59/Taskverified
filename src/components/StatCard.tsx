import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  detail?: string;
}

const StatCard = ({ label, value, icon: Icon, detail }: StatCardProps) => (
  <div className="rounded-xl border bg-card p-5 transition-colors">
    <div className="mb-1 flex items-center justify-between">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </div>
    <p className="font-heading text-2xl font-bold tracking-tight">{value}</p>
    {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
  </div>
);

export default StatCard;
