import { useParams, Link } from 'react-router-dom';
import { mockSubmissions } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const ReviewSubmission = () => {
  const { id } = useParams();
  const submission = mockSubmissions.find((s) => s.id === id) || mockSubmissions[0];
  const [notes, setNotes] = useState('');

  return (
    <div className="container max-w-2xl py-8">
      <Link to="/poster/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <h1 className="mb-2 font-heading text-2xl font-bold">Review Submission</h1>
      <p className="mb-8 text-muted-foreground">{submission.taskTitle}</p>

      <div className="mb-6 rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Submitted by</p>
            <p className="font-heading font-semibold">{submission.workerName}</p>
          </div>
          <p className="text-xs text-muted-foreground">{new Date(submission.submittedAt).toLocaleString()}</p>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium">Proof Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{submission.proofText}</p>
        </div>

        {submission.proofLink && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium">Proof Link</h3>
            <a href={submission.proofLink} className="inline-flex items-center gap-1 text-sm text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              {submission.proofLink} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-medium">Checklist</h3>
          <div className="space-y-2">
            {submission.checklistItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${item.completed ? 'text-success' : 'text-muted-foreground'}`} />
                <span className={item.completed ? '' : 'text-muted-foreground'}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Label htmlFor="notes">Reviewer Notes</Label>
        <Textarea id="notes" rows={3} placeholder="Add feedback for the worker..." value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex gap-3">
        <Button size="lg" className="flex-1 gap-2">
          <CheckCircle2 className="h-4 w-4" /> Approve & Pay
        </Button>
        <Button size="lg" variant="outline" className="flex-1 gap-2 text-destructive border-destructive/20 hover:bg-destructive/5">
          <XCircle className="h-4 w-4" /> Reject
        </Button>
      </div>
    </div>
  );
};

export default ReviewSubmission;
