import { cn } from "@/lib/utils";

export const taskVerifiedLogoPath = "/brand/taskverified-logo.svg";
export const taskVerifiedIconPath = "/brand/taskverified-mark.svg";

interface TaskVerifiedMarkProps {
  alt?: string;
  className?: string;
  imageClassName?: string;
}

export function TaskVerifiedMark({
  alt = "TaskVerified",
  className,
  imageClassName,
}: TaskVerifiedMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center drop-shadow-[0_14px_18px_rgba(15,23,42,0.16)]",
        className,
      )}
    >
      <img
        src={taskVerifiedIconPath}
        alt={alt}
        className={cn("h-full w-full object-contain", imageClassName)}
        decoding="async"
      />
    </span>
  );
}
