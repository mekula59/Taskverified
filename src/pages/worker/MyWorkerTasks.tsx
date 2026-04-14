import { mockTasks } from '@/data/mockData';
import TaskCard from '@/components/TaskCard';
import { Inbox } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MyWorkerTasks = () => {
  const myTasks = mockTasks.filter((t) => t.claimedBy === 'w1');

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-8">
        <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight md:text-3xl">My Tasks</h1>
        <p className="text-sm text-muted-foreground">Tasks you've claimed or completed.</p>
      </div>

      {myTasks.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myTasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No tasks yet"
          description="Browse available tasks and claim your first one."
          action={<Link to="/tasks"><Button>Browse Tasks</Button></Link>}
        />
      )}
    </div>
  );
};

export default MyWorkerTasks;
