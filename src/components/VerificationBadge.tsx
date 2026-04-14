import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { VerificationStatus } from '@/types';

const config: Record<VerificationStatus, { icon: typeof ShieldCheck; label: string; className: string }> = {
  verified: { icon: ShieldCheck, label: 'Verified', className: 'text-primary' },
  pending: { icon: ShieldAlert, label: 'Pending', className: 'text-accent' },
  unverified: { icon: Shield, label: 'Unverified', className: 'text-muted-foreground' },
};

const VerificationBadge = ({ status, size = 'sm' }: { status: VerificationStatus; size?: 'sm' | 'lg' }) => {
  const { icon: Icon, label, className } = config[status];
  const iconSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${className} ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
      <Icon className={iconSize} />
      {label}
    </span>
  );
};

export default VerificationBadge;
