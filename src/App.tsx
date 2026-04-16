import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { TasksProvider } from "@/features/tasks/context/TasksProvider";

const App = () => (
  <AuthProvider>
    <TasksProvider>
      <RouterProvider router={router} />
    </TasksProvider>
  </AuthProvider>
);

export default App;
