
import { useState, useEffect } from "react";
import { ClassCard } from "@/components/ClassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { Search, Filter, Loader2, CalendarX } from "lucide-react";
import { Header } from "@/components/Header";
import { format, parseISO, addDays, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { FitnessClass } from "@/types";
import { useNavigate } from "react-router-dom";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const ClassesPage = () => {
  const { classes, getGymById } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState<FitnessClass[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Generate dates for the next 7 days for the date selector
  const dateOptions = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  
  // Filter classes based on search term and selected date
  useEffect(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      const filtered = classes.filter((cls) => {
        const classDate = parseISO(cls.startTime);
        const matchesDate = isSameDay(classDate, selectedDate);
        
        if (!matchesDate) return false;
        
        if (!searchTerm) return true;
        
        const gym = getGymById(cls.gymId);
        const searchLower = searchTerm.toLowerCase();
        
        return (
          cls.title.toLowerCase().includes(searchLower) ||
          cls.instructor.toLowerCase().includes(searchLower) ||
          cls.category.toLowerCase().includes(searchLower) ||
          (gym && gym.name.toLowerCase().includes(searchLower))
        );
      });
      
      // Sort by start time
      const sortedClasses = [...filtered].sort((a, b) => 
        parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
      );
      
      setFilteredClasses(sortedClasses);
      setIsLoading(false);
    }, 500); // Simulate loading for better UX
    
  }, [classes, searchTerm, selectedDate, getGymById]);
  
  // Format day name
  const formatDayName = (date: Date): string => {
    if (isSameDay(date, new Date())) {
      return "Сегодня";
    }
    if (isSameDay(date, addDays(new Date(), 1))) {
      return "Завтра";
    }
    return format(date, "EEE", { locale: ru });
  };
  
  const handleClassSelect = (classId: string, gymId: string) => {
    navigate(`/booking/${gymId}/${classId}`);
  };
  
  return (
    <div className="pb-16">
      <Header>
        <h1 className="text-xl font-bold">Расписание занятий</h1>
      </Header>
      
      <div className="px-4 py-4">
        {/* Date selector - Improved styling */}
        <div className="flex overflow-x-auto pb-3 mb-5 no-scrollbar">
          {dateOptions.map((date, index) => (
            <div 
              key={index}
              className="flex flex-col items-center mr-3 min-w-[68px]"
              onClick={() => setSelectedDate(date)}
            >
              <div 
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center mb-1 transition-all ${
                  isSameDay(date, selectedDate)
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-background border hover:border-blue-200'
                }`}
              >
                <span className="text-xs font-medium">{formatDayName(date)}</span>
                <span className="text-lg font-bold">{format(date, "d")}</span>
              </div>
              <span className="text-xs text-muted-foreground">{format(date, "MMM", { locale: ru })}</span>
            </div>
          ))}
        </div>
        
        {/* Search and filter */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск занятий..."
              className="pl-10 w-full rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center rounded-full">
                <Filter className="w-4 h-4 mr-2" />
                Фильтры
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
              <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Категория</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start">Йога</Button>
                    <Button variant="outline" className="justify-start">Пилатес</Button>
                    <Button variant="outline" className="justify-start">Кроссфит</Button>
                    <Button variant="outline" className="justify-start">Кардио</Button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <SheetClose asChild>
                    <Button className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-xl py-6">
                      Применить фильтры
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Class listings */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Загрузка занятий...</p>
          </div>
        ) : filteredClasses.length > 0 ? (
          <div className="grid gap-4">
            {filteredClasses.map((cls) => {
              const gym = getGymById(cls.gymId);
              return (
                <div key={cls.id} onClick={() => handleClassSelect(cls.id, cls.gymId)}>
                  <ClassCard
                    fitnessClass={cls}
                    gym={gym ? { id: gym.id, name: gym.name } : undefined}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-background rounded-xl border flex flex-col items-center">
            <CalendarX className="h-12 w-12 text-blue-400 mb-3" />
            <h3 className="mb-2 text-lg font-medium">Занятия не найдены</h3>
            <p className="text-muted-foreground">
              Пока нет занятий на выбранную дату. Попробуйте выбрать другой день или изменить параметры поиска.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;
