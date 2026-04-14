import { Link } from 'react-router-dom';
import { DollarSign, CheckCircle2, Clock, Star, ArrowRight } from 'lucide-react';
import StatCard from '@/components/StatCard';
import TaskCard from '@/components/TaskCard';
import ReputationCard from '@/components/ReputationCard';
import { mockTasks, mockWorkerProfile } from '@/data/mockData';

const WorkerDashboard = () => {
  const activeTasks = mockTasks.filter((t) => t.claimedBy === 'w1');

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-8">
        <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight md:text-3xl">Welcome back, Alex</h1>
        <p className="text-sm text-muted-foreground">Here's your work summary.</p>
      </div>

      <div className="mb-10 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Completed" value={mockWorkerProfile.tasksCompleted} icon={CheckCircle2} detail="94% approval rate" />
        <StatCard label="Earned" value={`$${mockWorkerProfile.totalEarnings}`} icon={DollarSign} detail="4 payouts pending" />
        <StatCard label="Reputation" value={mockWorkerProfile.reputationScore} icon={Star} detail="Top 15% of workers" />
        <StatCard label="Active" value={activeTasks.length} icon={Clock} detail="2 due this week" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">Active Tasks</h2>
            <Link to="/worker/my-tasks" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {activeTasks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeTasks.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-card/50 p-10 text-center">
              <p className="text-sm text-muted-foreground">No active tasks. <Link to="/tasks" className="text-primary hover:underline font-medium">Browse available tasks</Link></p>
            </div>
          )}
        </div>
        <div>
          <ReputationCard profile={mockWorkerProfile} />
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
