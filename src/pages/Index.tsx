
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gym } from "@/types";
import { HeroSection } from "@/components/HeroSection";
import { SearchFilter } from "@/components/SearchFilter";
import { ClassCard } from "@/components/ClassCard";
import { GymCard } from "@/components/GymCard";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { gyms, classes } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  
  useEffect(() => {
    // Filter gyms based on search query
    if (!searchQuery.trim()) {
      setFilteredGyms(gyms.slice(0, 3)); // Take only first 3 gyms for display
      return;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    const results = gyms.filter(
      (gym) => 
        gym.name.toLowerCase().includes(lowerQuery) ||
        gym.address.toLowerCase().includes(lowerQuery) ||
        gym.city.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);
    
    setFilteredGyms(results);
  }, [searchQuery, gyms]);
  
  const handleGymClick = (gymId: string) => {
    navigate(`/gyms/${gymId}`);
  };
  
  const handleClassClick = (gymId: string, classId: string) => {
    navigate(`/booking/${gymId}/${classId}`);
  };
  
  // Create a valid complete Gym object with all required properties for popular cities
  const popularCities = [
    {
      id: "moscow",
      name: "Москва",
      description: "Спортзалы в Москве",
      category: ["Все"],
      city: "Москва",
      address: "",
      location: { lat: 55.75, lng: 37.61 },
      main_image: "/placeholder.svg",
      images: [],
      ownerid: "",
      rating: 5,
      review_count: 0,
      working_hours: { open: "09:00", close: "22:00" },
      features: []
    },
    {
      id: "spb",
      name: "Санкт-Петербург",
      description: "Спортзалы в Санкт-Петербурге",
      category: ["Все"],
      city: "Санкт-Петербург",
      address: "",
      location: { lat: 59.93, lng: 30.31 },
      main_image: "/placeholder.svg",
      images: [],
      ownerid: "",
      rating: 5,
      review_count: 0,
      working_hours: { open: "09:00", close: "22:00" },
      features: []
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero section */}
      <HeroSection onSearch={setSearchQuery} />
      
      {/* Popular cities */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Популярные города</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {popularCities.map((city) => (
            <GymCard 
              key={city.id} 
              gym={city} 
              onClick={() => navigate(`/gyms?city=${city.city}`)}
            />
          ))}
        </div>
      </section>
      
      {/* Featured gyms */}
      {filteredGyms.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Рекомендуемые залы</h2>
            <Button variant="outline" onClick={() => navigate("/gyms")}>
              Смотреть все
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredGyms.map((gym) => (
              <GymCard 
                key={gym.id} 
                gym={gym}
                onClick={() => handleGymClick(gym.id)}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Featured classes */}
      {classes.length > 0 && (
        <section className="container mx-auto px-4 py-10 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Популярные занятия</h2>
            <Button variant="outline" onClick={() => navigate("/classes")}>
              Смотреть все
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.slice(0, 3).map((cls) => (
              <ClassCard
                key={cls.id}
                fitnessClass={cls}
                onClick={() => handleClassClick(cls.gymid, cls.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
