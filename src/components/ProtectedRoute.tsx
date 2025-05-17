import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser, authInitialized } = useAuth();

  if (!authInitialized) {
    return <div>Инициализация...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
