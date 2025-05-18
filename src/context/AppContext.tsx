
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Gym, FitnessClass, Booking, Review, Subscription, User, GymFilters } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './auth';

// Define the context type
export interface AppContextType {
  gyms: Gym[];
  filteredGyms: Gym[];
  selectedGym: Gym | null;
  classes: FitnessClass[];
  bookings: Booking[];
  subscriptions: Subscription[];
  currentUser: User | null;
  isLoading: boolean;
  filters: GymFilters;
  setFilters: (filters: GymFilters) => void;
  getGymById: (id: string) => Promise<Gym | null>;
  getClassById: (id: string) => Promise<FitnessClass | null>;
  getGymClasses: (gym_id: string) => Promise<FitnessClass[]>;
  getUserBookings: (user_id: string) => Promise<Booking[]>;
  bookClass: (class_id: string, gym_id: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  addGym: (gym: Omit<Gym, "id">) => Promise<string>;
  addClass: (fitnessClass: Omit<FitnessClass, "id">) => Promise<string>;
  updateGym: (id: string, updates: Partial<Gym>) => Promise<boolean>;
  updateClass: (id: string, updates: Partial<FitnessClass>) => Promise<boolean>;
  deleteGym: (id: string) => Promise<boolean>;
  deleteClass: (id: string) => Promise<boolean>;
  addReview: (review: Omit<Review, "id" | "date">) => Promise<boolean>;
}

// Create context with default values
const AppContext = createContext<AppContextType>({} as AppContextType);

// Export the useApp hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// AppProvider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<GymFilters>({});
  
  const { currentUser } = useAuth();

  // Fetch gyms on mount
  useEffect(() => {
    const fetchGyms = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('gyms')
          .select('*');
          
        if (error) throw error;
        
        const formattedGyms: Gym[] = data.map(gym => ({
          id: gym.id,
          name: gym.name,
          description: gym.description,
          category: gym.category,
          city: gym.city,
          address: gym.address,
          location: gym.location,
          main_image: gym.main_image,
          images: gym.images,
          ownerid: gym.ownerid,
          rating: gym.rating,
          review_count: gym.review_count,
          working_hours: gym.working_hours,
          features: gym.features,
        }));
        
        setGyms(formattedGyms);
        setFilteredGyms(formattedGyms);
      } catch (error) {
        console.error('Error fetching gyms:', error);
        toast.error('Не удалось загрузить список залов');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGyms();
  }, []);

  // Fetch subscriptions on mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data, error } = await supabase.from('subscriptions').select('*');
        
        if (error) throw error;
        
        const formattedSubs: Subscription[] = data.map(sub => ({
          id: sub.id,
          name: sub.name,
          price: sub.price,
          durationDays: sub.duration_days,
          features: sub.features,
          isPopular: sub.is_popular,
        }));
        
