import { mockWorkerProfile, mockReputationEvents } from '@/data/mockData';
import ReputationCard from '@/components/ReputationCard';
import { Star, TrendingUp, Award, Zap } from 'lucide-react';

const eventIcons: Record<string, typeof Star> = {
  task_completed: Star,
  task_approved: Award,
  verification_passed: TrendingUp,
  streak_bonus: Zap,
  task_rejected: Star,
};

const ReputationProfile = () => (
  <div className="container max-w-3xl py-6 md:py-10">
    <div className="mb-8">
      <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight md:text-3xl">Reputation Profile</h1>
      <p className="text-sm text-muted-foreground">Your trust and work history at a glance.</p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <ReputationCard profile={mockWorkerProfile} />

      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Strengths</h3>
        <div className="space-y-4">
          {mockWorkerProfile.categoryStrengths.map((cs) => (
            <div key={cs.category}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="capitalize font-medium">{cs.category}</span>
                <span className="text-xs text-muted-foreground">{cs.count} tasks</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${(cs.count / 25) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-10">
      <h2 className="mb-4 font-heading text-base font-semibold">Reputation History</h2>
      <div className="space-y-2.5">
        {mockReputationEvents.map((ev) => {
          const Icon = eventIcons[ev.type] || Star;
          return (
            <div key={ev.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ev.description}</p>
                <p className="text-xs text-muted-foreground">{ev.createdAt}</p>
              </div>
              <span className="font-heading text-sm font-bold text-primary shrink-0">+{ev.points}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default ReputationProfile;
