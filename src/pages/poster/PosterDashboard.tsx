import { Link } from 'react-router-dom';
import { Briefcase, DollarSign, Clock, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import { mockTasks, mockSubmissions, mockPosterProfile } from '@/data/mockData';

const PosterDashboard = () => {
  const postedTasks = mockTasks.filter((t) => t.posterId === 'p1');
  const pendingReviews = mockSubmissions.filter((s) => s.reviewStatus === 'pending');

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight md:text-3xl">Poster Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your tasks and review submissions.</p>
        </div>
        <Link to="/poster/create-task">
          <Button className="gap-2 shrink-0"><Plus className="h-4 w-4" /> Create Task</Button>
        </Link>
      </div>

      <div className="mb-10 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Posted" value={mockPosterProfile.tasksPosted} icon={Briefcase} />
        <StatCard label="Paid Out" value={mockPosterProfile.payoutsCompleted} icon={DollarSign} />
        <StatCard label="Pending" value={pendingReviews.length} icon={Clock} />
        <StatCard label="Avg Speed" value={mockPosterProfile.avgApprovalSpeed} icon={CheckCircle2} />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold">Pending Reviews</h2>
        <Link to="/poster/my-tasks" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
          All tasks <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {pendingReviews.length > 0 ? (
        <div className="space-y-3">
          {pendingReviews.map((sub) => (
            <Link key={sub.id} to={`/poster/review/${sub.id}`} className="group block rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-heading text-sm font-semibold group-hover:text-primary transition-colors">{sub.taskTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">by {sub.workerName} · {new Date(sub.submittedAt).toLocaleDateString()}</p>
                </div>
                <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                  Needs Review
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-card/50 p-10 text-center">
          <p className="text-sm text-muted-foreground">No submissions to review right now.</p>
        </div>
      )}
    </div>
  );
};

export default PosterDashboard;
