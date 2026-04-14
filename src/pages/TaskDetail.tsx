import { useParams, Link } from 'react-router-dom';
import { mockTasks } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import TaskStatusBadge from '@/components/TaskStatusBadge';
import CategoryBadge from '@/components/CategoryBadge';
import { Clock, Users, DollarSign, ArrowLeft, CheckCircle2 } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const task = mockTasks.find((t) => t.id === id);

  if (!task) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Task not found.</p>
        <Link to="/tasks"><Button variant="outline" className="mt-4">Back to tasks</Button></Link>
      </div>
    );
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="container max-w-3xl py-6 md:py-10">
      <Link to="/tasks" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to tasks
      </Link>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={task.category} />
        <TaskStatusBadge status={task.status} />
      </div>

      <h1 className="mb-5 font-heading text-2xl font-bold tracking-tight md:text-3xl">{task.title}</h1>

      {/* Key stats bar */}
      <div className="mb-8 flex flex-wrap gap-5 rounded-xl border bg-card px-5 py-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-heading text-base font-bold">${task.rewardAmount}</p>
            <p className="text-[11px] text-muted-foreground">{task.rewardCurrency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-heading text-base font-bold">{daysLeft}d</p>
            <p className="text-[11px] text-muted-foreground">remaining</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-heading text-base font-bold">{task.claimsCount}/{task.maxClaims}</p>
            <p className="text-[11px] text-muted-foreground">claimed</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border bg-card p-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h2>
        <p className="text-sm leading-relaxed">{task.description}</p>
      </div>

      <div className="mb-6 rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proof Requirements</h2>
        <ul className="space-y-2.5">
          {task.proofRequirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {req}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8 flex items-center justify-between rounded-xl border bg-card px-6 py-4">
        <div>
          <p className="text-xs text-muted-foreground">Posted by</p>
          <p className="font-heading text-sm font-semibold">{task.posterName}</p>
        </div>
        <p className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</p>
      </div>

      {task.status === 'open' && (
        <Link to={`/worker/submit/${task.id}`}>
          <Button size="lg" className="w-full h-12 text-sm">Claim This Task</Button>
        </Link>
      )}
    </div>
  );
};

export default TaskDetail;
