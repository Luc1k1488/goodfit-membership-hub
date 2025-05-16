
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { User, Settings, LogOut } from "lucide-react";

export function Header() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-goodfit-primary">
            Good<span className="text-goodfit-secondary">Fit</span>
          </span>
        </Link>

        <nav className="hidden md:flex md:items-center md:space-x-6">
          <Link to="/gyms" className="text-sm font-medium hover:text-goodfit-primary transition-colors">
            Gyms
          </Link>
          <Link to="/subscriptions" className="text-sm font-medium hover:text-goodfit-primary transition-colors">
            Subscriptions
          </Link>
          {user?.role === 'PARTNER' && (
            <Link to="/partner-dashboard" className="text-sm font-medium hover:text-goodfit-primary transition-colors">
              Partner Dashboard
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin-dashboard" className="text-sm font-medium hover:text-goodfit-primary transition-colors">
              Admin Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-2">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-sm">
                Welcome, <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/profile">
                    <User className="w-5 h-5" />
                    <span className="sr-only">Profile</span>
                  </Link>
                </Button>
                {(user.role === 'ADMIN' || user.role === 'PARTNER') && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={user.role === 'ADMIN' ? '/admin-dashboard' : '/partner-dashboard'}>
                      <Settings className="w-5 h-5" />
                      <span className="sr-only">Dashboard</span>
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button className="bg-goodfit-primary hover:bg-goodfit-dark" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
