import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import {
  Users,
  Dumbbell,
  CalendarClock,
  CreditCard,
  Loader2,
  Search,
  Building2
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import { User, Booking } from "@/types";

const AdminDashboardPage = () => {
  const { currentUser, isLoading } = useAuth();
  const { gyms, classes, subscriptions } = useApp();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      
      if (currentUser.role !== "ADMIN") {
        if (currentUser.role === "PARTNER") {
          navigate("/partner-dashboard");
        } else {
          navigate("/profile");
        }
      }
    }
  }, [currentUser, isLoading, navigate]);
  
  // Load admin data
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser?.role !== "ADMIN") return;
      
      try {
        setIsDataLoading(true);
        
        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');
          
        if (usersError) throw usersError;
        
        // Fetch all bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*, classes:class_id(*), gyms:gym_id(*), users:user_id(*)');
          
        if (bookingsError) throw bookingsError;
        
        const formattedUsers = usersData.map(user => ({
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role as "USER" | "PARTNER" | "ADMIN",
          created_at: user.created_at,
          profile_image: user.profile_image || '/placeholder.svg',
          subscription_id: user.subscription_id
        }));
        
        const formattedBookings = bookingsData.map(booking => ({
          id: booking.id,
          user_id: booking.user_id,
          class_id: booking.class_id,
          gym_id: booking.gym_id,
          status: booking.status,
          date_time: booking.date_time,
          created_at: booking.created_at,
          userName: booking.users?.name || '',
          className: booking.classes?.title || '',
          gymName: booking.gyms?.name || ''
        }));
        
        setUsers(formattedUsers);
        setBookings(formattedBookings);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setTimeout(() => {
          setIsDataLoading(false);
        }, 500);
      }
    };
    
    fetchData();
  }, [currentUser]);

  if (isLoading || isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">Загрузка пан��ли администратора...</p>
      </div>
    );
  }
  
  if (!currentUser || currentUser.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="pb-16">
      <Header>
        <h1 className="text-xl font-bold">Панель администратора</h1>
      </Header>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-xl">{users.length}</CardTitle>
              <p className="text-sm text-muted-foreground">Пользователи</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Building2 className="h-8 w-8 text-orange-500 mb-2" />
              <CardTitle className="text-xl">{gyms.length}</CardTitle>
              <p className="text-sm text-muted-foreground">Залы</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <CalendarClock className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-xl">{classes.length}</CardTitle>
              <p className="text-sm text-muted-foreground">Занятия</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <CreditCard className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle className="text-xl">{subscriptions.length}</CardTitle>
              <p className="text-sm text-muted-foreground">Абонементы</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="gyms">Залы</TabsTrigger>
            <TabsTrigger value="bookings">Записи</TabsTrigger>
          </TabsList>
          
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
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Последние регистрации</CardTitle>
              </CardHeader>
              <CardContent>
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.name || 'Пользователь'}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                    </div>
                    <Badge>{user.role}</Badge>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-4">
                  Смотреть всех пользователей
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Последние записи на занятия</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.slice(0, 5).map(booking => (
                  <div key={booking.id} className="py-2 border-b last:border-0">
                    <div className="flex justify-between">
                      <p className="font-medium">{booking.className}</p>
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
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{booking.userName}</span>
                      <span className="text-muted-foreground">{booking.gymName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(booking.date_time).toLocaleString()}
                    </p>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-4">
                  Смотреть все записи
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Пользователи ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {users
                  .filter(user => 
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(user => (
                    <div key={user.id} className="py-3 border-b last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.name || 'Пользователь'}</p>
                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                            {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                          </div>
                        </div>
                        <Badge 
                          className={
                            user.role === 'ADMIN' ? 'bg-purple-500' : 
                            user.role === 'PARTNER' ? 'bg-blue-500' : 
                            'bg-green-500'
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button size="sm" variant="outline">Редактировать</Button>
                        <Button size="sm" variant="destructive">Удалить</Button>
                      </div>
                    </div>
                  ))
                }
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="gyms" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Залы ({gyms.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {gyms
                  .filter(gym => 
                    gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    gym.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    gym.city.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(gym => (
                    <div key={gym.id} className="py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 overflow-hidden rounded">
                          <img 
                            src={gym.main_image} 
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
                      <div className="flex justify-end gap-2 mt-2">
                        <Button size="sm" variant="outline">Редактировать</Button>
                        <Button size="sm" variant="destructive">Удалить</Button>
                      </div>
                    </div>
                  ))
                }
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Записи на занятия ({bookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings
                  .filter(booking => 
                    booking.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.gymName?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(booking => (
                    <div key={booking.id} className="py-3 border-b last:border-0">
                      <div className="flex justify-between">
                        <p className="font-medium">{booking.className}</p>
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
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Клиент: {booking.userName}</span>
                        <span className="text-muted-foreground">Зал: {booking.gymName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Дата: {new Date(booking.date_time).toLocaleString()}
                      </p>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button size="sm" variant="outline">Изменить статус</Button>
                        <Button size="sm" variant="destructive">Отменить</Button>
                      </div>
                    </div>
                  ))
                }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
