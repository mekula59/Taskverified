import { DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { mockPayouts, mockWorkerProfile } from '@/data/mockData';

const Earnings = () => {
  const completed = mockPayouts.filter((p) => p.status === 'completed');
  const pending = mockPayouts.filter((p) => p.status === 'pending');

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-8">
        <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight md:text-3xl">Earnings</h1>
        <p className="text-sm text-muted-foreground">Track your payouts and earning history.</p>
      </div>

      <div className="mb-10 grid gap-3 grid-cols-2 sm:grid-cols-3">
        <StatCard label="Total Earned" value={`$${mockWorkerProfile.totalEarnings}`} icon={DollarSign} />
        <StatCard label="Pending" value={`$${pending.reduce((s, p) => s + p.amount, 0)}`} icon={Clock} />
        <StatCard label="Payouts" value={completed.length} icon={CheckCircle2} />
      </div>

      <h2 className="mb-4 font-heading text-base font-semibold">Payout History</h2>
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockPayouts.map((p) => (
                <tr key={p.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3.5 font-medium">{p.taskTitle}</td>
                  <td className="px-5 py-3.5 font-heading font-semibold">${p.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.status === 'completed' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                    }`}>
                      {p.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{p.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
