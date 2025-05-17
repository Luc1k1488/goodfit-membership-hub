
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: "PARTNER" | "ADMIN";
}) => {
  const { currentUser, isLoading, authInitialized, userRole } = useAuth();

  if (!authInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Инициализация авторизации...</p>
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
    return <Navigate to="/login" replace />;
  }

  // If user role is USER, deny access to admin
  if (userRole === "USER") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-destructive mb-2">Доступ запрещен</h1>
        <p className="text-lg text-muted-foreground">
          У вас нет прав для доступа к панели администрирования.
        </p>
      </div>
    );
  }

  // If specific role is required
  if (requiredRole && userRole !== requiredRole) {
    // Redirect different admin levels to their appropriate dashboards
    if (userRole === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === "PARTNER") {
      return <Navigate to="/partner/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
