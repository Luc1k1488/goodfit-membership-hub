
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";

export function Header() {
  const { user } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      <div className="flex items-center justify-center h-14 px-4">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-goodfit-primary">
            Good<span className="text-goodfit-secondary">Fit</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
