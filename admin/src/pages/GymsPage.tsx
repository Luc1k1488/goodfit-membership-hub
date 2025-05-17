
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabaseClient";
import { Gym } from "@/types";
import { Edit, Trash, Plus, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const GymsPage = () => {
  const { userRole, currentUser } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample gym data for demonstration
  const sampleGyms: Gym[] = [
    {
      id: "1",
      name: "FitLife Gym",
      description: "Современный тренажерный зал с новым оборудованием",
      category: ["CrossFit", "Тренажерный зал"],
      city: "Москва",
      address: "ул. Тверская, 15",
      location: { lat: 55.76, lng: 37.61 },
      mainImage: "https://via.placeholder.com/300x200?text=FitLife",
      images: ["https://via.placeholder.com/300x200?text=FitLife"],
      ownerId: "owner1",
      rating: 4.8,
      reviewCount: 124,
      features: ["Душевые", "Сауна", "Бесплатная парковка"],
      workingHours: { open: "07:00", close: "23:00" }
    },
    {
      id: "2",
      name: "GymFlex",
      description: "Сеть фитнес-клубов с гибким расписанием",
      category: ["Йога", "Пилатес"],
      city: "Санкт-Петербург",
      address: "Невский пр., 78",
      location: { lat: 59.93, lng: 30.36 },
      mainImage: "https://via.placeholder.com/300x200?text=GymFlex",
      images: ["https://via.placeholder.com/300x200?text=GymFlex"],
      ownerId: "owner2",
      rating: 4.5,
      reviewCount: 98,
      features: ["Персональные тренировки", "Кардио-зона"],
      workingHours: { open: "06:00", close: "22:00" }
    },
    {
      id: "3",
      name: "PowerHouse",
      description: "Специализированный зал для силовых тренировок",
      category: ["Силовые", "Тренажерный зал"],
      city: "Москва",
      address: "Ленинский пр., 56",
      location: { lat: 55.70, lng: 37.57 },
      mainImage: "https://via.placeholder.com/300x200?text=PowerHouse",
      images: ["https://via.placeholder.com/300x200?text=PowerHouse"],
      ownerId: "owner1",
      rating: 4.9,
      reviewCount: 145,
      features: ["Свободные веса", "Силовые тренажеры"],
      workingHours: { open: "08:00", close: "22:30" }
    },
  ];

  useEffect(() => {
    const fetchGyms = async () => {
      setIsLoading(true);
      try {
        // In real implementation, we would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('gyms')
        //   .select('*')
        //   .eq(userRole === 'PARTNER' ? 'ownerId' : '', currentUser?.id || '');
        
        // For now, we'll use sample data
        setTimeout(() => {
          // If partner, filter gyms by ownerId
          const filteredGyms = userRole === 'PARTNER'
            ? sampleGyms.filter(gym => gym.ownerId === currentUser?.id)
            : sampleGyms;
          
          setGyms(filteredGyms);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching gyms:", error);
        setIsLoading(false);
      }
    };

    fetchGyms();
  }, [userRole, currentUser?.id]);

  // Filter gyms based on search term
  const filteredGyms = gyms.filter(gym => 
    gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gym.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Управление залами</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Добавить зал
        </Button>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или городу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Категории</TableHead>
                <TableHead>Рейтинг</TableHead>
                <TableHead>Часы работы</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGyms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Не найдено залов
                  </TableCell>
                </TableRow>
              ) : (
                filteredGyms.map((gym) => (
                  <TableRow key={gym.id}>
                    <TableCell className="font-medium">{gym.name}</TableCell>
                    <TableCell>{gym.city}</TableCell>
                    <TableCell>{gym.category.join(", ")}</TableCell>
                    <TableCell>
                      {gym.rating} ({gym.reviewCount} отзывов)
                    </TableCell>
                    <TableCell>
                      {gym.workingHours.open} - {gym.workingHours.close}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default GymsPage;
