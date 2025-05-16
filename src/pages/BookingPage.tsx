
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronLeft, Clock, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";

const BookingPage = () => {
  const { gymId, classId } = useParams<{ gymId: string; classId: string }>();
  const navigate = useNavigate();
  const { getGymById, getClassById, bookClass, user } = useApp();
  const { currentUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [fitnessClass, setFitnessClass] = useState<any>(null);
  const [gym, setGym] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tariff, setTariff] = useState("single");
  
  useEffect(() => {
    if (!classId || !gymId) {
      navigate("/classes");
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      
      const gymData = getGymById(gymId);
      const classData = getClassById(classId);
      
      if (!gymData || !classData) {
        navigate("/classes");
        return;
      }
      
      setGym(gymData);
      setFitnessClass(classData);
      
      if (currentUser) {
        setName(currentUser.name || "");
        setPhone(currentUser.phone || "");
      }
      
      // Simulate loading
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };
    
    loadData();
  }, [classId, gymId, getGymById, getClassById, navigate, currentUser]);
  
  const handleBooking = async () => {
    if (!classId || !gymId || !user) return;
    
    setBookingInProgress(true);
    
    try {
      const success = await bookClass(classId, gymId);
      
      if (success) {
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      } else {
        setBookingInProgress(false);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setBookingInProgress(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">Загрузка данных...</p>
      </div>
    );
  }
  
  if (!fitnessClass || !gym) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Занятие не найдено</p>
        <Button onClick={() => navigate("/classes")}>К расписанию</Button>
      </div>
    );
  }
  
  const startTime = parseISO(fitnessClass.startTime);
  const endTime = parseISO(fitnessClass.endTime);
  const formattedDate = format(startTime, "EEEE, d MMMM", { locale: ru });
  const formattedTime = `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`;
  const isFullyBooked = fitnessClass.bookedCount >= fitnessClass.capacity;
  
  return (
    <div className="pb-16">
      <Header>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Запись на тренировку</h1>
        </div>
      </Header>
      
      <div className="p-4">
        <Card className="p-4 mb-6">
          <h2 className="text-2xl font-bold mb-2">{formattedDate}</h2>
          
          <div className="flex gap-5 my-5">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, index) => {
              const currentDay = (startTime.getDay() + 6) % 7; // Convert to 0=Monday
              const isActive = index === currentDay;
              
              return (
                <div 
                  key={day}
                  className={`relative flex flex-col items-center ${isActive ? 'text-blue-500' : ''}`}
                >
                  <div 
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-background border'
                    }`}
                  >
                    {format(
                      new Date(
                        startTime.getFullYear(),
                        startTime.getMonth(),
                        startTime.getDate() - currentDay + index
                      ), 
                      "d"
                    )}
                  </div>
                  <span className="text-xs mt-1">{day}</span>
                  {isActive && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500"></div>}
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg border">
            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src={fitnessClass.category === "Йога" ? "/lovable-uploads/yoga.jpg" : "/lovable-uploads/fitness.jpg"} 
                alt={fitnessClass.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{fitnessClass.title}</h3>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <Clock size={14} className="mr-1" />
                {formattedTime}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin size={14} className="mr-1" />
                {gym.name}
              </div>
            </div>
            <Badge className={isFullyBooked ? "bg-red-500" : "bg-green-500"}>
              {isFullyBooked ? "Заполнено" : `${fitnessClass.capacity - fitnessClass.bookedCount} мест`}
            </Badge>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin size={16} className="mr-1" />
            {gym.address}
          </div>
        </Card>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Имя</label>
            <Input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              className="rounded-xl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Телефон</label>
            <Input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (___) ___-__-__"
              className="rounded-xl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Тариф</label>
            <Select value={tariff} onValueChange={setTariff}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Выберите тариф" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Занятие 1 раз</SelectItem>
                <SelectItem value="subscription">По абонементу</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={handleBooking}
          disabled={isFullyBooked || bookingInProgress || !user}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-6 text-lg"
        >
          {bookingInProgress ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Обработка...
            </>
          ) : isFullyBooked ? (
            "Мест нет"
          ) : !user ? (
            "Войдите чтобы записаться"
          ) : (
            "Записаться"
          )}
        </Button>
      </div>
    </div>
  );
};

export default BookingPage;
