
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FitnessClass, Gym } from "@/types";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Users } from "lucide-react";

interface ClassCardProps {
  fitnessClass: FitnessClass;
  gym?: Gym;
  onClick?: () => void;
}

export function ClassCard({ fitnessClass, gym, onClick }: ClassCardProps) {
  // Format times for display
  const startTime = parseISO(fitnessClass.starttime);
  const endTime = parseISO(fitnessClass.end_time);
  
  const formattedDate = format(startTime, "EEEE, d MMMM", { locale: ru });
  const formattedTime = format(startTime, "HH:mm", { locale: ru });
  const formattedEndTime = format(endTime, "HH:mm", { locale: ru });

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">
              <span>{formattedDate}</span>
            </div>
            <div className="text-lg font-bold mb-1">{fitnessClass.title}</div>
            <div className="text-sm text-muted-foreground mb-2">{formattedTime} - {formattedEndTime}</div>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">{fitnessClass.category}</Badge>
                <Badge variant="secondary">{fitnessClass.instructor}</Badge>
              </div>
            </div>

            {fitnessClass.description && (
              <p className="mt-2 text-sm line-clamp-2">{fitnessClass.description}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Users size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">{fitnessClass.booked_count}/{fitnessClass.capacity}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
