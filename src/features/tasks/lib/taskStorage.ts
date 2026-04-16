import { seededTasks } from "@/features/tasks/data/taskSeeds";
import type { Task } from "@/features/shared/types/domain";

const STORAGE_KEY = "taskverified.tasks";

export function readStoredTasks(): Task[] {
  if (typeof window === "undefined") {
    return seededTasks;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return seededTasks;
  }

  try {
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : seededTasks;
  } catch {
    return seededTasks;
  }
}

export function writeStoredTasks(tasks: Task[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
