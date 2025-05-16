
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { 
  Users, 
  Home, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  Activity,
  Gym,
  Plus
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDashboardPage = () => {
  const { gyms, updateGym } = useApp();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGyms: 0,
    totalClasses: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingApprovals: 0
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
        } else if (usersData) {
          setUsers(usersData.map(user => ({
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role as "USER" | "PARTNER" | "ADMIN",
            createdAt: user.created_at,
            profileImage: user.profile_image || '/placeholder.svg'
          })));
          
          setStats(prev => ({
            ...prev,
            totalUsers: usersData.length
          }));
        }
        
        // Fetch bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            classes:class_id(*),
            gyms:gym_id(*),
            users:user_id(*)
          `)
          .order('date_time', { ascending: false });
        
        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        } else if (bookingsData) {
          setBookings(bookingsData);
        }
        
        // Get total gyms
        setStats(prev => ({
          ...prev,
          totalGyms: gyms.length
        }));
        
        // Get total classes
        const { count: classCount, error: classError } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true });
          
        if (!classError) {
          setStats(prev => ({
            ...prev,
            totalClasses: classCount || 0
          }));
        }
        
        // Get active subscriptions
        const { count: subscriptionCount, error: subscriptionError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .not('subscription_id', 'is', null);
          
        if (!subscriptionError) {
          setStats(prev => ({
            ...prev,
            activeSubscriptions: subscriptionCount || 0
          }));
        }
        
        // Get total revenue (mock data for now)
        setStats(prev => ({
          ...prev,
          totalRevenue: 1250000
        }));
        
        // Get pending approvals (mock data)
        setStats(prev => ({
          ...prev,
          pendingApprovals: 5
        }));
        
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    
    fetchData();
  }, [gyms]);
  
  // Filter gyms based on search term
  const filteredGyms = gyms.filter(gym => 
    gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gym.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gym.category.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header>
        <h1 className="text-xl font-bold">Панель администратора</h1>
      </Header>
      
      <div className="container px-4 py-6">
        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="gyms">Залы</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="bookings">Записи</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-goodfit-primary mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Пользователей</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Home className="h-8 w-8 text-goodfit-secondary mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Залов</p>
                      <p className="text-2xl font-bold">{stats.totalGyms}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-amber-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Занятий</p>
                      <p className="text-2xl font-bold">{stats.totalClasses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-emerald-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Доход</p>
                      <p className="text-2xl font-bold">₽{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Статистика подписок</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Активные подписки:</span>
                    <span className="ml-auto font-medium">{stats.activeSubscriptions}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Ожидают одобрения:</span>
                    <span className="ml-auto font-medium">{stats.pendingApprovals}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Популярные залы</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-4">
                  {gyms.slice(0, 3).map((gym) => (
                    <div key={gym.id} className="flex items-center">
                      <div className="h-10 w-10 rounded bg-muted mr-3 overflow-hidden">
                        <img 
                          src={gym.mainImage} 
                          alt={gym.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{gym.name}</p>
                        <p className="text-sm text-muted-foreground">{gym.city}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm">{gym.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Gyms Tab */}
          <TabsContent value="gyms" className="space-y-4 mt-4">
            <div className="flex mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск залов..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="ml-2" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Добавить зал
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Город</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Рейтинг</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGyms.map((gym) => (
                      <TableRow key={gym.id}>
                        <TableCell className="font-medium">{gym.name}</TableCell>
                        <TableCell>{gym.city}</TableCell>
                        <TableCell>{gym.category.join(', ')}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            {gym.rating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Активен
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Просмотр
                            </Button>
                            <Button size="sm" variant="outline">
                              Изменить
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="flex mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск пользователей..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-muted mr-2 overflow-hidden">
                              <img 
                                src={user.profileImage} 
                                alt={user.name || 'User'} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            {user.name || 'Нет имени'}
                          </div>
                        </TableCell>
                        <TableCell>{user.email || 'Нет email'}</TableCell>
                        <TableCell>{user.phone || 'Нет телефона'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === 'ADMIN' ? 'default' :
                            user.role === 'PARTNER' ? 'outline' : 'secondary'
                          }>
                            {user.role === 'ADMIN' ? 'Админ' :
                             user.role === 'PARTNER' ? 'Партнер' : 'Клиент'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Действия
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4 mt-4">
            <div className="flex mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск записей..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Зал</TableHead>
                      <TableHead>Занятие</TableHead>
                      <TableHead>Дата и время</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.slice(0, 10).map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.users?.name || 'Нет имени'}
                        </TableCell>
                        <TableCell>{booking.gyms?.name || 'Неизвестный зал'}</TableCell>
                        <TableCell>{booking.classes?.title || 'Неизвестное занятие'}</TableCell>
                        <TableCell>
                          {booking.classes ? 
                            new Date(booking.classes.start_time).toLocaleString() :
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

export default AdminDashboardPage;
