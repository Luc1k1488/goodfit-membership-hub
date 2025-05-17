
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
import { Edit, Trash, Plus, Loader2, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GymsPage = () => {
  const { userRole, currentUser } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGym, setCurrentGym] = useState<Gym | null>(null);
  
  // Form states
  const [gymName, setGymName] = useState("");
  const [gymDescription, setGymDescription] = useState("");
  const [gymCity, setGymCity] = useState("");
  const [gymAddress, setGymAddress] = useState("");

  useEffect(() => {
    fetchGyms();
  }, [userRole, currentUser?.id]);

  const fetchGyms = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      let query = supabase.from('gyms').select('*');
      
      // If user role is PARTNER, only show their gyms
      if (userRole === 'PARTNER' && currentUser) {
        query = query.eq('ownerId', currentUser.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching gyms:", error);
        setError(`Ошибка загрузки данных: ${error.message}`);
        setGyms([]);
      } else if (data) {
        console.log("Gyms fetched:", data.length);
        setGyms(data as Gym[]);
      } else {
        setGyms([]);
      }
    } catch (error: any) {
      console.error("Error fetching gyms:", error);
      setError(`Ошибка загрузки данных: ${error.message}`);
      setGyms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGym = async () => {
    if (!gymName || !gymCity || !gymAddress) {
      toast.error("Заполните обязательные поля");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newGym = {
        name: gymName,
        description: gymDescription,
        city: gymCity,
        address: gymAddress,
        category: ["Тренажерный зал"],
        location: { lat: 0, lng: 0 }, // Default location
        mainImage: "https://via.placeholder.com/300x200?text=GoodFit",
        images: ["https://via.placeholder.com/300x200?text=GoodFit"],
        ownerId: currentUser?.id,
        rating: 0,
        reviewCount: 0,
        features: [],
        workingHours: { open: "09:00", close: "21:00" }
      };
      
      const { data, error } = await supabase
        .from('gyms')
        .insert([newGym])
        .select();
      
      if (error) throw error;
      
      toast.success("Зал успешно добавлен");
      setIsAddDialogOpen(false);
      clearGymForm();
      fetchGyms();
    } catch (error: any) {
      console.error("Error adding gym:", error);
      toast.error(`Ошибка при добавлении зала: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditGym = async () => {
    if (!currentGym || !gymName || !gymCity || !gymAddress) {
      toast.error("Заполните обязательные поля");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updatedGym = {
        name: gymName,
        description: gymDescription,
        city: gymCity,
        address: gymAddress,
      };
      
      const { error } = await supabase
        .from('gyms')
        .update(updatedGym)
        .eq('id', currentGym.id);
      
      if (error) throw error;
      
      toast.success("Зал успешно обновлен");
      setIsEditDialogOpen(false);
      clearGymForm();
      fetchGyms();
    } catch (error: any) {
      console.error("Error updating gym:", error);
      toast.error(`Ошибка при обновлении зала: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteGym = async () => {
    if (!currentGym) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('gyms')
        .delete()
        .eq('id', currentGym.id);
      
      if (error) throw error;
      
      toast.success("Зал успешно удален");
      setIsDeleteDialogOpen(false);
      setCurrentGym(null);
      fetchGyms();
    } catch (error: any) {
      console.error("Error deleting gym:", error);
      toast.error(`Ошибка при удалении зала: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearGymForm = () => {
    setGymName("");
    setGymDescription("");
    setGymCity("");
    setGymAddress("");
    setCurrentGym(null);
  };
  
  const openEditDialog = (gym: Gym) => {
    setCurrentGym(gym);
    setGymName(gym.name);
    setGymDescription(gym.description || "");
    setGymCity(gym.city);
    setGymAddress(gym.address);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (gym: Gym) => {
    setCurrentGym(gym);
    setIsDeleteDialogOpen(true);
  };

  // Filter gyms based on search term
  const filteredGyms = gyms.filter(gym => 
    gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gym.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Управление залами</h2>
        <Button onClick={() => {
          clearGymForm();
          setIsAddDialogOpen(true);
        }}>
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                <TableHead>Адрес</TableHead>
                {userRole === "ADMIN" && <TableHead>ID владельца</TableHead>}
                <TableHead>Рейтинг</TableHead>
                <TableHead>Часы работы</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGyms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={userRole === "ADMIN" ? 7 : 6} className="text-center py-10 text-muted-foreground">
                    {gyms.length === 0 ? "Залы не найдены" : "Нет залов, соответствующих поиску"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredGyms.map((gym) => (
                  <TableRow key={gym.id}>
                    <TableCell className="font-medium">{gym.name}</TableCell>
                    <TableCell>{gym.city}</TableCell>
                    <TableCell>{gym.address}</TableCell>
                    {userRole === "ADMIN" && <TableCell>{gym.ownerId}</TableCell>}
                    <TableCell>
                      {gym.rating > 0 ? `${gym.rating} (${gym.reviewCount} отзывов)` : "Нет отзывов"}
                    </TableCell>
                    <TableCell>
                      {gym.workingHours ? `${gym.workingHours.open} - ${gym.workingHours.close}` : "Не указано"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" className="mr-2" onClick={() => openEditDialog(gym)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-destructive" onClick={() => openDeleteDialog(gym)}>
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

      {/* Add Gym Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый зал</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом спортивном зале.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input 
                id="name" 
                value={gymName} 
                onChange={(e) => setGymName(e.target.value)}
                placeholder="Название зала"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input 
                id="description" 
                value={gymDescription} 
                onChange={(e) => setGymDescription(e.target.value)}
                placeholder="Краткое описание зала"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Город *</Label>
              <Input 
                id="city" 
                value={gymCity} 
                onChange={(e) => setGymCity(e.target.value)}
                placeholder="Москва"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Адрес *</Label>
              <Input 
                id="address" 
                value={gymAddress} 
                onChange={(e) => setGymAddress(e.target.value)}
                placeholder="ул. Примерная, 123"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
              Отмена
            </Button>
            <Button onClick={handleAddGym} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                "Создать"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Gym Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать зал</DialogTitle>
            <DialogDescription>
              Обновите информацию о спортивном зале.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Название *</Label>
              <Input 
                id="edit-name" 
                value={gymName} 
                onChange={(e) => setGymName(e.target.value)}
                placeholder="Название зала"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Input 
                id="edit-description" 
                value={gymDescription} 
                onChange={(e) => setGymDescription(e.target.value)}
                placeholder="Краткое описание зала"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-city">Город *</Label>
              <Input 
                id="edit-city" 
                value={gymCity} 
                onChange={(e) => setGymCity(e.target.value)}
                placeholder="Москва"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Адрес *</Label>
              <Input 
                id="edit-address" 
                value={gymAddress} 
                onChange={(e) => setGymAddress(e.target.value)}
                placeholder="ул. Примерная, 123"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Отмена
            </Button>
            <Button onClick={handleEditGym} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Gym Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие невозможно отменить. Зал "{currentGym?.name}" будет удален из системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGym}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Add Label component import
import { Label } from "@/components/ui/label";

export default GymsPage;
