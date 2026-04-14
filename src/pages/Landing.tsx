import { Link } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle2, DollarSign, Star, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TopNav from '@/components/layout/TopNav';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      {/* Hero */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            Human-verified micro-work platform
          </div>
          <h1 className="mb-6 font-heading text-4xl font-bold leading-tight md:text-6xl md:leading-tight">
            Hire real humans for small tasks, not bot farms
          </h1>
          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            TaskVerified helps startups and communities post paid tasks, verify workers, review proof, and release payouts — with trust built in.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/signup">
              <Button size="lg" className="gap-2 px-8">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/tasks">
              <Button variant="outline" size="lg" className="px-8">
                Browse Tasks
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-card/50">
        <div className="container py-20">
          <h2 className="mb-12 text-center font-heading text-2xl font-bold md:text-3xl">
            How it works
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Post a task', desc: 'Define the work, set proof requirements, and add a reward.' },
              { step: '02', title: 'Workers deliver proof', desc: 'Verified workers claim tasks and submit proof of completion.' },
              { step: '03', title: 'Review & pay', desc: 'Approve submissions, release payouts, and build trust scores.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-heading text-sm font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <h2 className="mb-12 text-center font-heading text-2xl font-bold md:text-3xl">
          Built for trust
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {[
            { icon: CheckCircle2, title: 'Proof-based completion', desc: 'Every task requires verifiable proof — screenshots, links, structured notes.' },
            { icon: Shield, title: 'Human verification', desc: 'Workers verify their identity before claiming tasks. No bots, no fakes.' },
            { icon: DollarSign, title: 'Clear payouts', desc: 'Funds are held until proof is approved. No disputes, no ambiguity.' },
            { icon: Star, title: 'Portable reputation', desc: 'Workers build trust scores that follow them across tasks and communities.' },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border bg-card p-6">
              <f.icon className="mb-3 h-5 w-5 text-primary" />
              <h3 className="mb-1 font-heading text-base font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t bg-card/50">
        <div className="container py-20">
          <h2 className="mb-4 text-center font-heading text-2xl font-bold md:text-3xl">
            Made for startups & communities
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-muted-foreground">
            Post real tasks. Get real results. From testing flows to clipping videos.
          </p>
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            {[
              'Test a signup flow and submit screenshots',
              'Review onboarding and send structured notes',
              'Join a beta and complete setup steps',
              'Clip highlights from a live session',
              'Submit local market research with proof',
              'Moderate a community event and report metrics',
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-10 text-center md:p-14">
          <h2 className="mb-4 font-heading text-2xl font-bold md:text-3xl">
            Ready to get real work done?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join TaskVerified today. Post your first task or start earning.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2 px-8">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center gap-4 py-8 text-center text-sm text-muted-foreground md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-heading font-semibold text-foreground">TaskVerified</span>
          </div>
          <p>© 2026 TaskVerified. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
