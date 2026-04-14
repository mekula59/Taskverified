import { Link } from 'react-router-dom';
import { DollarSign, CheckCircle2, Clock, Star, ArrowRight } from 'lucide-react';
import StatCard from '@/components/StatCard';
import TaskCard from '@/components/TaskCard';
import ReputationCard from '@/components/ReputationCard';
import { mockTasks, mockWorkerProfile } from '@/data/mockData';

const WorkerDashboard = () => {
  const activeTasks = mockTasks.filter((t) => t.claimedBy === 'w1');

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-1 font-heading text-2xl font-bold">Welcome back, Alex</h1>
        <p className="text-muted-foreground">Here's your work summary.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tasks Completed" value={mockWorkerProfile.tasksCompleted} icon={CheckCircle2} detail="94% approval rate" />
        <StatCard label="Total Earnings" value={`$${mockWorkerProfile.totalEarnings}`} icon={DollarSign} detail="4 payouts pending" />
        <StatCard label="Reputation" value={mockWorkerProfile.reputationScore} icon={Star} detail="Top 15% of workers" />
        <StatCard label="Active Tasks" value={activeTasks.length} icon={Clock} detail="2 due this week" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Active Tasks</h2>
            <Link to="/worker/my-tasks" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {activeTasks.length > 0 ? (
            <div className="grid gap-4">
              {activeTasks.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              <p>No active tasks. <Link to="/tasks" className="text-primary hover:underline">Browse available tasks</Link></p>
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
