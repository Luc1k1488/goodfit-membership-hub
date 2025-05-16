
import { Home, Calendar, CreditCard, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BottomNavBar() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => {
    if (route === "/gyms" && (path === "/" || path === "/gyms" || path.startsWith("/gyms/"))) return true;
    if (route !== "/" && path.startsWith(route)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border pb-safe z-50 dark:bg-gray-900">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/gyms"
          className={`flex flex-col items-center justify-center w-1/4 py-1 ${
            isActive("/gyms") ? "text-blue-500" : "text-muted-foreground"
          }`}
        >
          <Home className={`h-6 w-6 ${isActive("/gyms") ? "stroke-blue-500" : ""}`} />
          <span className="text-xs mt-1">Залы</span>
        </Link>
        <Link
          to="/classes"
          className={`flex flex-col items-center justify-center w-1/4 py-1 ${
            isActive("/classes") ? "text-blue-500" : "text-muted-foreground"
          }`}
        >
          <Calendar className={`h-6 w-6 ${isActive("/classes") ? "stroke-blue-500" : ""}`} />
          <span className="text-xs mt-1">Занятия</span>
        </Link>
        <Link
          to="/subscriptions"
          className={`flex flex-col items-center justify-center w-1/4 py-1 ${
            isActive("/subscriptions") ? "text-blue-500" : "text-muted-foreground"
          }`}
        >
          <CreditCard className={`h-6 w-6 ${isActive("/subscriptions") ? "stroke-blue-500" : ""}`} />
          <span className="text-xs mt-1">Абонементы</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center w-1/4 py-1 ${
            isActive("/profile") ? "text-blue-500" : "text-muted-foreground"
          }`}
        >
          <User className={`h-6 w-6 ${isActive("/profile") ? "stroke-blue-500" : ""}`} />
          <span className="text-xs mt-1">Профиль</span>
        </Link>
      </div>
    </div>
  );
}
