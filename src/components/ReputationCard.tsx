import { Star, TrendingUp, CheckCircle2, Percent } from 'lucide-react';
import { Profile } from '@/types';
import VerificationBadge from './VerificationBadge';

const ReputationCard = ({ profile }: { profile: Profile }) => (
  <div className="rounded-lg border bg-card p-6">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-heading text-base font-semibold">Reputation</h3>
      <VerificationBadge status={profile.verificationStatus} />
    </div>

    <div className="mb-4 flex items-center gap-2">
      <Star className="h-5 w-5 text-accent" />
      <span className="font-heading text-3xl font-bold">{profile.reputationScore}</span>
      <span className="text-sm text-muted-foreground">/ 100</span>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-md bg-muted/50 p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
        </div>
        <span className="font-heading text-lg font-semibold">{profile.tasksCompleted}</span>
      </div>
      <div className="rounded-md bg-muted/50 p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <Percent className="h-3.5 w-3.5" /> Approval
        </div>
        <span className="font-heading text-lg font-semibold">{profile.approvalRate}%</span>
      </div>
    </div>
  </div>
);

export default ReputationCard;
