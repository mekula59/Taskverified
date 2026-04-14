import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockTasks } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Upload } from 'lucide-react';

const SubmissionForm = () => {
  const { taskId } = useParams();
  const task = mockTasks.find((t) => t.id === taskId) || mockTasks[0];
  const [proofText, setProofText] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [checklist, setChecklist] = useState(task.proofRequirements.map((r) => ({ label: r, completed: false })));

  const toggleCheck = (i: number) => {
    const copy = [...checklist];
    copy[i].completed = !copy[i].completed;
    setChecklist(copy);
  };

  const completedCount = checklist.filter((c) => c.completed).length;

  return (
    <div className="container max-w-2xl py-6 md:py-10">
      <Link to={`/tasks/${task.id}`} className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to task
      </Link>

      <div className="mb-8">
        <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight">Submit Proof</h1>
        <p className="text-sm text-muted-foreground">{task.title}</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proof Requirements</Label>
            <span className="text-xs text-muted-foreground">{completedCount}/{checklist.length} complete</span>
          </div>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <label key={i} className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${item.completed ? 'border-primary/20 bg-primary/5' : 'hover:bg-muted/50'}`}>
                <Checkbox checked={item.completed} onCheckedChange={() => toggleCheck(i)} />
                <span className={`text-sm ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="proofText" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proof Description</Label>
          <Textarea id="proofText" rows={5} placeholder="Describe what you did and your findings..." value={proofText} onChange={(e) => setProofText(e.target.value)} className="mt-2" />
        </div>

        <div>
          <Label htmlFor="proofLink" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proof Link (optional)</Label>
          <Input id="proofLink" placeholder="https://drive.google.com/..." value={proofLink} onChange={(e) => setProofLink(e.target.value)} className="mt-2" />
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attach File (optional)</Label>
          <div className="mt-2 flex items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors hover:border-primary/30 hover:bg-muted/30 cursor-pointer">
            <div>
              <Upload className="mx-auto mb-2.5 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground/60">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>
        </div>

        <Button size="lg" className="w-full h-12 text-sm">Submit Proof</Button>
      </form>
    </div>
  );
};

export default SubmissionForm;
