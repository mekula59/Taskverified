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

  return (
    <div className="container max-w-2xl py-8">
      <Link to={`/tasks/${task.id}`} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to task
      </Link>

      <h1 className="mb-2 font-heading text-2xl font-bold">Submit Proof</h1>
      <p className="mb-8 text-muted-foreground">{task.title}</p>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div>
          <Label>Proof Requirements Checklist</Label>
          <div className="mt-2 space-y-2">
            {checklist.map((item, i) => (
              <label key={i} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <Checkbox checked={item.completed} onCheckedChange={() => toggleCheck(i)} />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="proofText">Proof Description</Label>
          <Textarea id="proofText" rows={5} placeholder="Describe what you did and your findings..." value={proofText} onChange={(e) => setProofText(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="proofLink">Proof Link (optional)</Label>
          <Input id="proofLink" placeholder="https://drive.google.com/..." value={proofLink} onChange={(e) => setProofLink(e.target.value)} />
        </div>

        <div>
          <Label>Attach File (optional)</Label>
          <div className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
            <div>
              <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
            </div>
          </div>
        </div>

        <Button size="lg" className="w-full">Submit Proof</Button>
      </form>
    </div>
  );
};

export default SubmissionForm;
