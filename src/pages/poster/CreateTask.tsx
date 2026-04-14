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
    <div className="container max-w-2xl py-8">
      <Link to="/poster/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <h1 className="mb-2 font-heading text-2xl font-bold">Create a Task</h1>
      <p className="mb-8 text-muted-foreground">Define the work, set proof requirements, and add a reward.</p>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div>
          <Label htmlFor="title">Task Title</Label>
          <Input id="title" placeholder="Test signup flow and submit screenshots" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" rows={5} placeholder="Describe exactly what the worker needs to do..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <select className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              {taskCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="reward">Reward (USD)</Label>
            <Input id="reward" type="number" placeholder="25" value={reward} onChange={(e) => setReward(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="maxClaims">Max Claims</Label>
            <Input id="maxClaims" type="number" placeholder="5" value={maxClaims} onChange={(e) => setMaxClaims(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Proof Requirements</Label>
          <div className="mt-2 space-y-2">
            {requirements.map((req, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="e.g., Screenshot of completed flow" value={req} onChange={(e) => updateRequirement(i, e.target.value)} />
                {requirements.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRequirement(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRequirement} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add requirement
            </Button>
          </div>
        </div>

        <Button size="lg" className="w-full">Publish Task</Button>
      </form>
    </div>
  );
};

export default CreateTask;
