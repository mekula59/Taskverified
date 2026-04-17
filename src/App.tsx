import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { SolanaProvider } from "@/features/solana/providers/SolanaProvider";
import { TasksProvider } from "@/features/tasks/context/TasksProvider";

const App = () => (
  <SolanaProvider>
    <AuthProvider>
      <TasksProvider>
        <RouterProvider router={router} />
      </TasksProvider>
    </AuthProvider>
  </SolanaProvider>
);

export default App;