        setSubscriptions(formattedSubs);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Не удалось загрузить список абонементов');
      }
    };
    
    fetchSubscriptions();
  }, []);

  // Fetch user bookings when user changes
  useEffect(() => {
    if (currentUser) {
      getUserBookings(currentUser.id);
    }
  }, [currentUser]);

  // Apply filters effect
  useEffect(() => {
    let filtered = [...gyms];
    
    if (filters.city) {
      filtered = filtered.filter(gym => gym.city === filters.city);
    }
    
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(gym => {
        return gym.category.some(cat => filters.category?.includes(cat));
      });
    }
    
    if (filters.rating) {
      filtered = filtered.filter(gym => gym.rating >= (filters.rating || 0));
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(gym => 
        gym.name.toLowerCase().includes(search) || 
        gym.description.toLowerCase().includes(search) ||
        gym.city.toLowerCase().includes(search) ||
        gym.address.toLowerCase().includes(search)
      );
    }
    
    setFilteredGyms(filtered);
  }, [filters, gyms]);

  const getGymClasses = async (gym_id: string): Promise<FitnessClass[]> => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('gym_id', gym_id)
        .order('starttime', { ascending: true });
        
      if (error) throw error;
      
      return data as FitnessClass[];
    } catch (error) {
      console.error('Error fetching gym classes:', error);
      throw error;
    }
  };

  const getGymById = async (id: string): Promise<Gym | null> => {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        city: data.city,
        address: data.address,
        location: data.location,
        main_image: data.main_image,
        images: data.images,
        ownerid: data.ownerid,
        rating: data.rating,
        review_count: data.review_count,
        working_hours: data.working_hours,
        features: data.features || [],
      };
    } catch (error) {
      console.error('Error fetching gym:', error);
      return null;
    }
  };

  const getClassById = async (id: string): Promise<FitnessClass | null> => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (!data) return null;
      
      return data as FitnessClass;
    } catch (error) {
      console.error('Error fetching class:', error);
      return null;
    }
  };

  const bookClass = async (class_id: string, gym_id: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error('Необходимо авторизоваться');
      return false;
    }

    setIsLoading(true);
    try {
      // Check if already booked
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('class_id', class_id);
        
      if (checkError) throw checkError;
      
      if (existingBooking && existingBooking.length > 0) {
        toast.error('Вы уже записаны на это занятие');
        return false;
      }
      
      // Get class info to check availability
      const { data: cls, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', class_id)
        .single();
        
      if (classError) throw classError;
      
      if (cls.booked_count >= cls.capacity) {
        toast.error('Все места заняты');
        return false;
      }
      
      // Book class
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: currentUser.id,
          class_id: class_id,
          gym_id: gym_id,
          status: 'BOOKED',
          date_time: new Date().toISOString(),
        });
        
      if (bookingError) throw bookingError;
      
      // Increment booked count
      await supabase.rpc('increment_booked_count', { class_id: class_id });
      
      // Update local state
      setClasses(prevClasses => 
        prevClasses.map(c => 
          c.id === class_id 
            ? { ...c, booked_count: c.booked_count + 1 } 
            : c
        )
      );
      
      // Refresh bookings
      getUserBookings(currentUser.id);
      
      toast.success('Вы успешно записались на занятие');
      return true;
    } catch (error) {
      console.error('Error booking class:', error);
      toast.error('Ошибка при записи на занятие');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error('Необходимо авторизоваться');
      return false;
    }

    setIsLoading(true);
    try {
      // Get booking to get class_id
      const { data: booking, error: getError } = await supabase
        .from('bookings')
        .select('*, class:class_id(*)')
        .eq('id', bookingId)
        .single();
        
      if (getError) throw getError;
      
      if (booking.user_id !== currentUser.id) {
        toast.error('У вас нет прав для отмены этой записи');
        return false;
      }
      
      // Cancel booking
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'CANCELLED' })
        .eq('id', bookingId);
        
      if (updateError) throw updateError;
      
      // Decrement booked count
      await supabase.rpc('decrement_booked_count', { class_id: booking.class_id });
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        )
      );
      
      setClasses(prevClasses => 
        prevClasses.map(c => 
          c.id === booking.class_id 
            ? { ...c, booked_count: Math.max(0, c.booked_count - 1) } 
            : c
        )
      );
      
      toast.success('Запись отменена');
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Ошибка при отмене записи');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserBookings = async (user_id: string): Promise<Booking[]> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, class:class_id(*), gym:gym_id(*)')
        .eq('user_id', user_id);
        
      if (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
      }
      
      setBookings(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  };

  const addGym = async (gym: Omit<Gym, "id">): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .insert({
          name: gym.name,
          description: gym.description,
          category: gym.category,
          city: gym.city,
          address: gym.address,
          location: gym.location,
          main_image: gym.main_image,
          images: gym.images,
          ownerid: gym.ownerid,
          rating: gym.rating || 0,
          review_count: gym.review_count || 0,
          working_hours: gym.working_hours,
          features: gym.features,
        })
        .select('id')
        .single();
        
      if (error) throw error;
      
      // Update local state
      const newGym = { id: data.id, ...gym };
      setGyms(prevGyms => [...prevGyms, newGym]);
      setFilteredGyms(prevGyms => [...prevGyms, newGym]);
      
      return data.id;
    } catch (error) {
      console.error('Error adding gym:', error);
      throw error;
    }
  };

  const addClass = async (fitnessClass: Omit<FitnessClass, "id">): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert(fitnessClass)
        .select('id')
        .single();
        
      if (error) throw error;
      
      // Update local state if it's a class for the currently selected gym
      if (selectedGym && fitnessClass.gym_id === selectedGym.id) {
        const newClass = { id: data.id, ...fitnessClass };
        setClasses(prevClasses => [...prevClasses, newClass]);
      }
      
      return data.id;
    } catch (error) {
      console.error('Error adding class:', error);
      throw error;
    }
  };

  const updateGym = async (id: string, updates: Partial<Gym>): Promise<boolean> => {
    try {
      const dbUpdates: any = {};
      
      // Map fields to database column names
      if ('name' in updates) dbUpdates.name = updates.name;
      if ('description' in updates) dbUpdates.description = updates.description;
      if ('category' in updates) dbUpdates.category = updates.category;
      if ('city' in updates) dbUpdates.city = updates.city;
      if ('address' in updates) dbUpdates.address = updates.address;
      if ('location' in updates) dbUpdates.location = updates.location;
      if ('main_image' in updates) dbUpdates.main_image = updates.main_image;
      if ('images' in updates) dbUpdates.images = updates.images;
      if ('working_hours' in updates) dbUpdates.working_hours = updates.working_hours;
      if ('features' in updates) dbUpdates.features = updates.features;
      
      const { error } = await supabase
        .from('gyms')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setGyms(prevGyms => 
        prevGyms.map(g => g.id === id ? { ...g, ...updates } : g)
      );
      
      setFilteredGyms(prevGyms => 
        prevGyms.map(g => g.id === id ? { ...g, ...updates } : g)
      );
      
      if (selectedGym && selectedGym.id === id) {
        setSelectedGym({ ...selectedGym, ...updates });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating gym:', error);
      return false;
    }
  };

  const updateClass = async (id: string, updates: Partial<FitnessClass>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setClasses(prevClasses => 
        prevClasses.map(c => c.id === id ? { ...c, ...updates } : c)
      );
      
      return true;
    } catch (error) {
      console.error('Error updating class:', error);
      return false;
    }
  };

  const deleteGym = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('gyms')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setGyms(prevGyms => prevGyms.filter(g => g.id !== id));
      setFilteredGyms(prevGyms => prevGyms.filter(g => g.id !== id));
      
      if (selectedGym && selectedGym.id === id) {
        setSelectedGym(null);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting gym:', error);
      return false;
    }
  };

  const deleteClass = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setClasses(prevClasses => prevClasses.filter(c => c.id !== id));
      
      return true;
    } catch (error) {
      console.error('Error deleting class:', error);
      return false;
    }
  };

  const addReview = async (review: Omit<Review, "id" | "date">): Promise<boolean> => {
    try {
      // Add review
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: review.user_id,
          gym_id: review.gym_id,
          userName: review.userName,
          rating: review.rating,
          comment: review.comment,
          date: new Date().toISOString(),
          userImage: review.userImage
        });
        
      if (error) throw error;
      
      // Update gym rating
      await supabase.rpc('update_gym_rating', { 
        gym_id: review.gym_id 
      });
      
      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  };

  // Context value
  const value = {
    gyms,
    filteredGyms,
    selectedGym,
    classes,
    bookings,
    subscriptions,
    currentUser,
    isLoading,
    filters,
    setFilters,
    getGymById,
    getClassById,
    getGymClasses,
    getUserBookings,
    bookClass,
    cancelBooking,
    addGym,
    addClass,
    updateGym,
    updateClass,
    deleteGym,
    deleteClass,
    addReview,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
