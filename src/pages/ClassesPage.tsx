
import { useState, useEffect } from "react";
import { ClassCard } from "@/components/ClassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { Search, Filter } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const ClassesPage = () => {
  const { classes, getGymById } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState(classes);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filter classes based on search term
  useEffect(() => {
    const filtered = classes.filter((cls) => {
      const gym = getGymById(cls.gymId);
      const searchLower = searchTerm.toLowerCase();
      
      return (
        cls.title.toLowerCase().includes(searchLower) ||
        cls.instructor.toLowerCase().includes(searchLower) ||
        cls.category.toLowerCase().includes(searchLower) ||
        (gym && gym.name.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredClasses(filtered);
  }, [classes, searchTerm, getGymById]);
  
  // Group classes by date
  const groupedClasses = filteredClasses.reduce((acc, cls) => {
    const date = new Date(cls.startTime).toDateString();
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(cls);
    return acc;
  }, {} as Record<string, typeof classes>);
  
  // Sort dates chronologically
  const sortedDates = Object.keys(groupedClasses).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  
  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-xl font-bold">Расписание занятий</h1>
      
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
            <h3 className="text-lg font-medium mb-4">Фильтры</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Категория</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start">Йога</Button>
                  <Button variant="outline" className="justify-start">Пилатес</Button>
                  <Button variant="outline" className="justify-start">Кроссфит</Button>
                  <Button variant="outline" className="justify-start">Кардио</Button>
                </div>
              </div>
              
              <div className="pt-4">
                <SheetClose asChild>
                  <Button className="w-full bg-goodfit-primary hover:bg-goodfit-dark rounded-xl py-6">
                    Применить фильтры
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Class listings by date */}
      {sortedDates.length > 0 ? (
        sortedDates.map((date) => (
          <div key={date} className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">{date}</h2>
            <div className="grid gap-4">
              {groupedClasses[date].map((cls) => {
                const gym = getGymById(cls.gymId);
                return (
                  <ClassCard
                    key={cls.id}
                    fitnessClass={cls}
                    gym={gym ? { id: gym.id, name: gym.name } : undefined}
                  />
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-xl">
          <h3 className="mb-2 text-lg font-medium">Занятия не найдены</h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
