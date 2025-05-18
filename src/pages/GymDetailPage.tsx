
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Dumbbell, MapPin, Clock, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ClassCard } from "@/components/ClassCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FitnessClass } from "@/types";

const GymDetailPage = () => {
  const { gym_id } = useParams<{ gym_id: string }>();
  const navigate = useNavigate();
  const { getGymById, getGymClasses } = useApp();
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const gym = getGymById(gym_id!);
  
  useEffect(() => {
    const fetchClasses = async () => {
      if (gym_id) {
        setIsLoading(true);
        try {
          const gymClasses = await getGymClasses(gym_id);
          setClasses(gymClasses);
        } catch (error) {
          console.error("Error fetching classes:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchClasses();
  }, [gym_id, getGymClasses]);
  
  if (!gym) {
    return <div className="container mx-auto px-4 py-8">Зал не найден</div>;
  }
  
  const features = gym.features || [];
  
  return (
    <div className="container mx-auto px-4 py-8 mb-16">
      {/* Carousel */}
      <Carousel className="mb-8">
        <CarouselContent>
          {[gym.main_image, ...gym.images].map((image, index) => (
            <CarouselItem key={index}>
              <AspectRatio ratio={16 / 9}>
                <img
                  src={image}
                  alt={`${gym.name} - фото ${index + 1}`}
                  className="rounded-xl w-full h-full object-cover"
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Gym Details */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{gym.name}</h1>
        
        <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center">
            <MapPin size={16} className="mr-1" />
            {gym.address}
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            {gym.working_hours.open} - {gym.working_hours.close}
          </div>
          <div className="flex items-center">
            <Star size={16} className="mr-1" />
            {gym.rating} ({gym.review_count} отзывов)
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {gym.category.map((cat, idx) => (
            <Badge key={idx} variant="outline">
              {cat}
            </Badge>
          ))}
        </div>
        
        <p className="mb-6 text-muted-foreground">{gym.description}</p>
        
        {features.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Особенности</h3>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center">
                  <Dumbbell size={16} className="mr-2 text-blue-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Classes */}
      <Tabs defaultValue="classes">
        <TabsList>
          <TabsTrigger value="classes">Расписание занятий</TabsTrigger>
          <TabsTrigger value="info">Информация</TabsTrigger>
        </TabsList>
        
        <TabsContent value="classes">
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ближайшие занятия</h2>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/classes?gym_id=${gym.id}`)}
              >
                Все занятия
              </Button>
            </div>
            
            {isLoading ? (
              <p>Загрузка занятий...</p>
            ) : classes.length === 0 ? (
              <p>Нет предстоящих занятий</p>
            ) : (
              <div className="space-y-4">
                {classes.slice(0, 3).map((fitnessClass) => (
                  <ClassCard 
                    key={fitnessClass.id}
                    fitnessClass={fitnessClass}
                  />
                ))}
                
                {classes.length > 3 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate(`/classes?gym_id=${gym.id}`)}
                  >
                    Показать все {classes.length} занятий
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="info">
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Адрес</h3>
                <p>{gym.address}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Время работы</h3>
                <p>Ежедневно: {gym.working_hours.open} - {gym.working_hours.close}</p>
              </div>
              
              {features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Особенности зала</h3>
                  <ul className="list-disc pl-5">
                    {gym.features?.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GymDetailPage;
