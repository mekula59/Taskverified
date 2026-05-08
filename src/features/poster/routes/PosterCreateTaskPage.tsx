import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { PageIntro } from "@/components/shell/PageIntro";
import { MetricCard } from "@/components/shell/MetricCard";
import { SectionCard } from "@/components/shell/SectionCard";
import { ActionPanel } from "@/components/shell/WorkspacePrimitives";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTasks } from "@/features/tasks/context/useTasks";
import { defaultTaskFormValues, parseProofRequirements, toTaskCreateInput, validateTaskForm } from "@/features/tasks/lib/taskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { posterTrustSignals } from "@/features/shared/data/appShell";
import type { TaskCategory, RewardCurrency, TaskStatus } from "@/features/shared/types/domain";

const categoryOptions: TaskCategory[] = ["testing", "research", "community", "content"];
const currencyOptions: RewardCurrency[] = ["USD", "NGN"];
const statusOptions: TaskStatus[] = ["draft", "open"];
const taskTemplates: Array<{
  label: string;
  category: TaskCategory;
  title: string;
  description: string;
  proofRequirementsText: string;
}> = [
  {
    label: "QA check",
    category: "testing",
    title: "Test onboarding flow and attach evidence",
    description: "Complete the onboarding flow on one device, note any confusing or broken states, and submit evidence the reviewer can inspect.",
    proofRequirementsText: "Five screenshots covering each onboarding step\nDevice, browser, and wallet state used during the test\nShort notes for every issue or confusing moment found",
  },
  {
    label: "Research proof",
    category: "research",
    title: "Collect local pricing data with source photos",
    description: "Collect price data from named sources and submit a structured summary that can be checked against the attached evidence.",
    proofRequirementsText: "Source photo or link for each price point collected\nStructured table with item name, location, and price\nBrief note explaining any missing or unusual data",
  },
  {
    label: "Content task",
    category: "content",
    title: "Clip two launch highlights with timestamps",
    description: "Create two short clips from the source recording and explain why each clip is useful for the campaign.",
    proofRequirementsText: "Direct link or file name for both finished clips\nSource timestamps for each selected moment\nOne-sentence rationale for why each clip should be used",
  },
];

const proofSuggestions = [
  "Direct link or file name for the evidence package",
  "Short narrative mapping the evidence to each requirement",
  "Timestamp, device, browser, location, or source context when relevant",
];

export function PosterCreateTaskPage() {
  const auth = useAuth();
  const { createTask } = useTasks();
  const navigate = useNavigate();
  const [values, setValues] = useState(defaultTaskFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const previewProofRequirements = parseProofRequirements(values.proofRequirementsText);

  const applyTemplate = (template: (typeof taskTemplates)[number]) => {
    setValues((current) => ({
      ...current,
      title: template.title,
      description: template.description,
      category: template.category,
      proofRequirementsText: template.proofRequirementsText,
    }));
    setErrors({});
  };

  const addProofSuggestion = (suggestion: string) => {
    setValues((current) => {
      const currentItems = parseProofRequirements(current.proofRequirementsText);

      if (currentItems.includes(suggestion)) {
        return current;
      }

      return {
        ...current,
        proofRequirementsText: [...currentItems, suggestion].join("\n"),
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const nextErrors = validateTaskForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!auth.user || !auth.profile) {
      return;
    }

    try {
      await createTask(toTaskCreateInput(values), {
        id: auth.user.id,
        name: auth.profile.fullName,
      });

      setValues(defaultTaskFormValues);
      navigate("/poster/tasks");
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : "Unable to create the task.");
    }
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Poster"
        title="Task creation should produce reviewable work."
        description="Create a task with clear proof requirements, review consequences, and payout context before workers claim it."
      />
      <ActionPanel
        eyebrow="Definition checkpoint"
        title="The task is the review contract."
        description="Workers should see reward, deadline, category, and proof requirements before they claim. Keep the standard explicit enough to approve or reject later."
      />
      <SectionCard title="Start from a reviewable template" description="A good task must be reviewable from submitted evidence. Use a template, then tune the proof bar to the exact work.">
        <div className="grid gap-3 md:grid-cols-3">
          {taskTemplates.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => applyTemplate(template)}
              className="rounded-2xl border border-slate-200 bg-slate-50/85 p-4 text-left transition-colors hover:border-slate-300 hover:bg-white"
            >
              <p className="text-sm font-semibold text-slate-950">{template.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{template.title}</p>
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Create task" description="These fields define what workers will see, what proof they must submit, and how review can move payout forward.">
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
            <p className="text-sm leading-6 text-slate-600">
              A good task must be reviewable from submitted evidence. Use two or more concrete requirements, or one detailed structured requirement that names the artifact and review standard.
            </p>
            <Textarea
              id="proofRequirementsText"
              value={values.proofRequirementsText}
              onChange={(event) => setValues((current) => ({ ...current, proofRequirementsText: event.target.value }))}
              placeholder={"One item per line\nScreenshot of the completed dashboard with visible account state\nShort written summary mapping each step to the task goal"}
            />
            <div className="flex flex-wrap gap-2">
              {proofSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addProofSuggestion(suggestion)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
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
          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
        </form>
      </SectionCard>
      <SectionCard title="Worker-facing preview" description="This is the object a worker should be able to judge before claiming. If it feels vague here, it will be hard to review later.">
        <div className="grid gap-5 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/85 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Task</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{values.title.trim() || "Untitled proof-based task"}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {values.description.trim() || "Describe the work clearly enough for a worker to decide whether they can produce reviewable proof."}
            </p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reward</p>
                <p className="mt-2 font-semibold text-slate-950">{values.rewardAmount || "0"} {values.rewardCurrency}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Deadline</p>
                <p className="mt-2 font-semibold text-slate-950">{values.deadlineAt || "Not set"}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</p>
                <p className="mt-2 font-semibold capitalize text-slate-950">{values.status}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">Proof bar</p>
            <div className="mt-4 space-y-3">
              {previewProofRequirements.length > 0 ? (
                previewProofRequirements.map((requirement) => (
                  <div key={requirement} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/76">
                    {requirement}
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/76">
                  Add proof requirements before workers can understand the review bar.
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {posterTrustSignals.map((signal) => (
          <MetricCard key={signal.label} label={signal.label} value={signal.value} detail={signal.detail} icon={signal.icon} />
        ))}
      </div>
    </div>
  );
}
