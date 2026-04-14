import { mockTasks } from '@/data/mockData';
import TaskCard from '@/components/TaskCard';
import EmptyState from '@/components/EmptyState';
import { Search, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const AvailableTasks = () => {
  const [search, setSearch] = useState('');
  const openTasks = mockTasks.filter((t) => t.status === 'open');
  const filtered = openTasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-8">
        <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight md:text-3xl">Available Tasks</h1>
        <p className="text-sm text-muted-foreground">Tasks you can claim right now.</p>
      </div>
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      ) : (
        <EmptyState icon={Inbox} title="No tasks available" description="Check back soon for new tasks from verified posters." />
      )}
    </div>
  );
};

export default AvailableTasks;
