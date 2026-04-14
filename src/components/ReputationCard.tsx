import { Star, CheckCircle2, Percent } from 'lucide-react';
import { Profile } from '@/types';
import VerificationBadge from './VerificationBadge';

const ReputationCard = ({ profile }: { profile: Profile }) => (
  <div className="rounded-xl border bg-card p-6">
    <div className="mb-5 flex items-center justify-between">
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reputation</h3>
      <VerificationBadge status={profile.verificationStatus} />
    </div>

    <div className="mb-5 flex items-baseline gap-2">
      <Star className="h-5 w-5 text-accent self-center" />
      <span className="font-heading text-4xl font-bold tracking-tight">{profile.reputationScore}</span>
      <span className="text-sm text-muted-foreground">/ 100</span>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-muted/50 p-3.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
        </div>
        <span className="font-heading text-xl font-bold">{profile.tasksCompleted}</span>
      </div>
      <div className="rounded-lg bg-muted/50 p-3.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <Percent className="h-3.5 w-3.5" /> Approval
        </div>
        <span className="font-heading text-xl font-bold">{profile.approvalRate}%</span>
      </div>
    </div>
  </div>
);

export default ReputationCard;
