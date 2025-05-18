
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: "USER" | "PARTNER" | "ADMIN";
}) => {
  const { currentUser, isLoading, authInitialized, userRole } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute state:", {
    authInitialized,
    isLoading,
    userExists: !!currentUser,
    userRole,
    currentPath: location.pathname
  });

  // If auth isn't initialized yet, show loading
  if (!authInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Инициализация авторизации...</p>
        <p className="text-sm text-muted-foreground mt-2">
          (Если загрузка длится долго, попробуйте обновить страницу)
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Обновить страницу
        </Button>
        <Button 
          onClick={() => window.location.href = '/login'} 
          variant="outline"
          className="mt-2"
        >
          Перейти к входу
        </Button>
      </div>
    );
  }

  // While checking user data
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Загрузка данных пользователя...</p>
      </div>
    );
  }

  // If user not authenticated, redirect to login
  if (!currentUser) {
    console.log("No current user, redirecting to login");
    // Pass the current location to the login page so we can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if user has required role
  if (requiredRole && userRole !== requiredRole) {
    console.log(`User role ${userRole} doesn't match required role ${requiredRole}`);
    
    if (userRole === "ADMIN") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (userRole === "PARTNER") {
      return <Navigate to="/partner-dashboard" replace />;
    } else {
      return <Navigate to="/profile" replace />;
    }
  }

  return children;
};
