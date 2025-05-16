
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { BottomNavBar } from "@/components/BottomNavBar";
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
import { useAuth } from "./context/AuthContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: "USER" | "PARTNER" | "ADMIN" }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Загрузка...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    if (currentUser.role === "ADMIN") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (currentUser.role === "PARTNER") {
      return <Navigate to="/partner-dashboard" replace />;
    } else {
      return <Navigate to="/profile" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/gyms" replace />} />
      <Route path="/gyms" element={<GymsPage />} />
      <Route path="/gyms/:id" element={<GymDetailPage />} />
      <Route path="/classes" element={<ClassesPage />} />
      <Route path="/subscriptions" element={<SubscriptionsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/partner-dashboard" 
        element={
          <ProtectedRoute requiredRole="PARTNER">
            <PartnerDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen pb-16 bg-background text-foreground">
                <main className="flex-1">
                  <AppRoutes />
                </main>
                <BottomNavBar />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
