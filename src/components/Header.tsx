
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type HeaderProps = {
  children?: React.ReactNode;
};

export function Header({ children }: HeaderProps) {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {children || (
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-goodfit-primary">
              Good<span className="text-goodfit-secondary">Fit</span>
            </span>
          </Link>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="ml-auto"
        >
          {theme === 'dark' ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
