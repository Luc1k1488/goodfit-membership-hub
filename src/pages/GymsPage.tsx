
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
import { FilterIcon } from "lucide-react";

const allGyms: Gym[] = [
  {
    id: "1",
    name: "FitnessMaster",
    description: "Современный фитнес-центр с разнообразными программами тренировок.",
    category: ["Тренажерный зал", "Групповые занятия"],
    city: "Москва",
    address: "ул. Примерная, 123",
    location: { lat: 55.7558, lng: 37.6173 },
    main_image: "https://via.placeholder.com/300x200?text=GoodFit",
    images: ["https://via.placeholder.com/300x200?text=GoodFit"],
    ownerid: "user1",
    rating: 4.8,
    review_count: 24,
    features: [],
    working_hours: { open: "09:00", close: "21:00" },
  },
  {
    id: "2",
    name: "YogaLoft",
    description: "Студия йоги для всех уровней подготовки.",
    category: ["Йога", "Групповые занятия"],
    city: "Москва",
    address: "ул. Ленина, 45",
    location: { lat: 55.7539, lng: 37.6208 },
    main_image: "https://via.placeholder.com/300x200?text=GoodFit",
    images: ["https://via.placeholder.com/300x200?text=GoodFit"],
    ownerid: "user2",
    rating: 4.6,
    review_count: 18,
    features: [],
    working_hours: { open: "09:00", close: "21:00" },
  },
  {
    id: "3",
    name: "StrongBody",
    description: "Тренажерный зал с профессиональным оборудованием и персональными тренерами.",
    category: ["Тренажерный зал", "Персональный тренинг"],
    city: "Санкт-Петербург",
    address: "Невский пр., 78",
    location: { lat: 59.9342, lng: 30.3350 },
    main_image: "https://via.placeholder.com/300x200?text=GoodFit",
    images: ["https://via.placeholder.com/300x200?text=GoodFit"],
    ownerid: "user1",
    rating: 4.3,
    review_count: 12,
    features: [],
    working_hours: { open: "09:00", close: "21:00" },
  },
  {
    id: "4",
    name: "CrossGym",
    description: "Зал для функциональных и кроссфит тренировок.",
    category: ["Кроссфит", "Функциональный тренинг"],
    city: "Санкт-Петербург",
    address: "ул. Спортивная, 15",
    location: { lat: 59.9310, lng: 30.3609 },
    main_image: "https://via.placeholder.com/300x200?text=GoodFit",
    images: ["https://via.placeholder.com/300x200?text=GoodFit"],
    ownerid: "user3",
    rating: 4.9,
    review_count: 31,
    features: [],
    working_hours: { open: "09:00", close: "21:00" },
  },
];

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

  const handleGymClick = (gymId: string) => {
    navigate(`/gyms/${gymId}`);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Спортзалы</h1>
        <Button variant="outline" onClick={toggleFilters} className="md:hidden">
          <FilterIcon className="h-4 w-4 mr-2" />
          Фильтры
        </Button>
      </div>

      <FilterLayout showFilters={showFilters} onCloseFilters={() => setShowFilters(false)}>
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
              rating={minRating} 
              onChange={handleRatingChange} 
            />
          </div>
        </div>
        
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
      </FilterLayout>
    </div>
  );
};

export default GymsPage;
