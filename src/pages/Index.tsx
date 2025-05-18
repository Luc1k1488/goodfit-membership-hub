
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { Gym } from "@/types";
import { GymCard } from "@/components/GymCard";
import { SearchFilter } from "@/components/SearchFilter";
import { useApp } from "@/context/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { filteredGyms, filters, setFilters } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ ...filters, search: query });
  };

  const handleGymClick = (id: string) => {
    navigate(`/gyms/${id}`);
  };

  // Get top-rated gyms (rating >= 4.5)
  const topRatedGyms = filteredGyms
    .filter(gym => gym.rating >= 4.5)
    .slice(0, 4);

  // Get newest gyms (could be based on created_at if available)
  const newestGyms = [...filteredGyms]
    .sort((a, b) => b.review_count - a.review_count) // Using review_count as a proxy for popularity
    .slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section with search */}
      <HeroSection />

      {/* Search section */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-md">
            <SearchFilter 
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Top rated gyms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Лучшие залы</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRatedGyms.map((gym) => (
              <GymCard
                key={gym.id}
                gym={gym}
                onClick={() => handleGymClick(gym.id)}
              />
            ))}
          </div>
        </section>

        {/* Newest gyms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Недавно добавленные</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newestGyms.map((gym) => (
              <GymCard
                key={gym.id}
                gym={gym}
                onClick={() => handleGymClick(gym.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
