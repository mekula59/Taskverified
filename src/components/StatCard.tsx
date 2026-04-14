import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  detail?: string;
}

const StatCard = ({ label, value, icon: Icon, detail }: StatCardProps) => (
  <div className="rounded-lg border bg-card p-5">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <p className="font-heading text-2xl font-bold">{value}</p>
    {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
  </div>
);

export default StatCard;
