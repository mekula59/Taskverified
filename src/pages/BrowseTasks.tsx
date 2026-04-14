import { useState } from 'react';
import { mockTasks, taskCategories } from '@/data/mockData';
import TaskCard from '@/components/TaskCard';
import EmptyState from '@/components/EmptyState';
import { Input } from '@/components/ui/input';
import { Search, Inbox } from 'lucide-react';

const BrowseTasks = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const openTasks = mockTasks.filter((t) => t.status === 'open');
  const filtered = openTasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || t.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-8">
        <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight md:text-3xl">Browse Tasks</h1>
        <p className="text-sm text-muted-foreground">Find paid tasks from verified startups and communities.</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-none">
          <button
            onClick={() => setCategory('all')}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${category === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'border text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            All
          </button>
          {taskCategories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${category === c.value ? 'bg-primary text-primary-foreground shadow-sm' : 'border text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No tasks found"
          description="Try adjusting your search or filters to find available tasks."
        />
      )}
    </div>
  );
};

export default BrowseTasks;
