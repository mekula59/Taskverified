import { mockWorkerProfile, mockReputationEvents } from '@/data/mockData';
import ReputationCard from '@/components/ReputationCard';
import VerificationBadge from '@/components/VerificationBadge';
import { Star, TrendingUp, Award, Zap } from 'lucide-react';

const eventIcons: Record<string, typeof Star> = {
  task_completed: Star,
  task_approved: Award,
  verification_passed: TrendingUp,
  streak_bonus: Zap,
  task_rejected: Star,
};

const ReputationProfile = () => (
  <div className="container max-w-3xl py-8">
    <div className="mb-8">
      <h1 className="mb-2 font-heading text-2xl font-bold">Reputation Profile</h1>
      <p className="text-muted-foreground">Your trust and work history at a glance.</p>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <ReputationCard profile={mockWorkerProfile} />

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-heading text-base font-semibold">Category Strengths</h3>
        <div className="space-y-3">
          {mockWorkerProfile.categoryStrengths.map((cs) => (
            <div key={cs.category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="capitalize">{cs.category}</span>
                <span className="text-muted-foreground">{cs.count} tasks</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${(cs.count / 25) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="mt-8">
      <h2 className="mb-4 font-heading text-lg font-semibold">Reputation History</h2>
      <div className="space-y-3">
        {mockReputationEvents.map((ev) => {
          const Icon = eventIcons[ev.type] || Star;
          return (
            <div key={ev.id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{ev.description}</p>
                <p className="text-xs text-muted-foreground">{ev.createdAt}</p>
              </div>
              <span className="font-heading text-sm font-semibold text-primary">+{ev.points}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default ReputationProfile;
