import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Booking } from "@/types";
import { useApp } from "@/context/AppContext";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/context/auth";

const PartnerDashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const { bookings, getUserBookings, cancelBooking } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const navigate = useNavigate();
  
  const user_id = currentUser?.id;
  const name = currentUser?.name || "Пользователь";
  const phone = currentUser?.phone || "";
  const email = currentUser?.email || "";
  const profile_image = currentUser?.profile_image;
  const role = currentUser?.role;
  const subscription_id = currentUser?.subscription_id;
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user_id) return;
      
      setIsLoading(true);
      await getUserBookings(user_id);
      setIsLoading(false);
    };

    fetchBookings();
  }, [getUserBookings, user_id]);
  
  const activeBookings = bookings.filter(
    (booking) => booking.status === "BOOKED"
  );
  
  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED" || booking.status === "CANCELLED"
  );
  
  const handleCancelBooking = async (bookingId: string) => {
    setIsLoading(true);
    await cancelBooking(bookingId);
    setIsLoading(false);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  
  const navigateToSubscriptions = () => {
    navigate("/subscriptions");
  };
  
  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {profile_image ? (
            <img 
              src={profile_image} 
              alt={name}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
              {name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="flex-grow text-center sm:text-left">
          <h1 className="text-2xl font-bold">{name}</h1>
          
          <div className="mt-2 text-muted-foreground">
            {phone && <p>{phone}</p>}
            {email && <p>{email}</p>}
          </div>
          
          {role === "PARTNER" && (
            <Button 
              variant="outline" 
              className="mt-3 mr-2"
              onClick={() => navigate("/admin")}
            >
              Панель партнера
            </Button>
          )}
          
          {role === "ADMIN" && (
            <Button 
              variant="outline" 
              className="mt-3 mr-2"
              onClick={() => navigate("/admin")}
            >
              Панель админа
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className="mt-3"
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </div>
      </div>
      
      {/* Subscription Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Абонемент</h2>
              <p className="text-muted-foreground">
                {subscription_id ? "Premium" : "Нет активного абонемента"}
              </p>
            </div>
            
            <Button
              onClick={navigateToSubscriptions}
              variant={subscription_id ? "outline" : "default"}
            >
              {subscription_id ? "Сменить тариф" : "Выбрать тариф"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Bookings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Мои записи</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="active">
              Активные ({activeBookings.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              История ({completedBookings.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : activeBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">У вас нет активных записей</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate("/gyms")}
                >
                  Записаться на занятие
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    onCancel={handleCancelBooking}
                    isHistory={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : completedBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">История посещений пуста</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedBookings.map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking}
                    onCancel={() => {}} 
                    isHistory={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  isHistory: boolean;
}

const BookingCard = ({ booking, onCancel, isHistory }: BookingCardProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  if (!booking.class) {
    return null;
  }
  
  const start_time = parseISO(booking.class.starttime);
  const formatted_date = format(start_time, "d MMMM", { locale: ru });
  const formatted_time = format(start_time, "HH:mm", { locale: ru });
  
  const handleCancel = async () => {
    setIsLoading(true);
    await onCancel(booking.id);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex-grow">
            <h3 className="font-medium">{booking.class.title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatted_date} в {formatted_time}
            </p>
            {booking.gym && (
              <p className="text-sm mt-1">{booking.gym.name}</p>
            )}
            {booking.status === "CANCELLED" && (
              <span className="inline-flex items-center mt-2 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                Отменено
              </span>
            )}
            {booking.status === "COMPLETED" && (
              <span className="inline-flex items-center mt-2 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                Завершено
              </span>
            )}
          </div>
          
          {!isHistory && booking.status === "BOOKED" && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerDashboardPage;
