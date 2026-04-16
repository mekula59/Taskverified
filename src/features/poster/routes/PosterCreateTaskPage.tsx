import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { PageIntro } from "@/components/shell/PageIntro";
import { MetricCard } from "@/components/shell/MetricCard";
import { SectionCard } from "@/components/shell/SectionCard";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { defaultTaskFormValues, toTaskCreateInput, validateTaskForm } from "@/features/tasks/lib/taskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { posterTrustSignals } from "@/features/shared/data/appShell";
import type { TaskCategory, RewardCurrency, TaskStatus } from "@/features/shared/types/domain";

const categoryOptions: TaskCategory[] = ["testing", "research", "community", "content"];
const currencyOptions: RewardCurrency[] = ["USD", "NGN"];
const statusOptions: TaskStatus[] = ["draft", "open", "claimed", "submitted", "reviewed", "paid"];

export function PosterCreateTaskPage() {
  const auth = useAuth();
  const { createTask } = useTasks();
  const navigate = useNavigate();
  const [values, setValues] = useState(defaultTaskFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateTaskForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!auth.user || !auth.profile) {
      return;
    }

    createTask(toTaskCreateInput(values), {
      id: auth.user.id,
      name: auth.profile.fullName,
    });

    setValues(defaultTaskFormValues);
    navigate("/poster/tasks");
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title="Task creation should produce reviewable work."
        description="This form creates a typed task in the frontend-safe local store so it immediately appears across the product shell and remains easy to replace with Supabase later."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {posterTrustSignals.map((signal) => (
          <MetricCard key={signal.label} label={signal.label} value={signal.value} detail={signal.detail} icon={signal.icon} />
        ))}
      </div>
      <SectionCard title="Create task" description="All fields below are stored in the local task layer and reused across poster and public task views.">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
              placeholder="Test onboarding flow and attach screenshots"
            />
            {errors.title ? <p className="text-sm text-destructive">{errors.title}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe the work clearly so it can be reviewed against proof."
            />
            {errors.description ? <p className="text-sm text-destructive">{errors.description}</p> : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={values.category}
                onChange={(event) =>
                  setValues((current) => ({ ...current, category: event.target.value as TaskCategory | "" }))
                }
              >
                <option value="">Select a category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              {errors.category ? <p className="text-sm text-destructive">{errors.category}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={values.status}
                onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as TaskStatus }))}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofRequirementsText">Proof requirements</Label>
            <Textarea
              id="proofRequirementsText"
              value={values.proofRequirementsText}
              onChange={(event) => setValues((current) => ({ ...current, proofRequirementsText: event.target.value }))}
              placeholder={"One item per line\nScreenshot of completed task\nShort written summary"}
            />
            {errors.proofRequirementsText ? <p className="text-sm text-destructive">{errors.proofRequirementsText}</p> : null}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rewardAmount">Reward amount</Label>
              <Input
                id="rewardAmount"
                type="number"
                min="1"
                step="1"
                value={values.rewardAmount}
                onChange={(event) => setValues((current) => ({ ...current, rewardAmount: event.target.value }))}
                placeholder="25"
              />
              {errors.rewardAmount ? <p className="text-sm text-destructive">{errors.rewardAmount}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rewardCurrency">Reward currency</Label>
              <Select
                id="rewardCurrency"
                value={values.rewardCurrency}
                onChange={(event) =>
                  setValues((current) => ({ ...current, rewardCurrency: event.target.value as RewardCurrency }))
                }
              >
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadlineAt">Deadline</Label>
              <Input
                id="deadlineAt"
                type="date"
                value={values.deadlineAt}
                onChange={(event) => setValues((current) => ({ ...current, deadlineAt: event.target.value }))}
              />
              {errors.deadlineAt ? <p className="text-sm text-destructive">{errors.deadlineAt}</p> : null}
            </div>
          </div>

          <Button type="submit">Create task</Button>
        </form>
      </SectionCard>
    </div>
  );
}
