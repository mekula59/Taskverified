import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";

import Landing from "./pages/Landing";
import BrowseTasks from "./pages/BrowseTasks";
import TaskDetail from "./pages/TaskDetail";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import RoleSelect from "./pages/RoleSelect";
import ProfileSetup from "./pages/ProfileSetup";
import VerificationStatus from "./pages/VerificationStatus";
import Settings from "./pages/Settings";

import WorkerDashboard from "./pages/worker/WorkerDashboard";
import AvailableTasks from "./pages/worker/AvailableTasks";
import MyWorkerTasks from "./pages/worker/MyWorkerTasks";
import SubmissionForm from "./pages/worker/SubmissionForm";
import Earnings from "./pages/worker/Earnings";
import ReputationProfile from "./pages/worker/ReputationProfile";

import PosterDashboard from "./pages/poster/PosterDashboard";
import CreateTask from "./pages/poster/CreateTask";
import MyPostedTasks from "./pages/poster/MyPostedTasks";
import ReviewSubmission from "./pages/poster/ReviewSubmission";
import Payments from "./pages/poster/Payments";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/role-select" element={<RoleSelect />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/verification" element={<VerificationStatus />} />

          {/* Shared authenticated layout - Worker */}
          <Route element={<AppLayout isAuthenticated role="worker" />}>
            <Route path="/tasks" element={<BrowseTasks />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
            <Route path="/worker/available" element={<AvailableTasks />} />
            <Route path="/worker/my-tasks" element={<MyWorkerTasks />} />
            <Route path="/worker/submit/:taskId" element={<SubmissionForm />} />
            <Route path="/worker/earnings" element={<Earnings />} />
            <Route path="/worker/reputation" element={<ReputationProfile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Poster layout */}
          <Route element={<AppLayout isAuthenticated role="poster" />}>
            <Route path="/poster/dashboard" element={<PosterDashboard />} />
            <Route path="/poster/create-task" element={<CreateTask />} />
            <Route path="/poster/my-tasks" element={<MyPostedTasks />} />
            <Route path="/poster/review/:id" element={<ReviewSubmission />} />
            <Route path="/poster/payments" element={<Payments />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
