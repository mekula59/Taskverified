import { Link } from 'react-router-dom';
import { Briefcase, Wrench, Shield } from 'lucide-react';

const RoleSelect = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <div className="w-full max-w-md text-center">
      <Link to="/" className="mb-6 inline-flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-heading text-xl font-bold">TaskVerified</span>
      </Link>
      <h1 className="mt-4 mb-2 font-heading text-2xl font-bold">How will you use TaskVerified?</h1>
      <p className="mb-10 text-sm text-muted-foreground">You can always switch later.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/profile-setup?role=worker"
          className="group rounded-xl border-2 bg-card p-8 text-center transition-all hover:border-primary hover:shadow-md"
        >
          <Wrench className="mx-auto mb-4 h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
          <h3 className="mb-1 font-heading text-lg font-semibold">I'm a Worker</h3>
          <p className="text-sm text-muted-foreground">Complete tasks, submit proof, earn money</p>
        </Link>

        <Link
          to="/profile-setup?role=poster"
          className="group rounded-xl border-2 bg-card p-8 text-center transition-all hover:border-primary hover:shadow-md"
        >
          <Briefcase className="mx-auto mb-4 h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
          <h3 className="mb-1 font-heading text-lg font-semibold">I'm a Poster</h3>
          <p className="text-sm text-muted-foreground">Post tasks, review work, release payouts</p>
        </Link>
      </div>
    </div>
  </div>
);

export default RoleSelect;
