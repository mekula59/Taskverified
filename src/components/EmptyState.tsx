import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 rounded-full bg-muted p-4">
      <Icon className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="mb-1 font-heading text-lg font-semibold">{title}</h3>
    <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
    {action}
  </div>
);

export default EmptyState;
