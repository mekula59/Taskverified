import { Link } from 'react-router-dom';
import { Clock, Users, DollarSign } from 'lucide-react';
import { Task } from '@/types';
import TaskStatusBadge from './TaskStatusBadge';
import CategoryBadge from './CategoryBadge';

const TaskCard = ({ task }: { task: Task }) => {
  const daysLeft = Math.max(0, Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <Link to={`/tasks/${task.id}`} className="group block">
      <div className="rounded-lg border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <CategoryBadge category={task.category} />
            <TaskStatusBadge status={task.status} />
          </div>
          <span className="whitespace-nowrap font-heading text-lg font-bold text-primary">
            ${task.rewardAmount}
          </span>
        </div>

        <h3 className="mb-2 font-heading text-base font-semibold leading-snug group-hover:text-primary transition-colors">
          {task.title}
        </h3>

        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {daysLeft}d left
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {task.claimsCount}/{task.maxClaims}
          </span>
          <span className="ml-auto text-xs">{task.posterName}</span>
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;
