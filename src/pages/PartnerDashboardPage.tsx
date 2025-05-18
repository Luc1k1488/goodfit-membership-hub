
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useApp } from "@/context/AppContext";
import { Loader2, Plus, CalendarDays, Users, MapPin, Info, Edit, Trash2, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FitnessClass, Gym } from "@/types";

// FYI: This is a very long file that should be refactored into smaller components

const PartnerDashboardPage = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const { gyms, getGymClasses, addGym, addClass } = useApp();
  
  const [userGyms, setUserGyms] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addGymDialogOpen, setAddGymDialogOpen] = useState(false);
  const [addClassDialogOpen, setAddClassDialogOpen] = useState(false);

  // State for adding a new gym
  const [newGym, setNewGym] = useState<Partial<Gym>>({
    name: "",
    description: "",
    address: "",
    city: "Москва",
    category: ["Тренажерный зал"],
    features: ["Wi-Fi", "Душевые"],
    main_image: "/lovable-uploads/gym.jpg",
    images: ["/lovable-uploads/gym.jpg"],
    working_hours: {
      open: "08:00",
      close: "22:00"
    },
    location: { lat: 55.7558, lng: 37.6173 }
  });

  // State for adding a new class
  const [newClass, setNewClass] = useState<Partial<FitnessClass>>({
    gym_id: "",
    title: "",
    description: "",
    instructor: "",
    starttime: "",
    end_time: "",
    capacity: 20,
    booked_count: 0,
    category: "Групповое занятие"
  });

  // Load partner's gyms
  useEffect(() => {
    const loadPartnerGyms = async () => {
      if (!currentUser) return;
      
      try {
        const partnerGyms = gyms.filter(gym => gym.ownerid === currentUser.id);
        setUserGyms(partnerGyms);
        
        if (partnerGyms.length > 0 && !selectedGym) {
          setSelectedGym(partnerGyms[0]);
        }
        
      } catch (error) {
        console.error("Error loading partner gyms:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading && currentUser) {
      loadPartnerGyms();
    }
  }, [currentUser, authLoading, gyms]);

  // Load classes when a gym is selected
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedGym) return;
      
      try {
        setIsLoading(true);
        const classesData = await getGymClasses(selectedGym.id);
        setClasses(classesData);
      } catch (error) {
        console.error("Error loading classes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedGym) {
      loadClasses();
    }
  }, [selectedGym, getGymClasses]);

  const handleGymSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      // Format the gym data
      const gymData: Omit<Gym, "id"> = {
        name: newGym.name || "",
        description: newGym.description || "",
        address: newGym.address || "",
        city: newGym.city || "Москва",
        category: newGym.category || ["Тренажерный зал"],
        location: newGym.location || { lat: 55.7558, lng: 37.6173 },
        ownerid: currentUser.id,
        features: newGym.features || [],
        main_image: newGym.main_image || "/lovable-uploads/gym.jpg",
        images: newGym.images || ["/lovable-uploads/gym.jpg"],
        rating: 0,
        review_count: 0,
        working_hours: newGym.working_hours || {
          open: "08:00",
          close: "22:00"
        }
      };
      
      const gymId = await addGym(gymData);
      
      const newGymWithId = { id: gymId, ...gymData };
      setUserGyms([...userGyms, newGymWithId]);
      setSelectedGym(newGymWithId);
      
      setAddGymDialogOpen(false);
      
      // Reset form
      setNewGym({
        name: "",
        description: "",
        address: "",
        city: "Москва",
        category: ["Тренажерный зал"],
        features: ["Wi-Fi", "Душевые"],
        main_image: "/lovable-uploads/gym.jpg",
        images: ["/lovable-uploads/gym.jpg"],
        working_hours: {
          open: "08:00",
          close: "22:00"
        },
        location: { lat: 55.7558, lng: 37.6173 }
      });
      
    } catch (error) {
      console.error("Error adding gym:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGym || !newClass.title || !newClass.starttime || !newClass.end_time) {
      console.error("Missing required fields for class");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Parse dates
      const startDateTime = new Date(newClass.starttime);
      const endDateTime = new Date(newClass.end_time);
      
      // Format the class data
      const classData: Omit<FitnessClass, "id"> = {
        gym_id: selectedGym.id,
        title: newClass.title,
        description: newClass.description || "",
        instructor: newClass.instructor || "Инструктор",
        starttime: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        capacity: newClass.capacity || 20,
        booked_count: 0,
        category: newClass.category || "Групповое занятие"
      };
      
      const classId = await addClass(classData);
      
      const newClassWithId: FitnessClass = { id: classId, ...classData };
      setClasses([...classes, newClassWithId]);
      
      setAddClassDialogOpen(false);
      
      // Reset form
      setNewClass({
        gym_id: selectedGym.id,
        title: "",
        description: "",
        instructor: "",
        starttime: "",
        end_time: "",
        capacity: 20,
        booked_count: 0,
        category: "Групповое занятие"
      });
      
    } catch (error) {
      console.error("Error adding class:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Загрузка данных партнера...</p>
      </div>
    );
  }

  if (!currentUser?.role === "PARTNER") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-destructive mb-2">Доступ запрещен</h1>
        <p className="text-lg text-muted-foreground mb-4">
          У вас нет прав для доступа к панели партнера.
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Вернуться на главную
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Панель Управления Партнера</h1>
          <p className="text-muted-foreground">
            Добро пожаловать, {currentUser?.name}!
          </p>
        </div>
        <Dialog open={addGymDialogOpen} onOpenChange={setAddGymDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center bg-blue-500 hover:bg-blue-600">
              <Plus className="mr-2 h-4 w-4" />
              Добавить зал
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Добавить новый зал</DialogTitle>
              <DialogDescription>
                Заполните информацию о вашем фитнес-зале.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGymSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="gym-name">Название</Label>
                  <Input
                    id="gym-name"
                    value={newGym.name}
                    onChange={(e) => setNewGym({ ...newGym, name: e.target.value })}
                    placeholder="Название зала"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="gym-description">Описание</Label>
                  <Textarea
                    id="gym-description"
                    value={newGym.description}
                    onChange={(e) => setNewGym({ ...newGym, description: e.target.value })}
                    placeholder="Описание зала"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gym-city">Город</Label>
                    <Input
                      id="gym-city"
                      value={newGym.city}
                      onChange={(e) => setNewGym({ ...newGym, city: e.target.value })}
                      placeholder="Город"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gym-address">Адрес</Label>
                    <Input
                      id="gym-address"
                      value={newGym.address}
                      onChange={(e) => setNewGym({ ...newGym, address: e.target.value })}
                      placeholder="Адрес"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gym-open">Время открытия</Label>
                    <Input
                      id="gym-open"
                      type="time"
                      value={newGym.working_hours?.open}
                      onChange={(e) => setNewGym({
                        ...newGym,
                        working_hours: {
                          ...newGym.working_hours!,
                          open: e.target.value
                        }
                      })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gym-close">Время закрытия</Label>
                    <Input
                      id="gym-close"
                      type="time"
                      value={newGym.working_hours?.close}
                      onChange={(e) => setNewGym({
                        ...newGym,
                        working_hours: {
                          ...newGym.working_hours!,
                          close: e.target.value
                        }
                      })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="gym-category">Категория</Label>
                  <Select
                    value={newGym.category?.[0]}
                    onValueChange={(value) => setNewGym({ ...newGym, category: [value] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Тренажерный зал">Тренажерный зал</SelectItem>
                        <SelectItem value="Йога">Йога</SelectItem>
                        <SelectItem value="Кроссфит">Кроссфит</SelectItem>
                        <SelectItem value="Бассейн">Бассейн</SelectItem>
                        <SelectItem value="Единоборства">Единоборства</SelectItem>
                        <SelectItem value="Танцы">Танцы</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddGymDialogOpen(false)}
                >
                  Отменить
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    "Добавить зал"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : userGyms.length === 0 ? (
        <div className="text-center p-12 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">У вас пока нет залов</h2>
          <p className="text-muted-foreground mb-8">
            Добавьте свой первый зал, чтобы начать управление
          </p>
          <Button
            onClick={() => setAddGymDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить зал
          </Button>
        </div>
      ) : (
        <>
          {/* Gym selector */}
          <div className="mb-8">
            <Label htmlFor="gym-selector">Выберите зал для управления</Label>
            <Select
              value={selectedGym?.id}
              onValueChange={(value) => {
                const gym = userGyms.find(g => g.id === value);
                if (gym) setSelectedGym(gym);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите зал" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {userGyms.map(gym => (
                    <SelectItem key={gym.id} value={gym.id}>
                      {gym.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {selectedGym && (
            <>
              {/* Gym details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="aspect-[4/3] rounded-md overflow-hidden">
                      <img
                        src={selectedGym.main_image || "/placeholder.svg"}
                        alt={selectedGym.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold mb-2">{selectedGym.name}</h2>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedGym.city}, {selectedGym.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {selectedGym.working_hours?.open} - {selectedGym.working_hours?.close}
                      </span>
                    </div>
                    <p className="mb-4">{selectedGym.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedGym.category?.map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedGym.features?.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Classes management */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Занятия</h3>
                  <Dialog open={addClassDialogOpen} onOpenChange={setAddClassDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить занятие
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Добавить новое занятие</DialogTitle>
                        <DialogDescription>
                          Создайте новое занятие для вашего зала.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleClassSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="class-title">Название занятия</Label>
                            <Input
                              id="class-title"
                              value={newClass.title}
                              onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                              placeholder="Название занятия"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="class-description">Описание</Label>
                            <Textarea
                              id="class-description"
                              value={newClass.description}
                              onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                              placeholder="Описание занятия"
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="class-instructor">Инструктор</Label>
                            <Input
                              id="class-instructor"
                              value={newClass.instructor}
                              onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
                              placeholder="Имя инструктора"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="class-category">Категория</Label>
                            <Select
                              value={newClass.category}
                              onValueChange={(value) => setNewClass({ ...newClass, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите категорию" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Групповое занятие">Групповое занятие</SelectItem>
                                <SelectItem value="Йога">Йога</SelectItem>
                                <SelectItem value="Кроссфит">Кроссфит</SelectItem>
                                <SelectItem value="Силовая тренировка">Силовая тренировка</SelectItem>
                                <SelectItem value="Кардио">Кардио</SelectItem>
                                <SelectItem value="Танцы">Танцы</SelectItem>
                                <SelectItem value="Бокс">Бокс</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="class-start">Дата и время начала</Label>
                              <Input
                                id="class-start"
                                type="datetime-local"
                                value={newClass.starttime}
                                onChange={(e) => setNewClass({ ...newClass, starttime: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="class-end">Дата и время окончания</Label>
                              <Input
                                id="class-end"
                                type="datetime-local"
                                value={newClass.end_time}
                                onChange={(e) => setNewClass({ ...newClass, end_time: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="class-capacity">Максимальное количество участников</Label>
                            <Input
                              id="class-capacity"
                              type="number"
                              min="1"
                              max="100"
                              value={newClass.capacity}
                              onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) })}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAddClassDialogOpen(false)}
                          >
                            Отменить
                          </Button>
                          <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Сохранение...
                              </>
                            ) : (
                              "Добавить занятие"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {classes.length === 0 ? (
                  <div className="text-center p-12 border border-dashed rounded-lg">
                    <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold mb-2">Нет занятий</h4>
                    <p className="text-muted-foreground mb-6">
                      У этого зала пока нет запланированных занятий
                    </p>
                    <Button
                      onClick={() => setAddClassDialogOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить занятие
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {classes.map(cls => {
                      // Parse dates
                      const startTime = parseISO(cls.starttime);
                      const endTime = parseISO(cls.end_time);
                      
                      return (
                        <div key={cls.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-lg font-semibold">{cls.title}</h4>
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                                  {cls.category}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(startTime, "d MMMM, HH:mm", { locale: ru })} - {format(endTime, "HH:mm")}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="text-sm flex items-center gap-1">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>{cls.booked_count}/{cls.capacity}</span>
                                </div>
                                <div className="text-sm">
                                  Инструктор: {cls.instructor}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PartnerDashboardPage;
