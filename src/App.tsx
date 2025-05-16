
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { BottomNavBar } from "@/components/BottomNavBar";
import Index from "./pages/Index";
import GymsPage from "./pages/GymsPage";
import GymDetailPage from "./pages/GymDetailPage";
import ClassesPage from "./pages/ClassesPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PartnerDashboardPage from "./pages/PartnerDashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen pb-16">
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Navigate to="/gyms" replace />} />
                  <Route path="/gyms" element={<GymsPage />} />
                  <Route path="/gyms/:id" element={<GymDetailPage />} />
                  <Route path="/classes" element={<ClassesPage />} />
                  <Route path="/subscriptions" element={<SubscriptionsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                  <Route path="/partner-dashboard" element={<PartnerDashboardPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <BottomNavBar />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
