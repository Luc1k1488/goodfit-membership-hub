
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-background border-t py-6 px-4 text-center text-sm text-muted-foreground mb-16">
      <p>&copy; {new Date().getFullYear()} GoodFit. Все права защищены.</p>
      <div className="flex justify-center space-x-4 mt-2">
        <Link to="/terms" className="hover:text-goodfit-primary">
          Условия сервиса
        </Link>
        <Link to="/privacy" className="hover:text-goodfit-primary">
          Политика конфиденциальности
        </Link>
      </div>
    </footer>
  );
}
