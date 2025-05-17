
import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, Dumbbell, CalendarIcon, 
  LogOut, Menu, X, User, ChevronDown 
} from "lucide-react";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MainLayout() {
  const { currentUser, logout, userRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-r transition-all duration-300 ease-in-out relative",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link 
            to="/" 
            className={cn(
              "font-bold text-primary transition-opacity", 
              sidebarOpen ? "text-xl" : "text-xs opacity-0"
            )}
          >
            GoodFit Admin
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
        
        <nav className="p-2 space-y-1">
          {/* Admin & Partner routes */}
          {(userRole === "ADMIN" || userRole === "PARTNER") && (
            <>
              <Link
                to="/dashboard"
                className={cn(
                  "flex items-center px-2 py-2 rounded-md group transition-colors",
                  isActive("/dashboard") 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <LayoutDashboard size={20} className="mr-3 flex-shrink-0" />
                <span className={cn("transition-opacity", sidebarOpen ? "" : "hidden")}>Дашборд</span>
              </Link>
              
              <Link
                to="/gyms"
                className={cn(
                  "flex items-center px-2 py-2 rounded-md group transition-colors",
                  isActive("/gyms") 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <Dumbbell size={20} className="mr-3 flex-shrink-0" />
                <span className={cn("transition-opacity", sidebarOpen ? "" : "hidden")}>Спортзалы</span>
              </Link>
              
              <Link
                to="/bookings"
                className={cn(
                  "flex items-center px-2 py-2 rounded-md group transition-colors",
                  isActive("/bookings") 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <CalendarIcon size={20} className="mr-3 flex-shrink-0" />
                <span className={cn("transition-opacity", sidebarOpen ? "" : "hidden")}>Бронирования</span>
              </Link>
            </>
          )}
          
          {/* Admin-only routes */}
          {userRole === "ADMIN" && (
            <Link
              to="/users"
              className={cn(
                "flex items-center px-2 py-2 rounded-md group transition-colors",
                isActive("/users") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              <Users size={20} className="mr-3 flex-shrink-0" />
              <span className={cn("transition-opacity", sidebarOpen ? "" : "hidden")}>Пользователи</span>
            </Link>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4">
          <h1 className="text-xl font-semibold">
            {location.pathname === "/dashboard" && "Панель управления"}
            {location.pathname === "/gyms" && "Управление залами"}
            {location.pathname === "/users" && "Пользователи"}
            {location.pathname === "/bookings" && "Бронирования"}
          </h1>
          
          <div className="flex items-center">
            <div className="relative">
              <Button variant="ghost" className="flex items-center">
                {currentUser?.profileImage ? (
                  <img 
                    src={currentUser.profileImage} 
                    alt={currentUser.name} 
                    className="w-8 h-8 rounded-full mr-2" 
                  />
                ) : (
                  <User size={18} className="mr-2" />
                )}
                <span className="mr-1">{currentUser?.name}</span>
                <ChevronDown size={16} />
              </Button>
              
              <div className="absolute right-0 mt-1 w-48 bg-card rounded-md shadow-md border hidden group-hover:block">
                <div className="py-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Выйти
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
