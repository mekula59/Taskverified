import { seededClaims, seededSubmissions, seededTasks, seededWorkerProfiles } from "@/features/tasks/data/taskSeeds";
import type { TaskStoreSnapshot } from "@/features/shared/types/domain";

const STORAGE_KEY = "taskverified.tasks";

const seedSnapshot: TaskStoreSnapshot = {
  tasks: seededTasks,
  claims: seededClaims,
  submissions: seededSubmissions,
  workerProfiles: seededWorkerProfiles,
};

export function readStoredTaskSnapshot(): TaskStoreSnapshot {
  if (typeof window === "undefined") {
    return seedSnapshot;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return seedSnapshot;
  }

  try {
    const parsed = JSON.parse(raw) as TaskStoreSnapshot;
    if (!parsed || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.claims) || !Array.isArray(parsed.submissions) || !Array.isArray(parsed.workerProfiles)) {
      return seedSnapshot;
    }

    return parsed;
  } catch {
    return seedSnapshot;
  }
}

export function writeStoredTaskSnapshot(snapshot: TaskStoreSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
