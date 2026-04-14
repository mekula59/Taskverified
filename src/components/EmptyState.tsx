import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 py-16 px-6 text-center">
    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
      <Icon className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="mb-1.5 font-heading text-base font-semibold">{title}</h3>
    <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
    {action}
  </div>
);

export default EmptyState;
