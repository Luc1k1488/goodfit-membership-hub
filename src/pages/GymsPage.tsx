
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gym } from "@/types";
import { GymCard } from "@/components/GymCard";
import { CityFilter } from "@/components/CityFilter";
import { SearchFilter } from "@/components/SearchFilter";
import { CategoryFilter } from "@/components/CategoryFilter";
import { RatingFilter } from "@/components/RatingFilter";
import { FilterLayout } from "@/components/FilterLayout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

const GymsPage = () => {
  const { filterGyms, filteredGyms, gyms } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Apply filters
    filterGyms({
      city: selectedCity,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      search: searchQuery,
    });
  }, [selectedCity, selectedCategories, minRating, searchQuery, filterGyms]);

  const uniqueCities = [...new Set(gyms.map((gym) => gym.city))].sort();
  const uniqueCategories = [...new Set(gyms.flatMap((gym) => gym.category))].sort();

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleGymClick = (gym_id: string) => {
    navigate(`/gyms/${gym_id}`);
  };
  
  // Создаем компоненты для боковой панели и основного контента
  const sidebarContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Поиск</h3>
        <SearchFilter 
          onSearch={handleSearchChange} 
          placeholder="Название, адрес..." 
          initialValue={searchQuery}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Город</h3>
        <CityFilter 
          cities={uniqueCities} 
          onCityChange={handleCityChange} 
          activeCity={selectedCity}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Категория</h3>
        <CategoryFilter 
          categories={uniqueCategories} 
          selectedCategories={selectedCategories} 
          onChange={handleCategoryToggle}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Рейтинг</h3>
        <RatingFilter 
          onRatingChange={handleRatingChange} 
          initialRating={minRating} 
        />
      </div>
    </div>
  );
  
  const mainContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {filteredGyms.length === 0 ? (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground">Нет спортзалов, соответствующих критериям поиска.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSelectedCity("");
              setSelectedCategories([]);
              setMinRating(0);
              setSearchQuery("");
            }}
          >
            Сбросить фильтры
          </Button>
        </div>
      ) : (
        filteredGyms.map((gym) => (
          <GymCard
            key={gym.id}
            gym={gym}
            onClick={() => handleGymClick(gym.id)}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Спортзалы</h1>
      </div>

      <FilterLayout 
        sidebar={sidebarContent} 
        content={mainContent} 
      />
    </div>
  );
};

export default GymsPage;
