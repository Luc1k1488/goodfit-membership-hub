
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Gym, FitnessClass, Subscription, User, Booking } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

type AppContextType = {
  gyms: Gym[];
  classes: FitnessClass[];
  subscriptions: Subscription[];
  filteredGyms: Gym[];
  user: User | null;
  bookings: Booking[];
  getGymById: (id: string) => Gym | undefined;
  getClassById: (id: string) => FitnessClass | undefined;
  getGymClasses: (gymId: string) => Promise<FitnessClass[]>;
  filterGyms: (filters: { city?: string, category?: string[], search?: string }) => void;
  bookClass: (classId: string, gymId: string) => Promise<boolean>;
  getUserBookings: () => Promise<Booking[]>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  addGym: (gym: Omit<Gym, "id" | "rating" | "review_count">) => Promise<Gym>;
  updateGym: (id: string, updates: Partial<Gym>) => Promise<Gym>;
  addClass: (classData: Omit<FitnessClass, "id" | "booked_count">) => Promise<FitnessClass>;
  updateClass: (id: string, updates: Partial<FitnessClass>) => Promise<FitnessClass>;
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
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const user = currentUser;

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
          main_image: gym.main_image,
          images: gym.images,
          features: gym.features,
          category: gym.category,
          location: { lat: gym.location?.lat || 0, lng: gym.location?.lng || 0 },
          working_hours: gym.working_hours,
          rating: gym.rating,
          review_count: gym.review_count,
          ownerid: gym.ownerid
        }));
        setGyms(formattedGyms);
        setFilteredGyms(formattedGyms);
      }
      
      // Fetch classes
      const now = new Date();
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .gt('starttime', now.toISOString());
      
      if (classesError) {
        console.error('Error fetching classes:', classesError);
      } else if (classesData) {
        const formattedClasses: FitnessClass[] = classesData.map(cls => ({
          id: cls.id,
          gymid: cls.gymid,
          title: cls.name,
          description: cls.description,
          instructor: cls.instructor,
          starttime: cls.starttime,
          end_time: cls.end_time,
          category: cls.category,
          capacity: cls.capacity,
          booked_count: cls.booked_count
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

      // Fetch bookings if user is logged in
      if (currentUser) {
        getUserBookings().then(bookings => {
          setBookings(bookings);
        });
      }
    };

    fetchData();
  }, [currentUser]);

  const getGymById = (id: string): Gym | undefined => {
    return gyms.find((gym) => gym.id === id);
  };

  const getClassById = (id: string): FitnessClass | undefined => {
    return classes.find((cls) => cls.id === id);
  };

  const getGymClasses = async (gymId: string): Promise<FitnessClass[]> => {
    const now = new Date();
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('gymid', gymId)
      .gt('starttime', now.toISOString())
      .order('starttime', { ascending: true });
    
    if (error) {
      console.error('Error fetching gym classes:', error);
      return [];
    }
    
    return data.map(cls => ({
      id: cls.id,
      gymid: cls.gymid,
      title: cls.name,
      description: cls.description,
      instructor: cls.instructor,
      starttime: cls.starttime,
      end_time: cls.end_time,
      category: cls.category,
      capacity: cls.capacity,
      booked_count: cls.booked_count
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
    if (!user) {
      toast("Необходимо войти в систему");
      return false;
    }
    
    try {
      // Check if user already has a booking for this class
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .eq('class_id', classId);
      
      if (existingBookings && existingBookings.length > 0) {
        toast("Вы уже записаны на это занятие");
        return false;
      }
      
      // Check if class is full
      const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
      
      if (classData && classData.booked_count >= classData.capacity) {
        toast("Занятие уже заполнено");
        return false;
      }
      
      // Create booking
      const { error } = await supabase
        .from('bookings')
        .insert([
          { 
            user_id: user.id, 
            class_id: classId,
            gym_id: gymId,
            status: 'BOOKED', 
            date_time: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.error('Error booking class:', error);
        toast("Ошибка при бронировании");
        return false;
      }
      
      // Update class booked count
      await supabase.rpc('increment_booked_count', { class_id: classId });
      
      // Update local state
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === classId 
            ? { ...cls, booked_count: cls.booked_count + 1 } 
            : cls
        )
      );
      
      // Refresh bookings
      const updatedBookings = await getUserBookings();
      setBookings(updatedBookings);
      
      toast("Вы успешно записались на занятие");
      return true;
    } catch (error) {
      console.error('Error in bookClass:', error);
      toast("Произошла ошибка");
      return false;
    }
  };

  const getUserBookings = async (): Promise<Booking[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          classes:class_id(*),
          gyms:gym_id(*)
        `)
        .eq('user_id', user.id)
        .order('date_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }
      
      const formattedBookings: Booking[] = data.map(booking => ({
        id: booking.id,
        user_id: booking.user_id,
        class_id: booking.class_id,
        gym_id: booking.gym_id,
        status: booking.status,
        date_time: booking.date_time,
        created_at: booking.created_at,
        className: booking.classes.name,
        gymName: booking.gyms.name,
        class: {
          id: booking.classes.id,
          gymid: booking.classes.gymid,
          title: booking.classes.name,
          description: booking.classes.description,
          instructor: booking.classes.instructor,
          starttime: booking.classes.starttime,
          end_time: booking.classes.end_time,
          category: booking.classes.category,
          capacity: booking.classes.capacity,
          booked_count: booking.classes.booked_count
        },
        gym: {
          id: booking.gyms.id,
          name: booking.gyms.name,
          city: booking.gyms.city,
          main_image: booking.gyms.main_image
        }
      }));
      
      return formattedBookings;
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      return [];
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    if (!user) return false;
    
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
      if (bookingData.user_id !== user.id) {
        toast("У вас нет прав для отмены этой записи");
        return false;
      }
      
      // Delete booking
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);
      
      if (error) {
        console.error('Error cancelling booking:', error);
        toast("Ошибка при отмене записи");
        return false;
      }
      
      // Decrement class booked count
      await supabase.rpc('decrement_booked_count', { class_id: bookingData.class_id });
      
      // Update local state
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === bookingData.class_id 
            ? { ...cls, booked_count: Math.max(0, cls.booked_count - 1) } 
            : cls
        )
      );
      
      toast("Запись успешно отменена");
      return true;
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      toast("Произошла ошибка");
      return false;
    }
  };

  const addGym = async (gym: Omit<Gym, "id" | "rating" | "review_count">): Promise<Gym> => {
    if (!currentUser || currentUser.role !== "PARTNER") {
      throw new Error("Недостаточно прав для добавления зала");
    }
    
    try {
      const { data, error } = await supabase
        .from('gyms')
        .insert([
          {
            name: gym.name,
            description: gym.description,
            address: gym.address,
            city: gym.city,
            main_image: gym.main_image,
            images: gym.images,
            features: gym.features,
            category: gym.category,
            working_hours: gym.working_hours,
            rating: 0,
            review_count: 0,
            ownerid: currentUser.id
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
        main_image: data.main_image,
        images: data.images,
        features: data.features,
        category: data.category,
        location: { lat: 0, lng: 0 }, // Default location
        working_hours: data.working_hours,
        rating: data.rating,
        review_count: data.review_count,
        ownerid: data.ownerid
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
    
    if (currentUser.role === "PARTNER" && gym.ownerid !== currentUser.id) {
      throw new Error("Вы можете редактировать только свои залы");
    }
    
    try {
      // Convert to database format
      const dbUpdates: any = {};
      
      if ('name' in updates) dbUpdates.name = updates.name;
      if ('description' in updates) dbUpdates.description = updates.description;
      if ('address' in updates) dbUpdates.address = updates.address;
      if ('city' in updates) dbUpdates.city = updates.city;
      if ('main_image' in updates) dbUpdates.main_image = updates.main_image;
      if ('images' in updates) dbUpdates.images = updates.images;
      if ('features' in updates) dbUpdates.features = updates.features;
      if ('category' in updates) dbUpdates.category = updates.category;
      if ('working_hours' in updates) dbUpdates.working_hours = updates.working_hours;
      
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

  const addClass = async (classData: Omit<FitnessClass, "id" | "booked_count">): Promise<FitnessClass> => {
    const gym = gyms.find(g => g.id === classData.gymid);
    
    if (!gym) {
      throw new Error("Зал не найден");
    }
    
    if (!currentUser || (currentUser.role !== "PARTNER" && currentUser.role !== "ADMIN")) {
      throw new Error("Недостаточно прав для добавления занятия");
    }
    
    if (currentUser.role === "PARTNER" && gym.ownerid !== currentUser.id) {
      throw new Error("Вы можете добавлять занятия только в свои залы");
    }
    
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([
          {
            gymid: classData.gymid,
            name: classData.title,
            description: classData.description,
            instructor: classData.instructor,
            starttime: classData.starttime,
            end_time: classData.end_time,
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
      
      const newClass: FitnessClass = {
        id: data.id,
        gymid: data.gymid,
        title: data.name,
        description: data.description,
        instructor: data.instructor,
        starttime: data.starttime,
        end_time: data.end_time,
        category: data.category,
        capacity: data.capacity,
        booked_count: data.booked_count
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

  const updateClass = async (id: string, updates: Partial<FitnessClass>): Promise<FitnessClass> => {
    const cls = classes.find(c => c.id === id);
    
    if (!cls) {
      throw new Error("Занятие не найдено");
    }
    
    const gym = gyms.find(g => g.id === cls.gymid);
    
    if (!gym) {
      throw new Error("Зал не найден");
    }
    
    if (!currentUser || (currentUser.role !== "PARTNER" && currentUser.role !== "ADMIN")) {
      throw new Error("Недостаточно прав для обновления занятия");
    }
    
    if (currentUser.role === "PARTNER" && gym.ownerid !== currentUser.id) {
      throw new Error("Вы можете редактировать занятия только в своих залах");
    }
    
    try {
      // Convert to database format
      const dbUpdates: any = {};
      
      if ('title' in updates) dbUpdates.name = updates.title;
      if ('description' in updates) dbUpdates.description = updates.description;
      if ('instructor' in updates) dbUpdates.instructor = updates.instructor;
      if ('starttime' in updates) dbUpdates.starttime = updates.starttime;
      if ('end_time' in updates) dbUpdates.end_time = updates.end_time;
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
      
      const updatedClass: FitnessClass = {
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
    
    const gym = gyms.find(g => g.id === cls.gymid);
    
    if (!gym) {
      throw new Error("Зал не найден");
    }
    
    if (!currentUser || (currentUser.role !== "PARTNER" && currentUser.role !== "ADMIN")) {
      throw new Error("Недостаточно прав для удаления занятия");
    }
    
    if (currentUser.role === "PARTNER" && gym.ownerid !== currentUser.id) {
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
      user,
      bookings,
      getGymById,
      getClassById,
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
