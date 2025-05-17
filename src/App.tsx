
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { BottomNavBar } from "@/components/BottomNavBar";
import GymsPage from "./pages/GymsPage";
import GymDetailPage from "./pages/GymDetailPage";
import ClassesPage from "./pages/ClassesPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyCodePage from "./pages/VerifyCodePage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PartnerDashboardPage from "./pages/PartnerDashboardPage";
import BookingPage from "./pages/BookingPage";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: "USER" | "PARTNER" | "ADMIN" }) => {
  const { currentUser, isLoading } = useAuth();
  const [showLoader, setShowLoader] = useState(false);
  
  useEffect(() => {
    // Only show loader after a brief delay to avoid flashing
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowLoader(true);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Always show loader while loading - this ensures routes are protected during authentication check
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Загрузка...</p>
      </div>
    );
  }

  // Only check auth after loading is complete
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
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
      <Route 
        path="/classes" 
        element={
          <ProtectedRoute>
            <ClassesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/booking/:gymId/:classId" 
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/subscriptions" element={<SubscriptionsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-code" element={<VerifyCodePage />} />
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

const App = () => {
  // Register PWA installation effect
  useEffect(() => {
    const registerBeforeInstallPrompt = () => {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        console.log('App can be installed, showing prompt');
      });
    };

    registerBeforeInstallPrompt();

    // Check if app is installed
    window.addEventListener('appinstalled', (event) => {
      console.log('GoodFit PWA was installed');
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner position="top-center" />
                <div className="flex flex-col min-h-screen pb-16 bg-background text-foreground">
                  <main className="flex-1">
                    <AppRoutes />
                  </main>
                  <BottomNavBar />
                </div>
              </TooltipProvider>
            </AppProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
