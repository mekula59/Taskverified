import { DollarSign, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { mockPayouts, mockWorkerProfile } from '@/data/mockData';

const Earnings = () => {
  const completed = mockPayouts.filter((p) => p.status === 'completed');
  const pending = mockPayouts.filter((p) => p.status === 'pending');

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-heading text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">Track your payouts and earning history.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Earned" value={`$${mockWorkerProfile.totalEarnings}`} icon={DollarSign} />
        <StatCard label="Pending" value={`$${pending.reduce((s, p) => s + p.amount, 0)}`} icon={Clock} />
        <StatCard label="Completed Payouts" value={completed.length} icon={CheckCircle2} />
      </div>

      <h2 className="mb-4 font-heading text-lg font-semibold">Payout History</h2>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockPayouts.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{p.taskTitle}</td>
                  <td className="px-4 py-3">${p.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === 'completed' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                    }`}>
                      {p.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.createdAt}</td>
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
