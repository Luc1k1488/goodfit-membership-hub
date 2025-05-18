
import { useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const BookingPage = () => {
  const { gym_id, class_id } = useParams<{ gym_id: string; class_id: string }>();
  const navigate = useNavigate();
  const { getGymById, getClassById, bookClass } = useApp();
  const { currentUser } = useAuth();
  
  const gym = getGymById(gym_id!);
  const fitnessClass = getClassById(class_id!);
  
  if (!gym || !fitnessClass) {
    return <div>Информация не найдена</div>;
  }
  
  const start_time = parseISO(fitnessClass.starttime);
  const end_time = parseISO(fitnessClass.end_time);
  
  const formatted_time = format(start_time, "HH:mm", { locale: ru });
  const formatted_end_time = format(end_time, "HH:mm", { locale: ru });
  
  const formatted_date = format(start_time, "EEEE, d MMMM", { locale: ru });
  
  const handleBooking = async () => {
    try {
      const success = await bookClass(class_id!, gym_id!);
      
      if (success) {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error during booking:", error);
      toast.error("Произошла ошибка при бронировании");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Подтверждение записи</h1>
      
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">{fitnessClass.title}</h2>
        <p className="text-sm text-muted-foreground mb-4">{fitnessClass.description}</p>
        
        <div className="border-t border-b py-4 my-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Дата</span>
            <span className="font-medium">{formatted_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Время</span>
            <span className="font-medium">{formatted_time} - {formatted_end_time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Инструктор</span>
            <span className="font-medium">{fitnessClass.instructor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Зал</span>
            <span className="font-medium">{gym.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Адрес</span>
            <span className="font-medium">{gym.address}</span>
          </div>
        </div>
        
        <div className="mt-6">
          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleBooking}
          >
            Записаться на занятие
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full mt-3"
            onClick={() => navigate(-1)}
          >
            Вернуться назад
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
