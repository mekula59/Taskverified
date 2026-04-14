import { DollarSign, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { mockPayouts } from '@/data/mockData';

const Payments = () => {
  const totalPaid = mockPayouts.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pending = mockPayouts.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-heading text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Track payouts to workers.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Paid" value={`$${totalPaid}`} icon={DollarSign} />
        <StatCard label="Pending" value={`$${pending}`} icon={Clock} />
        <StatCard label="Completed" value={mockPayouts.filter((p) => p.status === 'completed').length} icon={CheckCircle2} />
      </div>

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

export default Payments;
