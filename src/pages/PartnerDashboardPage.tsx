
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import {
  Building2,
  CalendarClock,
  Loader2,
  Search,
  Plus,
  X,
  Edit,
  Trash
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { FitnessClass, Gym, Booking } from "@/types";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PartnerDashboardPage = () => {
  const { currentUser, isLoading } = useAuth();
  const { gyms, addClass, addGym } = useApp();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("gyms");
  const [partnerGyms, setPartnerGyms] = useState<Gym[]>([]);
  const [partnerClasses, setPartnerClasses] = useState<FitnessClass[]>([]);
  const [partnerBookings, setPartnerBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [gymDialogOpen, setGymDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);

  // New gym form state
  const [newGym, setNewGym] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    category: ["Фитнес"],
    features: ["Wi-Fi", "Душевые"],
    mainImage: "/lovable-uploads/gym.jpg",
    images: ["/lovable-uploads/gym.jpg"],
    workingHours: {
      open: "08:00",
      close: "22:00"
    }
  });

  // New class form state
  const [newClass, setNewClass] = useState({
    gymId: "",
    title: "",
    description: "",
    instructor: "",
    startTime: "",
    endTime: "",
    category: "Фитнес",
    capacity: 20
  });

  // Check if user is partner
  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      
      if (currentUser.role !== "PARTNER") {
        if (currentUser.role === "ADMIN") {
          navigate("/admin-dashboard");
        } else {
          navigate("/profile");
        }
      }
    }
  }, [currentUser, isLoading, navigate]);
  
  // Load partner data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || currentUser.role !== "PARTNER") return;
      
      try {
        setIsDataLoading(true);
        
        // Fetch partner's gyms
        const { data: gymsData, error: gymsError } = await supabase
          .from('gyms')
          .select('*')
          .eq('owner_id', currentUser.id);
          
        if (gymsError) throw gymsError;
        
        const formattedGyms = gymsData.map(gym => ({
          id: gym.id,
          name: gym.name,
          description: gym.description,
          address: gym.address,
          city: gym.city,
          mainImage: gym.main_image,
          images: gym.images,
          features: gym.features,
          category: gym.category,
          location: { lat: gym.location?.lat || 0, lng: gym.location?.lng || 0 },
          workingHours: gym.working_hours,
          rating: gym.rating,
          reviewCount: gym.review_count,
          ownerId: gym.owner_id
        }));
        
        setPartnerGyms(formattedGyms);
        
        if (formattedGyms.length > 0) {
          // Fetch classes for partner's gyms
          const gymIds = formattedGyms.map(gym => gym.id);
          
          const { data: classesData, error: classesError } = await supabase
            .from('classes')
            .select('*')
            .in('gym_id', gymIds);
            
          if (classesError) throw classesError;
          
          const formattedClasses = classesData.map(cls => ({
            id: cls.id,
            gymId: cls.gym_id,
            title: cls.title,
            description: cls.description,
            instructor: cls.instructor,
            startTime: cls.start_time,
            endTime: cls.end_time,
            category: cls.category,
            capacity: cls.capacity,
            bookedCount: cls.booked_count
          }));
          
          setPartnerClasses(formattedClasses);
          
          // Fetch bookings for partner's classes
          const classIds = formattedClasses.map(cls => cls.id);
          
          if (classIds.length > 0) {
            const { data: bookingsData, error: bookingsError } = await supabase
              .from('bookings')
              .select('*, classes:class_id(*), users:user_id(*)')
              .in('class_id', classIds);
              
            if (bookingsError) throw bookingsError;
            
            const formattedBookings = bookingsData.map(booking => ({
              id: booking.id,
              userId: booking.user_id,
              classId: booking.class_id,
              gymId: booking.gym_id,
              status: booking.status,
              dateTime: booking.date_time,
              userName: booking.users?.name || '',
              className: booking.classes?.title || '',
              gymName: formattedGyms.find(gym => gym.id === booking.gym_id)?.name || ''
            }));
            
            setPartnerBookings(formattedBookings);
          }
        }
      } catch (error) {
        console.error("Error fetching partner data:", error);
      } finally {
        setTimeout(() => {
          setIsDataLoading(false);
        }, 500);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Handle adding a new gym
  const handleAddGym = async () => {
    if (!currentUser) return;
    
    try {
      const gymToAdd = {
        ...newGym,
        location: { lat: 0, lng: 0 },
        ownerId: currentUser.id
      };
      
      await addGym(gymToAdd);
      setGymDialogOpen(false);
      
      // Reload the page to refresh data
      navigate(0);
    } catch (error) {
      console.error("Error adding gym:", error);
    }
  };
  
  // Handle adding a new class
  const handleAddClass = async () => {
    try {
      const startDateTime = new Date(newClass.startTime);
      const endDateTime = new Date(newClass.endTime);
      
      const classToAdd = {
        ...newClass,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      };
      
      await addClass(classToAdd);
      setClassDialogOpen(false);
      
      // Reload the page to refresh data
      navigate(0);
    } catch (error) {
      console.error("Error adding class:", error);
    }
  };

  if (isLoading || isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">Загрузка панели партнёра...</p>
      </div>
    );
  }
  
  if (!currentUser || currentUser.role !== "PARTNER") {
    return null;
  }

  return (
    <div className="pb-16">
      <Header>
        <h1 className="text-xl font-bold">Панель партнёра</h1>
      </Header>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-xl">{partnerGyms.length}</CardTitle>
              <p className="text-sm text-muted-foreground">Мои залы</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <CalendarClock className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-xl">{partnerClasses.length}</CardTitle>
              <p className="text-sm text-muted-foreground">Занятия</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="gyms">Залы</TabsTrigger>
              <TabsTrigger value="classes">Занятия</TabsTrigger>
              <TabsTrigger value="bookings">Записи</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeTab === 'gyms' && (
            <Dialog open={gymDialogOpen} onOpenChange={setGymDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="ml-2 bg-blue-500 text-white">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить новый зал</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Название</label>
                    <Input 
                      value={newGym.name} 
                      onChange={e => setNewGym({...newGym, name: e.target.value})}
                      placeholder="Название зала"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Описание</label>
                    <Textarea 
                      value={newGym.description} 
                      onChange={e => setNewGym({...newGym, description: e.target.value})}
                      placeholder="Описание зала"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Город</label>
                      <Input 
                        value={newGym.city} 
                        onChange={e => setNewGym({...newGym, city: e.target.value})}
                        placeholder="Москва"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Адрес</label>
                      <Input 
                        value={newGym.address} 
                        onChange={e => setNewGym({...newGym, address: e.target.value})}
                        placeholder="ул. Примерная, 1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Время открытия</label>
                      <Input 
                        type="time" 
                        value={newGym.workingHours.open} 
                        onChange={e => setNewGym({
                          ...newGym, 
                          workingHours: {...newGym.workingHours, open: e.target.value}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Время закрытия</label>
                      <Input 
                        type="time" 
                        value={newGym.workingHours.close} 
                        onChange={e => setNewGym({
                          ...newGym, 
                          workingHours: {...newGym.workingHours, close: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddGym} 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={!newGym.name || !newGym.address}
                  >
                    Добавить зал
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {activeTab === 'classes' && (
            <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="ml-2 bg-blue-500 text-white">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить новое занятие</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Зал</label>
                    <Select 
                      value={newClass.gymId} 
                      onValueChange={value => setNewClass({...newClass, gymId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите зал" />
                      </SelectTrigger>
                      <SelectContent>
                        {partnerGyms.map(gym => (
                          <SelectItem key={gym.id} value={gym.id}>
                            {gym.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Название</label>
                    <Input 
                      value={newClass.title} 
                      onChange={e => setNewClass({...newClass, title: e.target.value})}
                      placeholder="Название занятия"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Описание</label>
                    <Textarea 
                      value={newClass.description} 
                      onChange={e => setNewClass({...newClass, description: e.target.value})}
                      placeholder="Описание занятия"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Инструктор</label>
                    <Input 
                      value={newClass.instructor} 
                      onChange={e => setNewClass({...newClass, instructor: e.target.value})}
                      placeholder="Имя инструктора"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Дата и время начала</label>
                      <Input 
                        type="datetime-local" 
                        value={newClass.startTime} 
                        onChange={e => setNewClass({...newClass, startTime: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Дата и время окончания</label>
                      <Input 
                        type="datetime-local" 
                        value={newClass.endTime} 
                        onChange={e => setNewClass({...newClass, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Категория</label>
                      <Select 
                        value={newClass.category} 
                        onValueChange={value => setNewClass({...newClass, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Йога">Йога</SelectItem>
                          <SelectItem value="Пилатес">Пилатес</SelectItem>
                          <SelectItem value="Кроссфит">Кроссфит</SelectItem>
                          <SelectItem value="Фитнес">Фитнес</SelectItem>
                          <SelectItem value="Танцы">Танцы</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Вместимость</label>
                      <Input 
                        type="number" 
                        value={newClass.capacity.toString()} 
                        onChange={e => setNewClass({...newClass, capacity: parseInt(e.target.value) || 1})}
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddClass} 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={!newClass.title || !newClass.gymId || !newClass.startTime || !newClass.endTime}
                  >
                    Добавить занятие
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="gyms" className="space-y-4 mt-0">
          {partnerGyms.length > 0 ? (
            <div>
              {partnerGyms
                .filter(gym => 
                  gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  gym.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  gym.city.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(gym => (
                  <Card key={gym.id} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 overflow-hidden rounded">
                          <img 
                            src={gym.mainImage} 
                            alt={gym.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{gym.name}</p>
                            <p className="text-sm">★ {gym.rating.toFixed(1)}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{gym.address}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {gym.category?.slice(0, 2).map((cat, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <Button size="sm" variant="outline" className="text-blue-500 border-blue-500">
                          <Edit className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>
                        <Button size="sm" variant="outline" className="text-blue-500 border-blue-500">
                          <CalendarClock className="h-4 w-4 mr-1" />
                          Занятия
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">У вас пока нет залов</h3>
                <p className="text-muted-foreground mb-4">
                  Добавьте свой первый зал, чтобы начать создавать расписание занятий
                </p>
                <Button 
                  onClick={() => setGymDialogOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить зал
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="classes" className="space-y-4 mt-0">
          {partnerGyms.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Сначала добавьте зал</h3>
                <p className="text-muted-foreground mb-4">
                  Прежде чем добавлять занятия, нужно создать хотя бы один зал
                </p>
                <Button 
                  onClick={() => {
                    setActiveTab("gyms");
                    setGymDialogOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Добавить зал
                </Button>
              </CardContent>
            </Card>
          ) : partnerClasses.length > 0 ? (
            <div>
              {partnerClasses
                .filter(cls => 
                  cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  cls.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  cls.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(cls => {
                  const gymName = partnerGyms.find(gym => gym.id === cls.gymId)?.name || "";
                  const startTime = parseISO(cls.startTime);
                  const endTime = parseISO(cls.endTime);
                  
                  return (
                    <Card key={cls.id} className="mb-4">
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{cls.title}</h3>
                          <Badge className={cls.bookedCount >= cls.capacity ? "bg-red-500" : "bg-green-500"}>
                            {cls.bookedCount} / {cls.capacity}
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-500">
                          {format(startTime, "d MMMM, HH:mm", { locale: ru })} - {format(endTime, "HH:mm")}
                        </p>
                        <p className="text-sm text-muted-foreground">Зал: {gymName}</p>
                        <p className="text-sm text-muted-foreground">Инструктор: {cls.instructor}</p>
                        <div className="flex justify-end gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-blue-500 border-blue-500">
                            <Edit className="h-4 w-4 mr-1" />
                            Изменить
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-500">
                            <Trash className="h-4 w-4 mr-1" />
                            Удалить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              }
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarClock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">Занятия не добавлены</h3>
                <p className="text-muted-foreground mb-4">
                  Создайте расписание занятий для ваших залов
                </p>
                <Button 
                  onClick={() => setClassDialogOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить занятие
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-4 mt-0">
          {partnerBookings.length > 0 ? (
            <div>
              {partnerBookings
                .filter(booking => 
                  booking.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  booking.gymName?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(booking => (
                  <Card key={booking.id} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{booking.className}</h3>
                        <Badge 
                          className={
                            booking.status === 'BOOKED' ? 'bg-green-500' : 
                            booking.status === 'COMPLETED' ? 'bg-blue-500' : 
                            'bg-red-500'
                          }
                        >
                          {booking.status === 'BOOKED' ? 'Активна' : 
                           booking.status === 'COMPLETED' ? 'Завершена' : 
                           'Отменена'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Клиент: {booking.userName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Зал: {booking.gymName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Дата: {new Date(booking.dateTime).toLocaleString()}
                      </p>
                      <div className="flex justify-end gap-2 mt-3">
                        <Button size="sm" variant="outline" className="text-blue-500 border-blue-500">
                          Изменить статус
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 border-red-500">
                          <X className="h-4 w-4 mr-1" />
                          Отменить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Нет записей на занятия</h3>
                <p className="text-muted-foreground">
                  Записи клиентов на ваши занятия будут отображаться здесь
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </div>
    </div>
  );
};

export default PartnerDashboardPage;
