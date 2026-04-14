import { mockTasks } from '@/data/mockData';
import TaskCard from '@/components/TaskCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const MyPostedTasks = () => {
  const postedTasks = mockTasks.filter((t) => t.posterId === 'p1');

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight md:text-3xl">My Posted Tasks</h1>
          <p className="text-sm text-muted-foreground">Tasks you've created and their current status.</p>
        </div>
        <Link to="/poster/create-task">
          <Button className="gap-2 shrink-0"><Plus className="h-4 w-4" /> New Task</Button>
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {postedTasks.map((t) => <TaskCard key={t.id} task={t} />)}
      </div>
    </div>
  );
};

export default MyPostedTasks;
