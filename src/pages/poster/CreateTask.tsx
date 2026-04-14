import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { taskCategories } from '@/data/mockData';

const CreateTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('testing');
  const [reward, setReward] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxClaims, setMaxClaims] = useState('5');
  const [requirements, setRequirements] = useState<string[]>(['']);

  const addRequirement = () => setRequirements([...requirements, '']);
  const removeRequirement = (i: number) => setRequirements(requirements.filter((_, idx) => idx !== i));
  const updateRequirement = (i: number, val: string) => {
    const copy = [...requirements];
    copy[i] = val;
    setRequirements(copy);
  };

  return (
    <div className="container max-w-2xl py-6 md:py-10">
      <Link to="/poster/dashboard" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight">Create a Task</h1>
        <p className="text-sm text-muted-foreground">Define the work, set proof requirements, and add a reward.</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <div>
          <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task Title</Label>
          <Input id="title" placeholder="Test signup flow and submit screenshots" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" />
        </div>

        <div>
          <Label htmlFor="desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
          <Textarea id="desc" rows={5} placeholder="Describe exactly what the worker needs to do..." value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
            <select className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={category} onChange={(e) => setCategory(e.target.value)}>
              {taskCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="reward" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reward (USD)</Label>
            <Input id="reward" type="number" placeholder="25" value={reward} onChange={(e) => setReward(e.target.value)} className="mt-2" />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="deadline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deadline</Label>
            <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="maxClaims" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Claims</Label>
            <Input id="maxClaims" type="number" placeholder="5" value={maxClaims} onChange={(e) => setMaxClaims(e.target.value)} className="mt-2" />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proof Requirements</Label>
          <div className="mt-3 space-y-2.5">
            {requirements.map((req, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="e.g., Screenshot of completed flow" value={req} onChange={(e) => updateRequirement(i, e.target.value)} />
                {requirements.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRequirement(i)} className="shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRequirement} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add requirement
            </Button>
          </div>
        </div>

        <Button size="lg" className="w-full h-12 text-sm">Publish Task</Button>
      </form>
    </div>
  );
};

export default CreateTask;
