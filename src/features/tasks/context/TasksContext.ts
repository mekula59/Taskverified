import { createContext } from "react";

import type { Task, TaskCreateInput } from "@/features/shared/types/domain";

export interface TasksContextValue {
  tasks: Task[];
  createTask: (input: TaskCreateInput, currentUser: { id: string; name: string }) => Task;
}

export const TasksContext = createContext<TasksContextValue | null>(null);
