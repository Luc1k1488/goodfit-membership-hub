import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassCard } from "@/components/ClassCard";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { User, Calendar, CreditCard, Settings, Loader2 } from "lucide-react";
import { FitnessClass } from "@/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Header } from "@/components/Header";
import { toast } from "sonner";

const ProfilePage = () => {
  const { bookings, getClassById, getGymById } = useApp();
  const { currentUser, isLoading, authInitialized, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("bookings");
  
  // Упрощенная логика загрузки
  if (!authInitialized || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Загрузка профиля...</p>
      </div>
    );
  }
  
  // Если после инициализации нет пользователя, показываем ошибку
  // Это не должно происходить из-за ProtectedRoute, но оставим как fallback
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg mb-4">Ошибка загрузки профиля</p>
        <Button asChild>
          <Link to="/login">Войти</Link>
        </Button>
      </div>
    );
  }
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Ошибка при выходе из системы");
    }
  };
  
  // Filter bookings by status
  const activeBookings = bookings.filter(booking => booking.status === 'BOOKED');
  const completedBookings = bookings.filter(booking => booking.status === 'COMPLETED');
  
  // Get the classes for active bookings
  const activeClasses = activeBookings
    .map(booking => {
      if (!booking.class && booking.classId) {
        return getClassById(booking.classId);
      }
      return booking.class;
    })
    .filter(Boolean) as FitnessClass[];
  
  return (
    <>
      <Header>
        <h1 className="text-xl font-bold">Профиль</h1>
      </Header>
      
      <div className="container px-4 py-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
              {currentUser && currentUser.profileImage ? (
                <img 
                  src={currentUser.profileImage} 
                  alt={currentUser.name || "Пользователь"} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-8 h-8 text-blue-500" />
              )}
            </div>
            <div>
              <CardTitle>{currentUser.name || 'Пользователь'}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentUser.phone || currentUser.email || ''}
              </p>
              {currentUser.role !== 'USER' && (
                <Badge className="mt-1 bg-blue-500">
                  {currentUser.role === 'ADMIN' ? 'Администратор' : 'Партнёр'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="flex gap-4 mt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                asChild
              >
                <Link to={currentUser.role === 'ADMIN' 
                  ? '/admin-dashboard' 
                  : currentUser.role === 'PARTNER' 
                    ? '/partner-dashboard'
                    : '/profile'}>
                  {currentUser.role === 'ADMIN' 
                    ? 'Админ панель' 
                    : currentUser.role === 'PARTNER' 
                      ? 'Панель партнёра'
                      : 'Настройки'}
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleLogout}
              >
                Выйти
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {currentUser.subscriptionId ? (
          <Card className="mt-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Абонемент</CardTitle>
                <Badge className="bg-blue-500">Активен</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Тип абонемента</p>
                  <p className="font-medium">Безлимитный 90 дней</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Действителен до</p>
                  <p className="font-medium">15.09.2025</p>
                </div>
                <Button className="w-full bg-blue-500 text-white" asChild>
                  <Link to="/subscriptions">
                    Управление абонементом
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-medium mb-1">Нет активного абонемента</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Приобретите абонемент, чтобы получить доступ ко всем залам и занятиям.
              </p>
              <Button className="w-full bg-blue-500 text-white" asChild>
                <Link to="/subscriptions">
                  Выбрать абонемент
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="bookings">
                Мои записи
              </TabsTrigger>
              <TabsTrigger value="history">
                История
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings" className="pt-4">
              {activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeClasses.map((fitnessClass) => 
                    fitnessClass && (
                      <ClassCard 
                        key={fitnessClass.id} 
                        fitnessClass={fitnessClass} 
                        gym={
                          {
                            id: fitnessClass.gymId,
                            name: getGymById(fitnessClass.gymId)?.name || ""
                          }
                        }
                        showBookButton={false}
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="mb-2 text-lg font-medium">Нет предстоящих записей</h3>
                  <p className="mb-4 text-muted-foreground">
                    У вас пока нет записей на занятия
                  </p>
                  <Button className="bg-blue-500 text-white" asChild>
                    <Link to="/classes">Найти занятия</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              {completedBookings.length > 0 ? (
                <div className="space-y-4">
                  {completedBookings.map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="font-medium">{booking.className || "Занятие"}</h3>
                          <p className="text-sm text-muted-foreground">{booking.gymName || "Фитнес-центр"}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.dateTime ? format(new Date(booking.dateTime), "d MMMM, HH:mm", { locale: ru }) : ""}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="text-blue-500 border-blue-500">
                          Отзыв
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="mb-2 text-lg font-medium">Нет посещённых занятий</h3>
                  <p className="text-muted-foreground">
                    История ваших посещений будет отображаться здесь
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
