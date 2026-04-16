import { useEffect, useMemo, useState, type ReactNode } from "react";

import { TasksContext, type TasksContextValue } from "@/features/tasks/context/TasksContext";
import { readStoredTasks, writeStoredTasks } from "@/features/tasks/lib/taskStorage";
import type { Task, TaskCreateInput } from "@/features/shared/types/domain";

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => readStoredTasks());

  useEffect(() => {
    writeStoredTasks(tasks);
  }, [tasks]);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      createTask: (input: TaskCreateInput, currentUser: { id: string; name: string }) => {
        const task: Task = {
          id: `task-${Date.now()}`,
          posterId: currentUser.id,
          posterName: currentUser.name,
          title: input.title,
          description: input.description,
          category: input.category,
          proofRequirements: input.proofRequirements,
          rewardAmount: input.rewardAmount,
          rewardCurrency: input.rewardCurrency,
          deadlineAt: input.deadlineAt,
          status: input.status,
          claimLimit: 1,
          claimCount: 0,
          createdAt: new Date().toISOString(),
        };

        setTasks((current) => [task, ...current]);
        return task;
      },
    }),
    [tasks],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
