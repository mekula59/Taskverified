import { Link } from 'react-router-dom';
import { Briefcase, DollarSign, Clock, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import { mockTasks, mockSubmissions, mockPosterProfile } from '@/data/mockData';

const PosterDashboard = () => {
  const postedTasks = mockTasks.filter((t) => t.posterId === 'p1');
  const pendingReviews = mockSubmissions.filter((s) => s.reviewStatus === 'pending');

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 font-heading text-2xl font-bold">Poster Dashboard</h1>
          <p className="text-muted-foreground">Manage your tasks and review submissions.</p>
        </div>
        <Link to="/poster/create-task">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Create Task</Button>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tasks Posted" value={mockPosterProfile.tasksPosted} icon={Briefcase} />
        <StatCard label="Payouts Completed" value={mockPosterProfile.payoutsCompleted} icon={DollarSign} />
        <StatCard label="Pending Reviews" value={pendingReviews.length} icon={Clock} />
        <StatCard label="Avg Approval Speed" value={mockPosterProfile.avgApprovalSpeed} icon={CheckCircle2} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Pending Reviews</h2>
        <Link to="/poster/my-tasks" className="text-sm text-primary hover:underline flex items-center gap-1">
          View all tasks <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {pendingReviews.length > 0 ? (
        <div className="space-y-3">
          {pendingReviews.map((sub) => (
            <Link key={sub.id} to={`/poster/review/${sub.id}`} className="block rounded-lg border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-sm font-semibold">{sub.taskTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">by {sub.workerName} · {new Date(sub.submittedAt).toLocaleDateString()}</p>
                </div>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">Needs Review</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No submissions to review right now.
        </div>
      )}
    </div>
  );
};

export default PosterDashboard;
