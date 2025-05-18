
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassCard } from '@/components/ClassCard';
import { useAuth } from '@/context/auth';
import { useApp } from '@/context/AppContext';
import { FilterLayout } from '@/components/FilterLayout';
import { DateFilter } from '@/components/DateFilter';
import { CityFilter } from '@/components/CityFilter';
import { CategoryFilter } from '@/components/CategoryFilter';
import { format, addDays, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FitnessClass, Gym } from '@/types';

const ClassesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { gyms, getGymById, getGymClasses } = useApp();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<FitnessClass[]>([]);
  const [classGyms, setClassGyms] = useState<Record<string, Gym>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Get unique list of cities from gyms
  const cities = [...new Set(gyms.map(gym => gym.city))].sort();

  // Define available class categories
  const categories = [
    'Групповое занятие',
    'Йога',
    'Кроссфит',
    'Силовая тренировка',
    'Кардио',
    'Танцы',
    'Бокс'
  ];

  // Load all classes from all gyms
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        if (gyms.length === 0) return;

        const classesPromises = gyms.map(gym => getGymClasses(gym.id));
        const classesResults = await Promise.all(classesPromises);
        
        let allClasses: FitnessClass[] = [];
        classesResults.forEach(gymClasses => {
          allClasses = [...allClasses, ...gymClasses];
        });

        // Create a mapping of gym IDs to gym objects for quick lookup
        const gymsMap: Record<string, Gym> = {};
        gyms.forEach(gym => {
          gymsMap[gym.id] = gym;
        });
        
        setClassGyms(gymsMap);
        setClasses(allClasses);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [gyms, getGymClasses]);

  // Apply filters whenever filter values or classes change
  useEffect(() => {
    let filtered = [...classes];
    
    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(cls => {
        const classDate = new Date(cls.starttime);
        return isSameDay(classDate, selectedDate);
      });
    }
    
    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(cls => {
        const gym = classGyms[cls.gym_id];
        return gym && gym.city === selectedCity;
      });
    }
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(cls => 
        selectedCategories.includes(cls.category)
      );
    }
    
    setFilteredClasses(filtered);
  }, [selectedDate, selectedCity, selectedCategories, classes, classGyms]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const handleClassClick = (cls: FitnessClass) => {
    navigate(`/booking/${cls.gym_id}/${cls.id}`);
  };

  // Generate date tabs
  const dateTabs = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(new Date(), i);
    dateTabs.push({
      value: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Сегодня' : format(date, 'E', { locale: ru }),
      subLabel: format(date, 'd MMM', { locale: ru }),
      date
    });
  }

  // Filter components for sidebar
  const filterSidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Дата</h3>
        <DateFilter
          selectedDate={selectedDate}
          onChange={handleDateChange}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Город</h3>
        <CityFilter
          cities={cities}
          activeCity={selectedCity}
          onCityChange={handleCityChange}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Категория</h3>
        <CategoryFilter
          categories={categories}
          selectedCategories={selectedCategories}
          onChange={handleCategoryToggle}
        />
      </div>
    </div>
  );
  
  // Main content with class cards
  const mainContent = (
    <>
      {/* Mobile date tabs */}
      <Tabs 
        defaultValue={format(selectedDate, 'yyyy-MM-dd')}
        className="md:hidden mb-6"
        onValueChange={(value) => {
          const date = new Date(value);
          setSelectedDate(date);
        }}
      >
        <TabsList className="grid grid-cols-7 w-full">
          {dateTabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex flex-col text-xs py-1.5"
            >
              <span>{tab.label}</span>
              <span>{tab.subLabel}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Загрузка занятий...</p>
          </div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold mb-2">Нет доступных занятий</h2>
          <p className="text-muted-foreground mb-6">
            Попробуйте изменить фильтры или выбрать другую дату
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedDate(new Date());
              setSelectedCity('');
              setSelectedCategories([]);
            }}
          >
            Сбросить фильтры
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClasses.map(cls => {
            const gym = classGyms[cls.gym_id];
            return (
              <ClassCard
                key={cls.id}
                fitnessClass={cls}
                gym={gym}
                onClick={() => handleClassClick(cls)}
              />
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header>
        <h1 className="text-lg font-medium">Занятия</h1>
      </Header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <FilterLayout
          sidebar={filterSidebar}
          content={mainContent}
        />
      </main>
    </div>
  );
};

export default ClassesPage;
