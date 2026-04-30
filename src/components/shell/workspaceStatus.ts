export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info" | "dark";

export function getStatusTone(status?: string): StatusTone {
  if (!status) {
    return "neutral";
  }

  if (["approved", "released", "verified", "open", "connected", "ready"].includes(status)) {
    return "success";
  }

  if (["ready_to_release", "submitted", "claimed", "active"].includes(status)) {
    return "info";
  }

  if (["failed", "rejected", "unverified"].includes(status)) {
    return "danger";
  }

  if (["pending", "draft"].includes(status)) {
    return "warning";
  }

  return "neutral";
}
