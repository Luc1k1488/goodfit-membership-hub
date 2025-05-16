
import { useState, useEffect, useMemo } from "react";
import { GymCard } from "@/components/GymCard";
import { CityFilter } from "@/components/CityFilter";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchFilter } from "@/components/SearchFilter";
import { useApp } from "@/context/AppContext";
import { Gym } from "@/types";

const GymsPage = () => {
  const { gyms, filterGyms } = useApp();
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredList, setFilteredList] = useState<Gym[]>(gyms);
  
  // Extract unique cities from gyms data
  const cities = useMemo(() => {
    const citySet = new Set(gyms.map(gym => gym.city));
    return Array.from(citySet);
  }, [gyms]);
  
  // Extract unique categories from gyms data
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    gyms.forEach(gym => {
      gym.category.forEach(cat => categorySet.add(cat));
    });
    return Array.from(categorySet);
  }, [gyms]);
  
  // Filter gyms based on selected filters
  useEffect(() => {
    let filtered = [...gyms];
    
    // Apply city filter
    if (selectedCity) {
      filtered = filtered.filter(gym => 
        gym.city.toLowerCase() === selectedCity.toLowerCase()
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(gym => 
        gym.category.some(cat => selectedCategories.includes(cat))
      );
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(gym => 
        gym.name.toLowerCase().includes(query) || 
        gym.description.toLowerCase().includes(query) ||
        gym.address.toLowerCase().includes(query)
      );
    }
    
    setFilteredList(filtered);
  }, [gyms, selectedCity, selectedCategories, searchQuery]);
  
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  return (
    <div className="container px-4 py-8 mx-auto sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">Gyms & Studios</h1>
      
      <div className="grid gap-6 mb-8 md:grid-cols-[300px,1fr]">
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-medium">Search</h3>
            <SearchFilter onSearch={handleSearch} />
          </div>
          
          <div>
            <h3 className="mb-3 text-lg font-medium">Categories</h3>
            <CategoryFilter 
              categories={categories} 
              selectedCategories={selectedCategories}
              onChange={handleCategoryChange}
            />
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <CityFilter 
              cities={cities} 
              activeCity={selectedCity} 
              onCityChange={handleCityChange}
            />
          </div>
          
          {filteredList.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredList.map((gym) => (
                <GymCard key={gym.id} gym={gym} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-lg">
              <h3 className="mb-2 text-lg font-medium">No gyms found</h3>
              <p className="text-gray-600">
                Try changing your filters or search query.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymsPage;
