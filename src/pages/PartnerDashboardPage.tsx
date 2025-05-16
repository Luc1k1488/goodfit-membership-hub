
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Gym, Class, Booking } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { 
  Home, 
  Calendar, 
  Users, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle, 
  XCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PartnerDashboardPage = () => {
  const { currentUser } = useAuth();
  const { gyms, classes, addGym, updateGym, addClass, updateClass, deleteClass } = useApp();
  
  const [partnerGyms, setPartnerGyms] = useState<Gym[]>([]);
  const [partnerClasses, setPartnerClasses] = useState<Class[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  
  const [newGym, setNewGym] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    category: [''],
    features: [''],
    mainImage: '',
    images: [''],
    workingHours: { open: '09:00', close: '22:00' }
  });
  
  const [newClass, setNewClass] = useState({
    gymId: '',
    title: '',
    description: '',
    instructor: '',
    startTime: '',
    endTime: '',
    category: '',
    capacity: 20
  });

  const [stats, setStats] = useState({
    totalGyms: 0,
    todayClasses: 0,
    monthlyVisits: 0,
    monthlyRevenue: 0
  });
  
  // Load partner data
  useEffect(() => {
    if (!currentUser) return;
    
    const loadPartnerData = async () => {
      // Filter gyms owned by this partner
      const partnerGymsList = gyms.filter(gym => gym.ownerId === currentUser.id);
      setPartnerGyms(partnerGymsList);
      
      // Filter classes for partner's gyms
      const gymIds = partnerGymsList.map(gym => gym.id);
      const partnerClassesList = classes.filter(cls => gymIds.includes(cls.gymId));
      setPartnerClasses(partnerClassesList);
      
      // Load bookings for partner's classes
      if (gymIds.length > 0) {
        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            classes:class_id(*),
            users:user_id(*)
          `)
          .in('gym_id', gymIds);
        
        if (error) {
          console.error('Error loading bookings:', error);
        } else if (bookingsData) {
          setBookings(bookingsData);
        }
      }
      
      // Set stats
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
      
      const todayClassesCount = partnerClassesList.filter(cls => 
        cls.startTime >= todayStart && cls.startTime < todayEnd
      ).length;
      
      setStats({
        totalGyms: partnerGymsList.length,
        todayClasses: todayClassesCount,
        monthlyVisits: bookings.length,
        monthlyRevenue: bookings.length * 1000 // Simple mock revenue calc
      });
    };
    
    loadPartnerData();
  }, [currentUser, gyms, classes]);
  
  const handleAddGym = async () => {
    try {
      await addGym({
        ...newGym,
        location: { lat: 0, lng: 0 }, // Default location
      });
      
      // Reset form
      setNewGym({
        name: '',
        description: '',
        address: '',
        city: '',
        category: [''],
        features: [''],
        mainImage: '',
        images: [''],
        workingHours: { open: '09:00', close: '22:00' }
      });
    } catch (error) {
      console.error("Error adding gym:", error);
    }
  };
  
  const handleAddClass = async () => {
    try {
      await addClass(newClass);
      
      // Reset form
      setNewClass({
        gymId: '',
        title: '',
        description: '',
        instructor: '',
        startTime: '',
        endTime: '',
        category: '',
        capacity: 20
      });
    } catch (error) {
      console.error("Error adding class:", error);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header>
        <h1 className="text-xl font-bold">Панель партнера</h1>
      </Header>
      
      <div className="container px-4 py-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-goodfit-primary mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ваши залы</p>
                  <p className="text-2xl font-bold">{stats.totalGyms}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-goodfit-secondary mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Занятия сегодня</p>
                  <p className="text-2xl font-bold">{stats.todayClasses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-amber-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Посещения</p>
                  <p className="text-2xl font-bold">{stats.monthlyVisits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-emerald-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Доход</p>
                  <p className="text-2xl font-bold">₽{stats.monthlyRevenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Dashboard Content */}
        <Tabs defaultValue="gyms">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gyms">Мои залы</TabsTrigger>
            <TabsTrigger value="classes">Расписание</TabsTrigger>
            <TabsTrigger value="bookings">Записи</TabsTrigger>
          </TabsList>
          
          {/* Gyms Tab */}
          <TabsContent value="gyms" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-goodfit-primary hover:bg-goodfit-dark">
                    <Plus className="w-4 h-4 mr-2" /> Добавить зал
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить новый зал</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о вашем зале
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Название</Label>
                      <Input
                        id="name"
                        value={newGym.name}
                        onChange={(e) => setNewGym({...newGym, name: e.target.value})}
                        placeholder="Название зала"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        value={newGym.description}
                        onChange={(e) => setNewGym({...newGym, description: e.target.value})}
                        placeholder="Описание зала"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Город</Label>
                        <Input
                          id="city"
                          value={newGym.city}
                          onChange={(e) => setNewGym({...newGym, city: e.target.value})}
                          placeholder="Город"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Адрес</Label>
                        <Input
                          id="address"
                          value={newGym.address}
                          onChange={(e) => setNewGym({...newGym, address: e.target.value})}
                          placeholder="Полный адрес"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Категории (через запятую)</Label>
                      <Input
                        id="category"
                        value={newGym.category.join(', ')}
                        onChange={(e) => setNewGym({...newGym, category: e.target.value.split(',')})}
                        placeholder="Йога, Фитнес, Кроссфит"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="features">Особенности (через запятую)</Label>
                      <Input
                        id="features"
                        value={newGym.features.join(', ')}
                        onChange={(e) => setNewGym({...newGym, features: e.target.value.split(',')})}
                        placeholder="Душевые, Парковка, Полотенца"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mainImage">Ссылка на главное изображение</Label>
                      <Input
                        id="mainImage"
                        value={newGym.mainImage}
                        onChange={(e) => setNewGym({...newGym, mainImage: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="openTime">Время открытия</Label>
                        <Input
                          id="openTime"
                          value={newGym.workingHours.open}
                          onChange={(e) => setNewGym({...newGym, workingHours: {...newGym.workingHours, open: e.target.value}})}
                          placeholder="09:00"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="closeTime">Время закрытия</Label>
                        <Input
                          id="closeTime"
                          value={newGym.workingHours.close}
                          onChange={(e) => setNewGym({...newGym, workingHours: {...newGym.workingHours, close: e.target.value}})}
                          placeholder="22:00"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Отмена</Button>
                    </DialogClose>
                    <Button onClick={handleAddGym}>Добавить</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {partnerGyms.length > 0 ? (
              <div className="grid gap-4">
                {partnerGyms.map((gym) => (
                  <Card key={gym.id}>
                    <div className="md:flex">
                      <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                        <img 
                          src={gym.mainImage} 
                          alt={gym.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4 md:w-2/3">
                        <h3 className="text-lg font-semibold">{gym.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Home className="w-4 h-4 mr-1" />
                          {gym.address}, {gym.city}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{gym.description}</p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {gym.category.map((cat, i) => (
                            <Badge key={i} variant="outline" className="bg-muted">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button className="flex-1" variant="outline" onClick={() => setSelectedGym(gym)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </Button>
                          <Button className="flex-1">
                            <Calendar className="w-4 h-4 mr-2" />
                            Занятия
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Home className="w-16 h-16 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">У вас пока нет залов</h3>
                  <p className="mt-2 text-muted-foreground">
                    Добавьте ваш первый зал или фитнес-центр в систему
                  </p>
                  <Button className="mt-4 bg-goodfit-primary hover:bg-goodfit-dark">
                    <Plus className="w-4 h-4 mr-2" /> Добавить первый зал
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Classes Tab */}
          <TabsContent value="classes" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-goodfit-primary hover:bg-goodfit-dark">
                    <Plus className="w-4 h-4 mr-2" /> Создать занятие
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать новое занятие</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о занятии
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="gymId">Зал</Label>
                      <select
                        id="gymId"
                        value={newClass.gymId}
                        onChange={(e) => setNewClass({...newClass, gymId: e.target.value})}
                        className="w-full h-9 px-3 rounded-md border border-input"
                      >
                        <option value="">Выберите зал</option>
                        {partnerGyms.map(gym => (
                          <option key={gym.id} value={gym.id}>{gym.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Название</Label>
                      <Input
                        id="title"
                        value={newClass.title}
                        onChange={(e) => setNewClass({...newClass, title: e.target.value})}
                        placeholder="Название занятия"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        value={newClass.description}
                        onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                        placeholder="Описание занятия"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Инструктор</Label>
                      <Input
                        id="instructor"
                        value={newClass.instructor}
                        onChange={(e) => setNewClass({...newClass, instructor: e.target.value})}
                        placeholder="Имя инструктора"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Начало</Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={newClass.startTime}
                          onChange={(e) => setNewClass({...newClass, startTime: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="endTime">Окончание</Label>
                        <Input
                          id="endTime"
                          type="datetime-local"
                          value={newClass.endTime}
                          onChange={(e) => setNewClass({...newClass, endTime: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Категория</Label>
                      <Input
                        id="category"
                        value={newClass.category}
                        onChange={(e) => setNewClass({...newClass, category: e.target.value})}
                        placeholder="Йога, Пилатес, HIIT и т.д."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Вместимость</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={newClass.capacity}
                        onChange={(e) => setNewClass({...newClass, capacity: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Отмена</Button>
                    </DialogClose>
                    <Button onClick={handleAddClass}>Создать</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Все занятия</CardTitle>
                <CardDescription>
                  Управление расписанием и доступностью
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Зал</TableHead>
                      <TableHead>Дата и время</TableHead>
                      <TableHead>Инструктор</TableHead>
                      <TableHead>Занято</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partnerClasses.map((cls) => {
                      const gym = partnerGyms.find(g => g.id === cls.gymId);
                      return (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">{cls.title}</TableCell>
                          <TableCell>{gym?.name || 'Неизвестный зал'}</TableCell>
                          <TableCell>
                            {new Date(cls.startTime).toLocaleString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>{cls.instructor}</TableCell>
                          <TableCell>{cls.bookedCount}/{cls.capacity}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => deleteClass(cls.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {partnerClasses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Нет занятий. Создайте первое занятие.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Записи на занятия</CardTitle>
                <CardDescription>
                  Список всех записей клиентов
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Занятие</TableHead>
                      <TableHead>Дата и время</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.users?.name || 'Нет имени'}
                        </TableCell>
                        <TableCell>{booking.classes?.title || 'Неизвестное занятие'}</TableCell>
                        <TableCell>
                          {booking.classes ? 
                            new Date(booking.classes.start_time).toLocaleString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) :
                            'Нет данных'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            booking.status === 'ACTIVE' ? 'outline' :
                            booking.status === 'COMPLETED' ? 'default' : 'secondary'
                          } className={
                            booking.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            booking.status === 'COMPLETED' ? '' : ''
                          }>
                            {booking.status === 'ACTIVE' ? 'Активна' :
                             booking.status === 'COMPLETED' ? 'Завершена' : 'Отменена'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Нет записей на занятия.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerDashboardPage;
