import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const VerificationStatus = () => (
  <div className="container max-w-lg py-16">
    <div className="rounded-xl border bg-card p-8 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <ShieldCheck className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mb-2 font-heading text-2xl font-bold">Verification</h1>
      <p className="mb-8 text-muted-foreground">Complete verification to start claiming tasks.</p>

      <div className="mb-8 space-y-3 text-left">
        {[
          { label: 'Email confirmed', done: true },
          { label: 'Profile completed', done: true },
          { label: 'Identity check', done: false },
        ].map((step) => (
          <div key={step.label} className="flex items-center gap-3 rounded-lg border p-4">
            <CheckCircle2 className={`h-5 w-5 ${step.done ? 'text-success' : 'text-muted-foreground'}`} />
            <span className={`text-sm font-medium ${step.done ? '' : 'text-muted-foreground'}`}>{step.label}</span>
            {!step.done && <Button size="sm" variant="outline" className="ml-auto">Start</Button>}
            {step.done && <span className="ml-auto text-xs text-success">Done</span>}
          </div>
        ))}
      </div>

      <Link to="/worker/dashboard">
        <Button className="gap-2">
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  </div>
);

export default VerificationStatus;
