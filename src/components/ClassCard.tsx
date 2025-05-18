
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FitnessClass } from "@/types";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useApp } from "@/context/AppContext";
import { MapPin } from "lucide-react";

interface ClassCardProps {
  fitnessClass: FitnessClass;
  gym?: { id: string; name: string };
  showBookButton?: boolean;
}

export function ClassCard({ fitnessClass, gym, showBookButton = true }: ClassCardProps) {
  const { bookClass, user } = useApp();
  
  const startTime = parseISO(fitnessClass.starttime);
  const endTime = parseISO(fitnessClass.end_time);
  
  const formattedDate = format(startTime, "EEEE, d MMMM", { locale: ru });
  const formattedTime = `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`;
  
  const isFullyBooked = fitnessClass.booked_count >= fitnessClass.capacity;
  const spacesLeft = fitnessClass.capacity - fitnessClass.booked_count;
  
  const handleBookClass = async () => {
    if (user) {
      await bookClass(fitnessClass.id, fitnessClass.gymid);
    }
  };
  
  return (
    <Card className="overflow-hidden rounded-xl shadow-sm mb-3 bg-card">
      <div className="flex p-4">
        <div className="w-1/4 mr-3">
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            <img 
              src={fitnessClass.category === "Йога" 
                ? "/lovable-uploads/yoga.jpg" 
                : "/lovable-uploads/fitness.jpg"} 
              alt={fitnessClass.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="w-3/4">
          <div className="flex flex-col space-y-1">
            <h3 className="font-bold text-lg">{fitnessClass.title}</h3>
            <p className="text-sm text-blue-500">{formattedTime}</p>
            
            {gym && (
              <p className="text-sm text-muted-foreground flex items-center">
                <MapPin size={14} className="mr-1" />
                {gym.name}
              </p>
            )}
            
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-muted-foreground">{fitnessClass.instructor}</p>
              {isFullyBooked ? (
                <Badge className="bg-red-500 text-white">Заполнено</Badge>
              ) : (
                <Badge className="bg-green-500 text-white">{spacesLeft} мест</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showBookButton && (
        <CardFooter className="px-4 py-3 flex justify-between border-t">
          <Button
            variant={isFullyBooked ? "outline" : "default"}
            className={isFullyBooked ? "" : "bg-blue-500 hover:bg-blue-600 text-white w-full rounded-xl py-5"}
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
