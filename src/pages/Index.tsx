
import React from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Users, CalendarRange, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ClassCard } from "@/components/ClassCard";
import { GymCard } from "@/components/GymCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const IndexPage = () => {
  const { classes, gyms } = useApp();
  
  // Get upcoming classes
  const upcomingClasses = classes
    .filter(fitnessClass => Date.parse(fitnessClass.starttime) > Date.now())
    .slice(0, 4);
  
  // Get top-rated gyms
  const topGyms = [...gyms]
    .filter((gym) => gym.id) // Changed to just check if gym.id exists
    .slice(0, 3);
  
  return (
    <div className="pb-16">
      <Header home={true} />
      <HeroSection />
      
      {/* Upcoming Classes Section */}
      <section className="py-10 px-4 container max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ближайшие занятия</h2>
          <Button variant="ghost" asChild>
            <Link to="/classes" className="flex items-center">
              <span>Все занятия</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingClasses.map((fitnessClass) => (
            <ClassCard 
              key={fitnessClass.id} 
              fitnessClass={fitnessClass} 
              gym={{
                id: fitnessClass.gymid,
                name: gyms.find(gym => gym.id === fitnessClass.gymid)?.name || "Unknown"
              }}
            />
          ))}
        </div>
        
        {upcomingClasses.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-muted-foreground">Нет предстоящих занятий</p>
          </div>
        )}
      </section>
      
      {/* Top Gyms Section */}
      <section className="py-10 px-4 bg-gray-50 dark:bg-gray-800/30">
        <div className="container max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Лучшие фитнес-центры</h2>
            <Button variant="ghost" asChild>
              <Link to="/gyms" className="flex items-center">
                <span>Все центры</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topGyms.map((gym) => (
              <GymCard key={gym.id} gym={gym} />
            ))}
          </div>
          
          {topGyms.length === 0 && (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-muted-foreground">Нет доступных фитнес-центров</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 container max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-10 text-center">Почему выбирают нас</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Dumbbell className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Широкий выбор</h3>
                <p className="text-muted-foreground">Более 100 фитнес-центров в разных районах города</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Опытные тренеры</h3>
                <p className="text-muted-foreground">Профессиональные инструкторы с большим опытом</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <CalendarRange className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Гибкий график</h3>
                <p className="text-muted-foreground">Удобное расписание занятий 7 дней в неделю</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Subscription Promo */}
      <section className="py-12 px-4 bg-blue-500 text-white">
        <div className="container max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Готовы начать?</h2>
          <p className="max-w-2xl mx-auto mb-6">Оформите абонемент уже сегодня и получите доступ ко всем центрам и занятиям</p>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-400 hover:text-white" asChild>
            <Link to="/subscriptions">
              Выбрать абонемент
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
