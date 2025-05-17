
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/lib/supabaseClient";
import { AnalyticsSummary, BookingTrend } from "@/types";
import { Loader2, Users, Dumbbell, CalendarIcon, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const DashboardPage = () => {
  const { userRole, currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalBookings: 0,
    activeUsers: 0,
    totalRevenue: 0,
    gymCount: 0
  });
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);

  // Dummy data for the chart
  const dummyBookingTrends = [
    { date: '01.05', bookings: 12 },
    { date: '02.05', bookings: 19 },
    { date: '03.05', bookings: 15 },
    { date: '04.05', bookings: 25 },
    { date: '05.05', bookings: 22 },
    { date: '06.05', bookings: 30 },
    { date: '07.05', bookings: 18 },
    { date: '08.05', bookings: 15 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch actual data from Supabase
        // For now, we'll simulate loading and then set dummy data
        setTimeout(() => {
          setSummary({
            totalBookings: 1245,
            activeUsers: 857,
            totalRevenue: 975000,
            gymCount: 24
          });
          
          setBookingTrends(dummyBookingTrends);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userRole, currentUser?.id]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">
        {userRole === "ADMIN" ? "Панель администратора" : "Панель партнера"}
      </h2>
      
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Бронирований</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              +15% по сравнению с прошлым месяцем
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +10% по сравнению с прошлым месяцем
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +12% по сравнению с прошлым месяцем
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Спортзалы</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.gymCount}</div>
            <p className="text-xs text-muted-foreground">
              +2 новых за последний месяц
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Динамика бронирований</CardTitle>
            <CardDescription>
              Количество бронирований за последние 8 дней
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bookingTrends}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
