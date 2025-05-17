
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: "USER" | "PARTNER" | "ADMIN";
}) => {
  const { currentUser, isLoading, authInitialized, userRole } = useAuth();

  if (!authInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Инициализация авторизации...</p>
        <p className="text-sm text-muted-foreground mt-2">
          (Если загрузка длится долго, попробуйте обновить страницу)
        </p>
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

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
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
