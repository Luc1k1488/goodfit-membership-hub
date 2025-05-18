
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Star, MapPin, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { FitnessClass, Gym } from "@/types";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/Header";

const GymDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGymById, getGymClasses } = useApp();
  
  const [gym, setGym] = useState<Gym | null>(null);
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchGym = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const gymData = await getGymById(id);
        if (gymData) {
          setGym(gymData);
          
          // Also fetch classes
          const classesData = await getGymClasses(id);
          setClasses(classesData);
        } else {
          // Gym not found
          navigate("/gyms");
        }
      } catch (error) {
        console.error("Error fetching gym:", error);
        navigate("/gyms");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGym();
  }, [id, navigate, getGymById, getGymClasses]);
  
  if (isLoading || !gym) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  const features = gym.features || [];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium truncate">{gym.name}</h1>
        </div>
      </Header>
      
      <div className="relative">
        <AspectRatio ratio={16/9} className="w-full bg-muted">
          <img
            src={gym.main_image}
            alt={gym.name}
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{gym.name}</h1>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{gym.city}, {gym.address}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{gym.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({gym.review_count})</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{gym.working_hours?.open} - {gym.working_hours?.close}</span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="info" className="mb-8">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="schedule">Расписание</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">О зале</h2>
              <p className="text-muted-foreground">
                {gym.description}
              </p>
            </div>
            
            {features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Удобства</h2>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CircleCheck className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Категории</h2>
              <div className="flex flex-wrap gap-2">
                {gym.category.map((cat, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Фотографии</h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {gym.images.map((image, idx) => (
                    <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-0">
                            <img
                              src={image}
                              alt={`${gym.name} photo ${idx + 1}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule">
            {classes.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-lg font-semibold mb-2">Нет запланированных занятий</h2>
                <p className="text-muted-foreground">
                  У данного зала пока нет доступных занятий в расписании
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => {
                  const startTime = parseISO(cls.starttime);
                  const endTime = parseISO(cls.end_time);
                  
                  return (
                    <Card key={cls.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                              {format(startTime, "d MMMM, EEEE", { locale: ru })}
                            </div>
                            <h3 className="text-lg font-semibold mb-1">{cls.title}</h3>
                            <div className="text-sm text-muted-foreground">
                              {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                            </div>
                            <div className="text-sm mt-1">
                              Инструктор: {cls.instructor}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                {cls.category}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {cls.booked_count}/{cls.capacity} мест занято
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => navigate(`/booking/${gym.id}/${cls.id}`)}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            Записаться
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{gym.rating.toFixed(1)}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= Math.round(gym.rating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {gym.review_count} {gym.review_count === 1 ? 'отзыв' : 
                      (gym.review_count > 1 && gym.review_count < 5) ? 'отзыва' : 'отзывов'}
                  </span>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Написать отзыв
                </Button>
              </div>
              <Separator />
              <div className="py-8 text-center text-muted-foreground">
                <p>Отзывов пока нет</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GymDetailPage;
