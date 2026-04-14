import { useParams, Link } from 'react-router-dom';
import { mockSubmissions } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, User, Calendar } from 'lucide-react';
import { useState } from 'react';

const ReviewSubmission = () => {
  const { id } = useParams();
  const submission = mockSubmissions.find((s) => s.id === id) || mockSubmissions[0];
  const [notes, setNotes] = useState('');

  const completedCount = submission.checklistItems.filter((i) => i.completed).length;
  const totalCount = submission.checklistItems.length;

  return (
    <div className="container max-w-2xl py-6 md:py-10">
      <Link to="/poster/dashboard" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="mb-1 font-heading text-2xl font-bold tracking-tight">Review Submission</h1>
        <p className="text-sm text-muted-foreground">{submission.taskTitle}</p>
      </div>

      {/* Submission metadata */}
      <div className="mb-6 flex flex-wrap gap-4 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{submission.workerName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(submission.submittedAt).toLocaleString()}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-sm">
          <span className={`font-medium ${completedCount === totalCount ? 'text-success' : 'text-accent'}`}>
            {completedCount}/{totalCount} checklist items
          </span>
        </div>
      </div>

      {/* Proof content */}
      <div className="mb-6 space-y-5 rounded-xl border bg-card p-6">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proof Description</h3>
          <p className="text-sm leading-relaxed">{submission.proofText}</p>
        </div>

        {submission.proofLink && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proof Link</h3>
            <a href={submission.proofLink} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              {submission.proofLink} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Checklist</h3>
          <div className="space-y-2">
            {submission.checklistItems.map((item, i) => (
              <div key={i} className={`flex items-center gap-2.5 rounded-lg p-2.5 text-sm ${item.completed ? 'bg-success/5' : 'bg-muted/50'}`}>
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${item.completed ? 'text-success' : 'text-muted-foreground/40'}`} />
                <span className={item.completed ? '' : 'text-muted-foreground'}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviewer notes */}
      <div className="mb-8">
        <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reviewer Notes</Label>
        <Textarea id="notes" rows={3} placeholder="Add feedback for the worker..." value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2" />
      </div>

      {/* Actions */}
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
