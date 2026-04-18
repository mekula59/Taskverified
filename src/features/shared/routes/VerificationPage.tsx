import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context/useAuth";

const statusCopy = {
  unverified: {
    label: "Unverified",
    detail: "Verification has not been submitted yet. Worker claiming should remain blocked.",
  },
  pending: {
    label: "Pending review",
    detail: "Verification has been submitted and is awaiting review.",
  },
  verified: {
    label: "Verified",
    detail: "Identity and readiness checks passed. Claiming can proceed.",
  },
  flagged: {
    label: "Flagged",
    detail: "Manual review is required before access can continue.",
  },
};

export function VerificationPage() {
  const auth = useAuth();
  const currentStatus = auth.verification?.status ?? "unverified";
  const copy = statusCopy[currentStatus];
  const consequenceCopy = {
    unverified: "Claiming stays blocked until verification is submitted and cleared.",
    pending: "Claiming remains on hold while the submitted record waits for review.",
    verified: "Claiming can proceed because identity and readiness checks are cleared.",
    flagged: "Manual review is required before access can continue.",
  }[currentStatus];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr] xl:items-start">
          <div className="space-y-5">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Shared
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Verification should read like access consequence, not profile metadata.</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">{copy.detail}</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_55px_-34px_rgba(15,23,42,0.72)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100/70">Current verification state</p>
                  <h2 className="text-3xl font-semibold tracking-tight text-white">{copy.label}</h2>
                  <p className="max-w-lg text-sm leading-6 text-white/72">{consequenceCopy}</p>
                </div>
                <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/82">
                  <span className="capitalize">{currentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Identity tied to record</p>
              <p className="mt-3 text-sm font-semibold text-slate-950">{auth.profile?.fullName ?? "No profile yet"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Role: <span className="font-medium capitalize text-slate-950">{auth.user?.role ?? "unassigned"}</span></p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Verification timing</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {auth.verification?.submittedAt ? (
                  <div>
                    Submitted: <span className="font-medium text-slate-950">{new Date(auth.verification.submittedAt).toLocaleString()}</span>
                  </div>
                ) : (
                  <div>No submission recorded yet.</div>
                )}
                {auth.verification?.reviewedAt ? (
                  <div>
                    Reviewed: <span className="font-medium text-slate-950">{new Date(auth.verification.reviewedAt).toLocaleString()}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-950">What this state means</h2>
            <p className="text-sm leading-6 text-slate-600">Verification matters because it changes what this identity can do inside TaskVerified.</p>
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4 text-sm leading-6 text-slate-600">
              Worker claiming: <span className="font-medium text-slate-950">{currentStatus === "verified" ? "allowed" : "blocked or on hold"}</span>
            </div>
            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4 text-sm leading-6 text-slate-600">
              Trust standing: <span className="font-medium text-slate-950">{currentStatus === "verified" ? "identity has cleared readiness checks" : "identity has not fully cleared readiness checks"}</span>
            </div>
            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4 text-sm leading-6 text-slate-600">
              Review outcome: <span className="font-medium text-slate-950">{copy.detail}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-950">Review notes</h2>
            <p className="text-sm leading-6 text-slate-600">Supporting context from the verification record, kept secondary to the state itself.</p>
          </div>
          <div className="mt-5 rounded-[1.35rem] border border-slate-200 bg-slate-50/85 p-4 text-sm leading-7 text-slate-600">
            {auth.verification?.notes ?? "No verification notes are available yet."}
          </div>
        </div>
      </div>
    </div>
  );
}
