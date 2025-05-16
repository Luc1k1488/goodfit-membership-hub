
import { Home, Calendar, CreditCard, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BottomNavBar() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => {
    if (route === "/" && path === "/") return true;
    if (route !== "/" && path.startsWith(route)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/gyms"
          className={`flex flex-col items-center justify-center w-1/4 py-1 ${
            isActive("/gyms") ? "text-goodfit-primary" : "text-muted-foreground"
          }`}
        >
          <Home className={`h-6 w-6 ${isActive("/gyms") ? "fill-goodfit-primary" : ""}`} />
          <span className="text-xs mt-1">Залы</span>
        </Link>
        <Link
          to="/classes"
          className={`flex flex-col items-center justify-center w-1/4 py-1 ${
            isActive("/classes") ? "text-goodfit-primary" : "text-muted-foreground"
          }`}
        >
          <Calendar className={`h-6 w-6 ${isActive("/classes") ? "fill-goodfit-primary" : ""}`} />
          <span className="text-xs mt-1">Занятия</span>
        </Link>
        <Link
          to="/subscriptions"
          className={`flex flex-col items-center justify-center w-1/4 py-1 ${
            isActive("/subscriptions") ? "text-goodfit-primary" : "text-muted-foreground"
          }`}
        >
          <CreditCard className={`h-6 w-6 ${isActive("/subscriptions") ? "fill-goodfit-primary" : ""}`} />
          <span className="text-xs mt-1">Абонементы</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center w-1/4 py-1 ${
            isActive("/profile") ? "text-goodfit-primary" : "text-muted-foreground"
          }`}
        >
          <User className={`h-6 w-6 ${isActive("/profile") ? "fill-goodfit-primary" : ""}`} />
          <span className="text-xs mt-1">Профиль</span>
        </Link>
      </div>
    </div>
  );
}
