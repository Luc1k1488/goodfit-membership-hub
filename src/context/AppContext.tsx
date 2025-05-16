
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Gym, Class, Subscription, User, Booking } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

type AppContextType = {
  gyms: Gym[];
  classes: Class[];
  subscriptions: Subscription[];
  filteredGyms: Gym[];
  getGymById: (id: string) => Gym | undefined;
  getGymClasses: (gymId: string) => Promise<Class[]>;
  filterGyms: (filters: { city?: string, category?: string[], search?: string }) => void;
  bookClass: (classId: string, gymId: string) => Promise<boolean>;
  getUserBookings: () => Promise<Booking[]>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  addGym: (gym: Omit<Gym, "id" | "rating" | "reviewCount">) => Promise<Gym>;
  updateGym: (id: string, updates: Partial<Gym>) => Promise<Gym>;
  addClass: (classData: Omit<Class, "id" | "bookedCount">) => Promise<Class>;
  updateClass: (id: string, updates: Partial<Class>) => Promise<Class>;
  deleteClass: (id: string) => Promise<boolean>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const { currentUser } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      // Fetch gyms
      const { data: gymsData, error: gymsError } = await supabase
        .from('gyms')
        .select('*');
      
      if (gymsError) {
        console.error('Error fetching gyms:', gymsError);
      } else if (gymsData) {
        const formattedGyms: Gym[] = gymsData.map(gym => ({
          id: gym.id,
          name: gym.name,
          description: gym.description,
          address: gym.address,
          city: gym.city,
          mainImage: gym.main_image,
          images: gym.images,
          features: gym.features,
          category: gym.category,
          location: { lat: 0, lng: 0 }, // Add default location values
          workingHours: gym.working_hours,
          rating: gym.rating,
          reviewCount: gym.review_count,
          ownerId: gym.owner_id
        }));
        setGyms(formattedGyms);
        setFilteredGyms(formattedGyms);
      }
      
      // Fetch classes
      const now = new Date();
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .gt('start_time', now.toISOString());
      
      if (classesError) {
        console.error('Error fetching classes:', classesError);
      } else if (classesData) {
        const formattedClasses: Class[] = classesData.map(cls => ({
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
        setClasses(formattedClasses);
      }
      
      // Fetch subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*');
      
      if (subscriptionsError) {
        console.error('Error fetching subscriptions:', subscriptionsError);
      } else if (subscriptionsData) {
        const formattedSubscriptions: Subscription[] = subscriptionsData.map(sub => ({
          id: sub.id,
          name: sub.name,
          price: sub.price,
          durationDays: sub.duration_days,
          features: sub.features,
          isPopular: sub.is_popular
        }));
        setSubscriptions(formattedSubscriptions);
      }
    };

    fetchData();
  }, []);

  const getGymById = (id: string): Gym | undefined => {
    return gyms.find((gym) => gym.id === id);
  };

  const getGymClasses = async (gymId: string): Promise<Class[]> => {
    const now = new Date();
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('gym_id', gymId)
      .gt('start_time', now.toISOString())
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error('Error fetching gym classes:', error);
      return [];
    }
    
    return data.map(cls => ({
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
  };

  const filterGyms = (filters: { city?: string, category?: string[], search?: string }) => {
    let result = [...gyms];
    
    // Apply city filter
    if (filters.city) {
      result = result.filter(gym => 
        gym.city.toLowerCase() === filters.city!.toLowerCase()
      );
    }
    
    // Apply category filter
    if (filters.category && filters.category.length > 0) {
      result = result.filter(gym => 
        gym.category?.some(cat => filters.category!.includes(cat))
      );
    }
    
    // Apply search filter
    if (filters.search?.trim()) {
      const query = filters.search.toLowerCase().trim();
      result = result.filter(gym => 
        gym.name.toLowerCase().includes(query) || 
        gym.description.toLowerCase().includes(query) ||
        gym.address.toLowerCase().includes(query)
      );
    }
    
    setFilteredGyms(result);
  };

  const bookClass = async (classId: string, gymId: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error("Необходимо войти в систему");
      return false;
    }
    
    try {
      // Check if user already has a booking for this class
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('class_id', classId);
      
      if (existingBookings && existingBookings.length > 0) {
        toast.error("Вы уже записаны на это занятие");
        return false;
      }
      
      // Check if class is full
      const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
      
      if (classData && classData.booked_count >= classData.capacity) {
        toast.error("Занятие уже заполнено");
        return false;
      }
      
      // Create booking
      const { error } = await supabase
        .from('bookings')
        .insert([
          { 
            user_id: currentUser.id, 
            class_id: classId,
            gym_id: gymId,
            status: 'ACTIVE', 
            date_time: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.error('Error booking class:', error);
        toast.error("Ошибка при бронировании");
        return false;
      }
      
      // Update class booked count
      await supabase.rpc('increment_booked_count', { class_id: classId });
      
      // Update local state
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === classId 
            ? { ...cls, bookedCount: cls.bookedCount + 1 } 
            : cls
        )
      );
      
      toast.success("Вы успешно записались на занятие");
      return true;
    } catch (error) {
      console.error('Error in bookClass:', error);
      toast.error("Произошла ошибка");
      return false;
    }
  };

  const getUserBookings = async (): Promise<Booking[]> => {
    if (!currentUser) return [];
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          classes:class_id(*),
          gyms:gym_id(*)
        `)
        .eq('user_id', currentUser.id)
        .order('date_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }
      
      return data.map(booking => ({
        id: booking.id,
        userId: booking.user_id,
        classId: booking.class_id,
        gymId: booking.gym_id,
        status: booking.status,
        dateTime: booking.date_time,
        createdAt: booking.created_at,
        class: {
          id: booking.classes.id,
          gymId: booking.classes.gym_id,
          title: booking.classes.title,
          description: booking.classes.description,
          instructor: booking.classes.instructor,
          startTime: booking.classes.start_time,
          endTime: booking.classes.end_time,
          category: booking.classes.category,
          capacity: booking.classes.capacity,
          bookedCount: booking.classes.booked_count
        },
        gym: {
          id: booking.gyms.id,
          name: booking.gyms.name,
          city: booking.gyms.city,
          mainImage: booking.gyms.main_image
        }
      }));
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      return [];
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      // Get booking data to know which class to decrement
      const { data: bookingData, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
      
      if (fetchError || !bookingData) {
        console.error('Error fetching booking:', fetchError);
        return false;
      }
      
      // Only allow cancellation if booking belongs to current user
      if (bookingData.user_id !== currentUser.id) {
        toast.error("У вас нет прав для отмены этой записи");
        return false;
      }
      
      // Delete booking
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);
      
      if (error) {
        console.error('Error cancelling booking:', error);
        toast.error("Ошибка при отмене записи");
        return false;
      }
      
      // Decrement class booked count
      await supabase.rpc('decrement_booked_count', { class_id: bookingData.class_id });
      
      // Update local state
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === bookingData.class_id 
            ? { ...cls, bookedCount: Math.max(0, cls.bookedCount - 1) } 
            : cls
        )
      );
      
      toast.success("Запись успешно отменена");
      return true;
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      toast.error("Произошла ошибка");
      return false;
    }
  };

  const addGym = async (gymData: Omit<Gym, "id" | "rating" | "reviewCount">): Promise<Gym> => {
    if (!currentUser || currentUser.role !== "PARTNER") {
      throw new Error("Недостаточно прав для добавления зала");
    }
    
    try {
      const { data, error } = await supabase
        .from('gyms')
        .insert([
          {
            name: gymData.name,
            description: gymData.description,
            address: gymData.address,
            city: gymData.city,
            main_image: gymData.mainImage,
            images: gymData.images,
            features: gymData.features,
            category: gymData.category,
            working_hours: gymData.workingHours,
            rating: 0,
            review_count: 0,
            owner_id: currentUser.id
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding gym:', error);
        throw error;
      }
      
      const newGym: Gym = {
        id: data.id,
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        mainImage: data.main_image,
        images: data.images,
        features: data.features,
        category: data.category,
        location: { lat: 0, lng: 0 }, // Default location
        workingHours: data.working_hours,
        rating: data.rating,
        reviewCount: data.review_count,
        ownerId: data.owner_id
      };
      
      // Update local state
      setGyms(prevGyms => [...prevGyms, newGym]);
      setFilteredGyms(prevFiltered => [...prevFiltered, newGym]);
      
      toast.success("Зал успешно добавлен");
      return newGym;
    } catch (error) {
      console.error('Error in addGym:', error);
      toast.error("Ошибка при добавлении зала");
      throw error;
    }
  };

  const updateGym = async (id: string, updates: Partial<Gym>): Promise<Gym> => {
    const gym = gyms.find(g => g.id === id);
    
    if (!gym) {
      throw new Error("Зал не найден");
    }
    
    if (!currentUser || (currentUser.role !== "PARTNER" && currentUser.role !== "ADMIN")) {
      throw new Error("Недостаточно прав для обновления зала");
    }
    
    if (currentUser.role === "PARTNER" && gym.ownerId !== currentUser.id) {
      throw new Error("Вы можете редактировать только свои залы");
    }
    
    try {
      // Convert to database format
      const dbUpdates: any = {};
      
      if ('name' in updates) dbUpdates.name = updates.name;
      if ('description' in updates) dbUpdates.description = updates.description;
      if ('address' in updates) dbUpdates.address = updates.address;
      if ('city' in updates) dbUpdates.city = updates.city;
      if ('mainImage' in updates) dbUpdates.main_image = updates.mainImage;
      if ('images' in updates) dbUpdates.images = updates.images;
      if ('features' in updates) dbUpdates.features = updates.features;
      if ('category' in updates) dbUpdates.category = updates.category;
      if ('workingHours' in updates) dbUpdates.working_hours = updates.workingHours;
      
      const { data, error } = await supabase
        .from('gyms')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating gym:', error);
        throw error;
      }
      
      const updatedGym: Gym = {
        ...gym,
        ...updates
      };
      
      // Update local state
      setGyms(prevGyms => 
        prevGyms.map(g => g.id === id ? updatedGym : g)
      );
      
      setFilteredGyms(prevFiltered => 
        prevFiltered.map(g => g.id === id ? updatedGym : g)
      );
      
      toast.success("Информация о зале обновлена");
      return updatedGym;
    } catch (error) {
      console.error('Error in updateGym:', error);
      toast.error("Ошибка при обновлении информации");
      throw error;
    }
  };

  const addClass = async (classData: Omit<Class, "id" | "bookedCount">): Promise<Class> => {
    const gym = gyms.find(g => g.id === classData.gymId);
    
    if (!gym) {
      throw new Error("Зал не найден");
    }
    
    if (!currentUser || (currentUser.role !== "PARTNER" && currentUser.role !== "ADMIN")) {
      throw new Error("Недостаточно прав для добавления занятия");
    }
    
    if (currentUser.role === "PARTNER" && gym.ownerId !== currentUser.id) {
      throw new Error("Вы можете добавлять занятия только в свои залы");
    }
    
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([
          {
            gym_id: classData.gymId,
            title: classData.title,
            description: classData.description,
            instructor: classData.instructor,
            start_time: classData.startTime,
            end_time: classData.endTime,
            category: classData.category,
            capacity: classData.capacity,
            booked_count: 0
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding class:', error);
        throw error;
      }
      
      const newClass: Class = {
        id: data.id,
        gymId: data.gym_id,
        title: data.title,
        description: data.description,
        instructor: data.instructor,
        startTime: data.start_time,
        endTime: data.end_time,
        category: data.category,
        capacity: data.capacity,
        bookedCount: data.booked_count
      };
      
      // Update local state
      setClasses(prevClasses => [...prevClasses, newClass]);
      
      toast.success("Занятие добавлено");
      return newClass;
    } catch (error) {
      console.error('Error in addClass:', error);
      toast.error("Ошибка при добавлении занятия");
      throw error;
    }
  };

  const updateClass = async (id: string, updates: Partial<Class>): Promise<Class> => {
    const cls = classes.find(c => c.id === id);
    
    if (!cls) {
      throw new Error("Занятие не найдено");
    }
    
    const gym = gyms.find(g => g.id === cls.gymId);
    
    if (!gym) {
      throw new Error("Зал не найден");
    }
    
    if (!currentUser || (currentUser.role !== "PARTNER" && currentUser.role !== "ADMIN")) {
      throw new Error("Недостаточно прав для обновления занятия");
    }
    
    if (currentUser.role === "PARTNER" && gym.ownerId !== currentUser.id) {
      throw new Error("Вы можете редактировать занятия только в своих залах");
    }
    
    try {
      // Convert to database format
      const dbUpdates: any = {};
      
      if ('title' in updates) dbUpdates.title = updates.title;
      if ('description' in updates) dbUpdates.description = updates.description;
      if ('instructor' in updates) dbUpdates.instructor = updates.instructor;
      if ('startTime' in updates) dbUpdates.start_time = updates.startTime;
      if ('endTime' in updates) dbUpdates.end_time = updates.endTime;
      if ('category' in updates) dbUpdates.category = updates.category;
      if ('capacity' in updates) dbUpdates.capacity = updates.capacity;
      
      const { data, error } = await supabase
        .from('classes')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating class:', error);
        throw error;
      }
      
      const updatedClass: Class = {
        ...cls,
        ...updates
      };
      
      // Update local state
      setClasses(prevClasses => 
        prevClasses.map(c => c.id === id ? updatedClass : c)
      );
      
      toast.success("Информация о занятии обновлена");
      return updatedClass;
    } catch (error) {
      console.error('Error in updateClass:', error);
      toast.error("Ошибка при обновлении информации");
      throw error;
    }
  };

  const deleteClass = async (id: string): Promise<boolean> => {
    const cls = classes.find(c => c.id === id);
    
    if (!cls) {
      throw new Error("Занятие не найдено");
    }
    
    const gym = gyms.find(g => g.id === cls.gymId);
    
    if (!gym) {
      throw new Error("Зал не найден");
    }
    
    if (!currentUser || (currentUser.role !== "PARTNER" && currentUser.role !== "ADMIN")) {
      throw new Error("Недостаточно прав для удаления занятия");
    }
    
    if (currentUser.role === "PARTNER" && gym.ownerId !== currentUser.id) {
      throw new Error("Вы можете удалять занятия только в своих залах");
    }
    
    try {
      // Check if there are existing bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('class_id', id);
      
      if (bookingsError) {
        console.error('Error checking bookings:', bookingsError);
        throw bookingsError;
      }
      
      if (bookings && bookings.length > 0) {
        // Delete all bookings first
        const { error: deleteBookingsError } = await supabase
          .from('bookings')
          .delete()
          .eq('class_id', id);
        
        if (deleteBookingsError) {
          console.error('Error deleting bookings:', deleteBookingsError);
          throw deleteBookingsError;
        }
      }
      
      // Now delete the class
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting class:', error);
        throw error;
      }
      
      // Update local state
      setClasses(prevClasses => prevClasses.filter(c => c.id !== id));
      
      toast.success("Занятие удалено");
      return true;
    } catch (error) {
      console.error('Error in deleteClass:', error);
      toast.error("Ошибка при удалении занятия");
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      gyms,
      classes,
      subscriptions,
      filteredGyms,
      getGymById,
      getGymClasses,
      filterGyms,
      bookClass,
      getUserBookings,
      cancelBooking,
      addGym,
      updateGym,
      addClass,
      updateClass,
      deleteClass
    }}>
      {children}
    </AppContext.Provider>
  );
};
