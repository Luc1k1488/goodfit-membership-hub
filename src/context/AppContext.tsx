import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FitnessClass, Gym, Subscription, User, Booking, GymFilters } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

export interface AppContextType {
  gyms: Gym[];
  filteredGyms: Gym[];
  filterGyms: (filters: GymFilters) => void;
  classes: FitnessClass[];
  getGymClasses: (gym_id: string) => Promise<FitnessClass[]>;
  bookings: Booking[];
  bookClass: (class_id: string, gym_id: string) => Promise<boolean>;
  cancelBooking: (booking_id: string) => Promise<boolean>;
  subscriptions: Subscription[];
  currentUser: User | null;  // Added currentUser property
  getUserBookings: () => Promise<Booking[]>; // Added getUserBookings method
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch gyms
        const { data: gymsData, error: gymsError } = await supabase
          .from('gyms')
          .select('*');
          
        if (gymsError) {
          throw gymsError;
        }
        
        if (gymsData) {
          setGyms(gymsData);
          setFilteredGyms(gymsData);
        }
        
        // Fetch classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*');
          
        if (classesError) {
          throw classesError;
        }
        
        if (classesData) {
          // Make sure the classes have the correct field names
          const formattedClasses = classesData.map(cls => ({
            ...cls,
            starttime: cls.starttime || cls.start_time,
            end_time: cls.end_time
          }));
          setClasses(formattedClasses);
        }
        
        // Fetch subscriptions
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*');
          
        if (subscriptionsError) {
          throw subscriptionsError;
        }
        
        if (subscriptionsData) {
          const formattedSubscriptions = subscriptionsData.map(sub => ({
            id: sub.id,
            name: sub.name,
            durationDays: sub.duration_days,
            price: sub.price,
            features: sub.features,
            isPopular: sub.is_popular
          }));
          
          setSubscriptions(formattedSubscriptions);
        }
        
        // If user is logged in, fetch bookings
        if (currentUser) {
          await getUserBookings();
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  const filterGyms = (filters: GymFilters) => {
    let filtered = gyms;
    
    if (filters.city && filters.city !== "") {
      filtered = filtered.filter(gym => gym.city === filters.city);
    }
    
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(gym => 
        filters.category!.some(cat => gym.category.includes(cat))
      );
    }
    
    // Add support for search
    if (filters.search && filters.search !== "") {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(gym => 
        gym.name.toLowerCase().includes(searchLower) ||
        gym.address.toLowerCase().includes(searchLower) ||
        gym.description.toLowerCase().includes(searchLower) ||
        gym.city.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredGyms(filtered);
  };
  
  const getGymClasses = async (gym_id: string): Promise<FitnessClass[]> => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('gymid', gym_id);
        
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching gym classes:', error);
      return [];
    }
  };
  
  const getUserBookings = async (): Promise<Booking[]> => {
    if (!currentUser) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, class:class_id(*), gym:gym_id(*)')
        .eq('user_id', currentUser.id);
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setBookings(data);
        return data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  };
  
  const bookClass = async (class_id: string, gym_id: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error('Пожалуйста, войдите в аккаунт');
      return false;
    }
    
    try {
      // Check if already booked
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('class_id', class_id);
        
      if (checkError) {
        throw checkError;
      }
      
      if (existingBooking && existingBooking.length > 0) {
        toast.error('Вы уже записаны на это занятие');
        return false;
      }
      
      // Get the class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', class_id)
        .single();
        
      if (classError || !classData) {
        throw classError || new Error('Занятие не найдено');
      }
      
      // Check if class is full
      if (classData.booked_count >= classData.capacity) {
        toast.error('Нет свободных мест');
        return false;
      }
      
      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: currentUser.id,
          class_id: class_id,
          gym_id: gym_id,
          status: 'BOOKED',
          date_time: new Date().toISOString(),
        })
        .select();
        
      if (bookingError) {
        throw bookingError;
      }
      
      // Increment booked count
      await supabase.rpc('increment_booked_count', { class_id: class_id });
      
      // Update local state
      const updatedClasses = classes.map(cls => 
        cls.id === class_id
          ? { ...cls, booked_count: cls.booked_count + 1 }
          : cls
      );
      
      setClasses(updatedClasses);
      
      // Fetch updated bookings
      getUserBookings();
      
      toast.success('Запись на занятие успешно создана');
      return true;
    } catch (error: any) {
      console.error('Error booking class:', error);
      toast.error(error.message || 'Ошибка при записи на занятие');
      return false;
    }
  };
  
  const cancelBooking = async (booking_id: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error('Пожалуйста, войдите в аккаунт');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking_id)
        .eq('user_id', currentUser.id);
        
      if (error) {
        throw error;
      }
      
      // Decrement booked count
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('class_id')
        .eq('id', booking_id)
        .single();
        
      if (bookingError || !booking) {
        throw bookingError || new Error('Бронирование не найдено');
      }
      
      await supabase.rpc('decrement_booked_count', { class_id: booking.class_id });
      
      // Update local state
      const updatedClasses = classes.map(cls => 
        cls.id === booking.class_id
          ? { ...cls, booked_count: cls.booked_count - 1 }
          : cls
      );
      
      setClasses(updatedClasses);
      
      // Fetch updated bookings
      getUserBookings();
      
      toast.success('Бронирование успешно отменено');
      return true;
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Ошибка при отмене бронирования');
      return false;
    }
  };
  
  const value: AppContextType = {
    gyms,
    filteredGyms,
    filterGyms,
    classes,
    getGymClasses,
    bookings,
    bookClass,
    cancelBooking,
    subscriptions,
    currentUser,
    getUserBookings
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};
