
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ClassCard } from "@/components/ClassCard";
import { useApp } from "@/context/AppContext";
import { Star, Clock, MapPin, ChevronLeft } from "lucide-react";

const GymDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getGymById, getGymClasses } = useApp();
  const [activeTab, setActiveTab] = useState<string>("classes");
  const [classes, setClasses] = useState<any[]>([]);
  
  const gym = getGymById(id || "");
  
  useEffect(() => {
    const fetchClasses = async () => {
      if (id) {
        const gymClasses = await getGymClasses(id);
        setClasses(gymClasses);
      }
    };
    
    fetchClasses();
  }, [id, getGymClasses]);
  
  if (!gym) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Зал не найден</h1>
        <p className="mt-4 text-gray-600">Данный зал не существует или был удален.</p>
        <Button className="mt-6 rounded-xl" asChild>
          <Link to="/gyms">Вернуться к залам</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="pb-4">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center border-b">
        <Link to="/gyms" className="mr-2">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">{gym.name}</h1>
      </div>
      
      {/* Gym Images */}
      <div className="relative mb-4">
        <img 
          src={gym.mainImage} 
          alt={gym.name} 
          className="object-cover w-full h-56"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-white text-black">
            <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" /> 
            {gym.rating}
          </Badge>
        </div>
      </div>
      
      <div className="px-4">
        {/* Address and Working Hours */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <MapPin className="w-4 h-4 mr-1" />
            {gym.address}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {gym.workingHours?.open} - {gym.workingHours?.close}
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {gym.category?.map((category, index) => (
            <Badge key={index} variant="outline" className="capitalize">
              {category}
            </Badge>
          ))}
        </div>
        
        {/* Gym Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="classes" className="flex-1">Занятия</TabsTrigger>
            <TabsTrigger value="details" className="flex-1">Инфо</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Отзывы</TabsTrigger>
          </TabsList>
          
          <TabsContent value="classes" className="pt-4">
            <h2 className="mb-4 text-lg font-semibold">Предстоящие занятия</h2>
            {classes.length > 0 ? (
              <div className="grid gap-4">
                {classes.map((fitnessClass) => (
                  <ClassCard 
                    key={fitnessClass.id} 
                    fitnessClass={fitnessClass} 
                    showBookButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-gray-50 rounded-xl">
                <p>Нет предстоящих занятий. Проверьте позже!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="pt-4">
            <div>
              <h2 className="mb-4 text-lg font-semibold">О {gym.name}</h2>
              <p className="text-gray-700">{gym.description}</p>
              
              <h3 className="mt-6 mb-3 text-lg font-medium">Особенности</h3>
              <ul className="grid grid-cols-2 gap-2">
                {gym.features?.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <h3 className="mt-6 mb-3 text-lg font-medium">Местоположение</h3>
              <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-4">
                <p className="text-gray-500">Карта</p>
              </div>
              <p className="text-gray-700">{gym.address}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="pt-4">
            <div className="flex items-center mb-6">
              <div className="flex items-center mr-4">
                <Star className="w-6 h-6 text-yellow-400 mr-1 fill-current" />
                <span className="text-2xl font-bold">{gym.rating}</span>
              </div>
              <span className="text-gray-600">На основе {gym.reviewCount} отзывов</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-3 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="font-medium">Мария С.</p>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-gray-500">2 месяца назад</span>
                </div>
                <p className="text-gray-700">
                  Отличные тренажеры и дружелюбный персонал! Оборудование всегда чистое и в хорошем состоянии.
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-3 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4" />
                  </div>
                  <p className="font-medium">Алексей Т.</p>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-gray-500">3 недели назад</span>
                </div>
                <p className="text-gray-700">
                  Занятия здесь просто отличные! Инструкторы знающие и мотивируют.
                  Только 4 звезды, потому что раздевалки бывают переполнены в часы пик.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="w-full bg-goodfit-primary hover:bg-goodfit-dark rounded-xl py-6">
                Написать отзыв
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GymDetailPage;
