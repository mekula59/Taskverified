import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { Task } from '@/types';
import TaskStatusBadge from './TaskStatusBadge';
import CategoryBadge from './CategoryBadge';

const TaskCard = ({ task }: { task: Task }) => {
  const daysLeft = Math.max(0, Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <Link to={`/tasks/${task.id}`} className="group block">
      <div className="relative rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5">
        {/* Reward badge - anchored top right */}
        <div className="absolute -top-2.5 right-4">
          <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 font-heading text-xs font-bold text-primary-foreground shadow-sm">
            ${task.rewardAmount}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-2 pt-1">
          <CategoryBadge category={task.category} />
          <TaskStatusBadge status={task.status} />
        </div>

        <h3 className="mb-1.5 font-heading text-[15px] font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {task.title}
        </h3>

        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
          {task.description}
        </p>

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-3.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {daysLeft}d left
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {task.claimsCount}/{task.maxClaims}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{task.posterName}</span>
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;
