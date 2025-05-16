
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FitnessClass } from "@/types";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useApp } from "@/context/AppContext";

interface ClassCardProps {
  fitnessClass: FitnessClass;
  gym?: { id: string; name: string };
  showBookButton?: boolean;
}

export function ClassCard({ fitnessClass, gym, showBookButton = true }: ClassCardProps) {
  const { bookClass, user } = useApp();
  
  const startTime = parseISO(fitnessClass.startTime);
  const endTime = parseISO(fitnessClass.endTime);
  
  const formattedDate = format(startTime, "EEEE, d MMMM", { locale: ru });
  const formattedTime = `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`;
  
  const isFullyBooked = fitnessClass.bookedCount >= fitnessClass.capacity;
  const spacesLeft = fitnessClass.capacity - fitnessClass.bookedCount;
  
  const handleBookClass = async () => {
    if (user) {
      await bookClass(fitnessClass.id, fitnessClass.gymId);
    }
  };
  
  return (
    <Card className="overflow-hidden rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{fitnessClass.title}</h3>
            <Badge className={`${isFullyBooked ? 'bg-red-500' : 'bg-goodfit-primary'}`}>
              {isFullyBooked ? 'Заполнено' : `${spacesLeft} мест`}
            </Badge>
          </div>
          
          {gym && (
            <p className="text-sm text-gray-500">{gym.name}</p>
          )}
          
          <div className="text-sm text-gray-700">
            <p>{formattedDate}</p>
            <p>{formattedTime}</p>
          </div>
          
          <p className="text-sm text-gray-500">Инструктор: {fitnessClass.instructor}</p>
          
          <Badge variant="outline" className="w-fit">
            {fitnessClass.category}
          </Badge>
        </div>
      </CardContent>
      
      {showBookButton && (
        <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
          <Button
            variant={isFullyBooked ? "outline" : "default"}
            className={isFullyBooked ? "" : "bg-goodfit-primary hover:bg-goodfit-dark w-full rounded-xl"}
            disabled={isFullyBooked || !user}
            onClick={handleBookClass}
          >
            {!user ? 'Войдите чтобы записаться' : isFullyBooked ? 'Заполнено' : 'Записаться'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
