
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/HeroSection";
import { GymCard } from "@/components/GymCard";
import { ClassCard } from "@/components/ClassCard";
import { useApp } from "@/context/AppContext";
import { compareAsc, parseISO, format } from "date-fns";
import { ru } from "date-fns/locale";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { Header } from "@/components/Header";
import { ArrowRight } from "lucide-react";

const HomePage = () => {
  const { gyms, classes, subscriptions } = useApp();
  
  // Sort classes by starttime
  const upcomingClasses = [...classes]
    .sort((a, b) => compareAsc(parseISO(a.starttime), parseISO(b.starttime)))
    .slice(0, 5);
  
  // Get top-rated gyms
  const topGyms = [...gyms]
    .filter((gym) => gym.gymid === gym.id) // Ensure we get the correct gym matching
    .slice(0, 3);
  
  return (
    <div className="pb-16">
      <Header home />
      <HeroSection />
      
      {/* Upcoming Classes Section */}
      <section className="px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ближайшие занятия</h2>
          <Link to="/classes" className="text-blue-500 flex items-center text-sm">
            Все занятия <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid gap-4">
          {upcomingClasses.map((fitnessClass) => (
            <ClassCard 
              key={fitnessClass.id} 
              fitnessClass={fitnessClass}
              showBookButton={false}
            />
          ))}
        </div>
      </section>
      
      {/* Top Gyms Section */}
      <section className="px-4 py-8 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Популярные залы</h2>
          <Link to="/gyms" className="text-blue-500 flex items-center text-sm">
            Все залы <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid gap-4">
          {topGyms.map((gym) => (
            <GymCard key={gym.id} gym={gym} />
          ))}
        </div>
      </section>
      
      {/* Memberships Section */}
      <section className="px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Абонементы</h2>
          <Link to="/subscriptions" className="text-blue-500 flex items-center text-sm">
            Все абонементы <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid gap-4">
          {subscriptions.slice(0, 2).map((subscription) => (
            <SubscriptionCard 
              key={subscription.id} 
              subscription={subscription} 
            />
          ))}
        </div>
        
        <div className="mt-4">
          <Button className="w-full rounded-xl py-6" asChild>
            <Link to="/subscriptions">
              Смотреть все варианты
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
