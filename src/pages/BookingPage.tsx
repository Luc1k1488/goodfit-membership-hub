
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock, MapPin, Users, Calendar, ArrowLeft, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/auth';
import { FitnessClass, Gym } from '@/types';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

const BookingPage = () => {
  const { gym_id, class_id } = useParams<{ gym_id: string; class_id: string }>();
  const { getGymById, getClassById, bookClass } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [gym, setGym] = useState<Gym | null>(null);
  const [fitnessClass, setFitnessClass] = useState<FitnessClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!gym_id || !class_id) {
        toast.error('Некорректные параметры бронирования');
        navigate('/classes');
        return;
      }

      try {
        const [gymData, classData] = await Promise.all([
          getGymById(gym_id),
          getClassById(class_id)
        ]);

        if (!gymData || !classData) {
          throw new Error('Не удалось загрузить данные');
        }

        setGym(gymData);
        setFitnessClass(classData);
      } catch (error) {
        console.error('Error loading booking data:', error);
        toast.error('Ошибка загрузки данных');
        navigate('/classes');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [gym_id, class_id, getGymById, getClassById, navigate]);

  const handleBookClass = async () => {
    if (!gym_id || !class_id || !currentUser) {
      toast.error('Необходимо авторизоваться');
      return;
    }

    setIsBooking(true);
    try {
      const booked = await bookClass(class_id, gym_id);
      
      if (booked) {
        toast.success('Вы успешно записаны на занятие!');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (error) {
      console.error('Error booking class:', error);
      toast.error('Ошибка при записи на занятие');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Загрузка данных...</p>
      </div>
    );
  }

  if (!gym || !fitnessClass) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-destructive">Данные не найдены</p>
        <Button variant="link" onClick={() => navigate('/classes')}>
          Вернуться к списку занятий
        </Button>
      </div>
    );
  }

  const startTime = parseISO(fitnessClass.starttime);
  const endTime = parseISO(fitnessClass.end_time);
  
  const isClassFull = fitnessClass.booked_count >= fitnessClass.capacity;

  return (
    <div className="flex flex-col min-h-screen">
      <Header>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Запись на занятие</h1>
        </div>
      </Header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <CardDescription>
                {format(startTime, "d MMMM (EEEE)", { locale: ru })}
              </CardDescription>
            </div>
            <CardTitle className="text-2xl">{fitnessClass.title}</CardTitle>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardDescription>
                {format(startTime, "HH:mm", { locale: ru })} - {format(endTime, "HH:mm", { locale: ru })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Описание</h3>
              <p className="text-sm text-muted-foreground">
                {fitnessClass.description || "Описание отсутствует"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Инструктор</h3>
              <p className="text-sm">{fitnessClass.instructor}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Занято мест</h3>
              <p className="text-sm flex items-center gap-1">
                <Users className="h-4 w-4" />
                {fitnessClass.booked_count} из {fitnessClass.capacity}
                {isClassFull && <span className="text-destructive ml-2">(Все места заняты)</span>}
              </p>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Место проведения</h3>
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={gym.main_image || "/placeholder.svg"}
                    alt={gym.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{gym.name}</h4>
                  <p className="text-sm flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {gym.city}, {gym.address}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleBookClass}
              disabled={isBooking || isClassFull}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6"
            >
              {isBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Бронирование...
                </>
              ) : isClassFull ? (
                "Все места заняты"
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Записаться на занятие
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default BookingPage;
