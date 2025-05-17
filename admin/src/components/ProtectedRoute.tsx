
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: "PARTNER" | "ADMIN";
}) => {
  const { currentUser, isLoading, authInitialized, userRole } = useAuth();
  const location = useLocation();
  
  console.log("Admin ProtectedRoute state:", {
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
          variant="default" 
          className="mt-4" 
          onClick={() => window.location.reload()}
        >
          Обновить страницу
        </Button>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={() => window.location.href = '/login'}
        >
          Перейти к входу
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Загрузка данных пользователя...</p>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!currentUser) {
    console.log("Admin route: No current user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If user role is USER, deny access to admin
  if (userRole === "USER") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-destructive mb-2">Доступ запрещен</h1>
        <p className="text-lg text-muted-foreground mb-4">
          У вас нет прав для доступа к панели администрирования.
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Вернуться на главную
        </Button>
      </div>
    );
  }

  // If specific role is required
  if (requiredRole && userRole !== requiredRole) {
    console.log(`Admin route: User role ${userRole} doesn't match required role ${requiredRole}`);
    
    // Redirect different admin levels to their appropriate dashboards
    if (userRole === "ADMIN") {
      return <Navigate to="/dashboard" replace />;
    } else if (userRole === "PARTNER") {
      return <Navigate to="/partner/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
