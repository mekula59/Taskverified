import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/shell/PageIntro";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { formatMoney, getClaimForTask, getPayoutForSubmission, getPublicTasks, getSubmissionForClaim, getTrustScoreTone, getWorkerReputationSummary } from "@/features/tasks/data/sampleData";

export function WorkerTasksPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { tasks, claims, submissions, payouts, reputationSummaries, claimTask } = useTasks();
  const isClaimEligible = auth.verification?.status === "verified";
  const publicTasks = getPublicTasks(tasks);
  const workerId = auth.user?.id ?? "";
  const workerName = auth.profile?.fullName ?? "Worker";
  const reputation = getWorkerReputationSummary(reputationSummaries, workerId);

  const handleClaim = (taskId: string) => {
    if (!isClaimEligible || !workerId) {
      return;
    }

    claimTask({
      taskId,
      workerId,
      workerName,
    });

    navigate(`/worker/submissions?taskId=${taskId}`);
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Worker"
        title="Claimable work"
        description="Task cards are now backed by a task entity and respect verification state in the UI foundation."
      />
      {reputation ? (
        <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
          Your current trust posture is <span className="font-medium text-foreground">{getTrustScoreTone(reputation.trustScore).toLowerCase()}</span> at{" "}
          <span className="font-medium text-foreground">{reputation.trustScore}</span>, with {reputation.approvalRate}% approval and {reputation.payoutsReleased} released Solana payouts.
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        {publicTasks.map((task) => (
          <SectionCard key={task.id} title={task.title} description={`${task.description} Posted by ${task.posterName}.`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Reward</span>
                <span className="font-medium text-foreground">{formatMoney(task.rewardAmount, task.rewardCurrency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Status</span>
                <span className="capitalize">{task.status}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.proofRequirements.map((item) => (
                  <Badge key={item} variant="secondary" className="rounded-full">
                    {item}
                  </Badge>
                ))}
              </div>
              {(() => {
                const existingClaim = getClaimForTask(claims, task.id, workerId);
                const submission = existingClaim ? getSubmissionForClaim(submissions, existingClaim.id) : undefined;
                const payout = submission ? getPayoutForSubmission(payouts, submission.id) : undefined;

                if (!isClaimEligible) {
                  return (
                    <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                      Claiming is blocked until verification clears.
                    </div>
                  );
                }

                if (existingClaim) {
                  return (
                    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/70 px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        You already claimed this task. Current status: <span className="font-medium capitalize text-foreground">{existingClaim.status}</span>
                      </p>
                      {payout ? (
                        <p className="text-sm text-muted-foreground">
                          Solana payout: <span className="font-medium capitalize text-foreground">{payout.status.replaceAll("_", " ")}</span>
                        </p>
                      ) : null}
                      <Button variant="outline" onClick={() => navigate(`/worker/submissions?taskId=${task.id}`)}>
                        {existingClaim.status === "active" ? "Submit proof" : "View proof submission"}
                      </Button>
                    </div>
                  );
                }

                return (
                  <Button onClick={() => handleClaim(task.id)} disabled={task.status !== "open"}>
                    Claim task
                  </Button>
                );
              })()}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
