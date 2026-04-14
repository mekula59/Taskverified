import { TaskStatus } from '@/types';

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-primary/10 text-primary' },
  claimed: { label: 'Claimed', className: 'bg-accent/10 text-accent' },
  in_progress: { label: 'In Progress', className: 'bg-accent/10 text-accent' },
  submitted: { label: 'Submitted', className: 'bg-primary/10 text-primary' },
  under_review: { label: 'Under Review', className: 'bg-accent/10 text-accent' },
  approved: { label: 'Approved', className: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
  completed: { label: 'Completed', className: 'bg-success/10 text-success' },
  expired: { label: 'Expired', className: 'bg-muted text-muted-foreground' },
};

const TaskStatusBadge = ({ status }: { status: TaskStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default TaskStatusBadge;
