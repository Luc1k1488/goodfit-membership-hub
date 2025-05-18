
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type HeaderProps = {
  children?: React.ReactNode;
  home?: boolean; // Added home prop
};

export function Header({ children, home }: HeaderProps) {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {children || (
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-500">
              Good<span className="text-blue-700">Fit</span>
            </span>
          </Link>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="ml-auto"
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
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
