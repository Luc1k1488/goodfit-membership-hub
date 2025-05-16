
import { useState, useEffect } from "react";
import { ClassCard } from "@/components/ClassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { Search, Filter } from "lucide-react";

const ClassesPage = () => {
  const { classes, getGymById } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState(classes);
  
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
    <div className="container px-4 py-8 mx-auto sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">Class Schedule</h1>
      
      {/* Search and filter */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search classes, instructors, or gyms..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
      
      {/* Class listings by date */}
      {sortedDates.length > 0 ? (
        sortedDates.map((date) => (
          <div key={date} className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">{date}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <h3 className="mb-2 text-lg font-medium">No classes found</h3>
          <p className="text-gray-600">
            Try changing your search terms or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
