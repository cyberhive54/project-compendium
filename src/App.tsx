import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/Calendar";
import AnalyticsPage from "./pages/Analytics";
import GoalsPage from "./pages/Goals";
import SettingsPage from "./pages/SettingsPage";
import TimerPage from "./pages/TimerPage";
import BadgesPage from "./pages/BadgesPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import GoalDetailPage from "./pages/GoalDetailPage";
import HolidaysPage from "./pages/HolidaysPage";
import TasksPage from "./pages/TasksPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import JournalPage from "./pages/JournalPage";
import HierarchyPage from "./pages/HierarchyPage";

import FeedbackPage from "./pages/FeedbackPage";
import HelpPage from "./pages/HelpPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import FeaturesPage from "./pages/FeaturesPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSystemHealth from "./pages/admin/AdminSystemHealth";
import AdminBadges from "./pages/admin/AdminBadges";
import AdminBadgesDocs from "./pages/admin/AdminBadgesDocs";
import SyllabusDocs from "./pages/admin/SyllabusDocs";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import AdminContactPage from "./pages/admin/AdminContactPage";
import AdminNotesPage from "./pages/admin/AdminNotesPage";
import DevDocsPage from "./pages/admin/DevDocsPage";

import { Loader2 } from "lucide-react";
import MenuPage from "./pages/MenuPage";

const queryClient = new QueryClient();

/** Shows LandingPage for guests, redirects authenticated users to Dashboard */
function HomeRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}

import { HelmetProvider } from "react-helmet-async";

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomeRoute />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Redirect legacy profile-setup to settings */}
                <Route path="/profile-setup" element={<Navigate to="/settings" replace />} />

                {/* Protected routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/goals/:goalId" element={<GoalDetailPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/timer" element={<TimerPage />} />
                  <Route path="/badges" element={<BadgesPage />} />
                  <Route path="/holidays" element={<HolidaysPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/hierarchy" element={<HierarchyPage />} />

                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/menu" element={<MenuPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="health" element={<AdminSystemHealth />} />
                  <Route path="badges" element={<AdminBadges />} />
                  <Route path="badges/docs" element={<AdminBadgesDocs />} />
                  <Route path="syllabus/docs" element={<SyllabusDocs />} />
                  <Route path="feedback" element={<FeedbackManagement />} />
                  <Route path="contact-us" element={<AdminContactPage />} />
                  <Route path="notes" element={<AdminNotesPage />} />
                  <Route path="docs-dev" element={<DevDocsPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
