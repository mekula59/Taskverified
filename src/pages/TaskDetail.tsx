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
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Task not found.</p>
        <Link to="/tasks"><Button variant="outline" className="mt-4">Back to tasks</Button></Link>
      </div>
    );
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="container max-w-3xl py-8">
      <Link to="/tasks" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to tasks
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <CategoryBadge category={task.category} />
        <TaskStatusBadge status={task.status} />
      </div>

      <h1 className="mb-4 font-heading text-2xl font-bold md:text-3xl">{task.title}</h1>

      <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> ${task.rewardAmount} {task.rewardCurrency}</span>
        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {daysLeft} days left</span>
        <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {task.claimsCount}/{task.maxClaims} claimed</span>
      </div>

      <div className="mb-8 rounded-lg border bg-card p-6">
        <h2 className="mb-3 font-heading text-base font-semibold">Description</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{task.description}</p>
      </div>

      <div className="mb-8 rounded-lg border bg-card p-6">
        <h2 className="mb-3 font-heading text-base font-semibold">Proof Requirements</h2>
        <ul className="space-y-2">
          {task.proofRequirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {req}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8 rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Posted by</p>
            <p className="font-heading font-semibold">{task.posterName}</p>
          </div>
          <p className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {task.status === 'open' && (
        <Link to={`/worker/submit/${task.id}`}>
          <Button size="lg" className="w-full">Claim This Task</Button>
        </Link>
      )}
    </div>
  );
};

export default TaskDetail;
