
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-9xl font-extrabold text-primary">404</h1>
      <p className="text-2xl font-semibold mb-6">Страница не найдена</p>
      <p className="text-muted-foreground mb-8 max-w-md">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <Link to="/dashboard">
        <Button size="lg">Вернуться на дашборд</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
