import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-950 text-white hover:bg-slate-800",
        secondary: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100",
        destructive: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50",
        outline: "border-slate-300 bg-white/70 text-slate-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
        warning: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
