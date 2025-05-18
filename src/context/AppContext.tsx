
import { createContext, useContext, useState, useEffect } from "react";
import { Gym, FitnessClass, Booking, Subscription, User } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

// Define the context type
interface AppContextType {
  gyms: Gym[];
  filteredGyms: Gym[];
  subscriptions: Subscription[];
  bookings: Booking[];
  classes: FitnessClass[];
  user: User | null;
  filterGyms: (filters: { city?: string; category?: string[]; search?: string }) => void;
  getGymById: (gymId: string) => Gym | undefined;
  getClassById: (classId: string) => FitnessClass | undefined;
  getGymClasses: (gymId: string) => Promise<FitnessClass[]>;
  bookClass: (classId: string, gymId: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  updateGym: (gymId: string, updates: Partial<Gym>) => Promise<void>;
  addGym: (gym: Omit<Gym, 'id'>) => Promise<Gym | null>;
  deleteGym: (gymId: string) => Promise<boolean>;
  createSubscription: (subscription: Omit<Subscription, 'id'>) => Promise<Subscription | null>;
  updateSubscription: (subscriptionId: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (subscriptionId: string) => Promise<boolean>;
  getUserBookings: () => Promise<void>;
  addClass: (classData: Omit<FitnessClass, 'id'>) => Promise<FitnessClass | null>;
}

// Create the context with a default value of null
const AppContext = createContext<AppContextType | null>(null);

// Create a provider component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [classes, setClasses] = useState<FitnessClass[]>([]);

  useEffect(() => {
    const fetchGyms = async () => {
      const { data, error } = await supabase.from('gyms').select('*');

      if (error) {
        console.error("Error fetching gyms:", error);
      } else {
        setGyms(data as Gym[]);
        setFilteredGyms(data as Gym[]);
      }
    };

    fetchGyms();
  }, []);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const { data, error } = await supabase.from('subscriptions').select('*');

      if (error) {
        console.error("Error fetching subscriptions:", error);
      } else {
        setSubscriptions(data as Subscription[]);
      }
    };

    fetchSubscriptions();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase.from('classes').select('*');

      if (error) {
        console.error("Error fetching classes:", error);
      } else {
        setClasses(data as FitnessClass[]);
      }
    };

    fetchClasses();
  }, []);

  const getUserBookings = async () => {
    if (!currentUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, class:class_id(*), gym:gym_id(*)')
        .eq('user_id', currentUser.id);
        
      if (error) {
        console.error("Error fetching user bookings:", error);
        return;
      }
      
      // Transform the data to match our Booking type with nested class and gym
      const formattedBookings = data.map(booking => ({
        ...booking,
        class: booking.class,
        gym: booking.gym
      }));
      
      setBookings(formattedBookings);
    } catch (error) {
      console.error("Error in getUserBookings:", error);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      getUserBookings();
    } else {
      setBookings([]);
    }
  }, [currentUser?.id]);

  const filterGyms = (filters: { city?: string; category?: string[]; search?: string }) => {
    let filtered = [...gyms];

    if (filters.city) {
      filtered = filtered.filter((gym) => gym.city === filters.city);
    }

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter((gym) =>
        filters.category?.every((cat) => gym.category.includes(cat))
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((gym) => 
        gym.name.toLowerCase().includes(searchLower) || 
        gym.description.toLowerCase().includes(searchLower) ||
        gym.address.toLowerCase().includes(searchLower)
      );
    }

    setFilteredGyms(filtered);
  };

  const getGymById = (gymId: string): Gym | undefined => {
    return gyms.find((gym) => gym.id === gymId);
  };

  const getClassById = (classId: string): FitnessClass | undefined => {
    return classes.find((cls) => cls.id === classId);
  };

  const getGymClasses = async (gymId: string): Promise<FitnessClass[]> => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('gymid', gymId);

    if (error) {
      console.error("Error fetching classes:", error);
      return [];
    }

    return data as FitnessClass[];
  };

  const bookClass = async (classId: string, gymId: string): Promise<boolean> => {
    if (!currentUser?.id) return false;
    
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('class_id', classId)
      .eq('user_id', currentUser.id)
      .single();
    
    if (bookingError && bookingError.code !== '404') {
      console.error("Error checking existing booking:", bookingError);
      return false;
    }
    
    if (bookingData) {
      console.warn("User already booked this class");
      return false;
    }
    
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('capacity, booked_count')
      .eq('id', classId)
      .single();
    
    if (classError) {
      console.error("Error fetching class capacity:", classError);
      return false;
    }
    
    if (classData && classData.booked_count! >= classData.capacity!) {
      console.warn("Class is fully booked");
      return false;
    }

    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: currentUser.id,
          class_id: classId,
          gym_id: gymId,
          status: 'BOOKED',
          date_time: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error("Error booking class:", error);
      return false;
    }
    
    await supabase.rpc('increment_booked_count', { class_id: classId });

    // Optimistically update the local state
    setBookings((prevBookings) => [
      ...prevBookings,
      {
        id: Math.random().toString(), // Temporary ID
        user_id: currentUser.id,
        class_id: classId,
        gym_id: gymId,
        status: 'BOOKED',
        date_time: new Date().toISOString(),
      },
    ]);

    return true;
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.error("Error cancelling booking:", error);
      return false;
    }

    // Optimistically update the local state
    setBookings((prevBookings) =>
      prevBookings.filter((booking) => booking.id !== bookingId)
    );

    return true;
  };

  const updateGym = async (gymId: string, updates: Partial<Gym>): Promise<void> => {
    const dbUpdates: Partial<Gym> = {};

    if ('name' in updates) dbUpdates.name = updates.name;
    if ('description' in updates) dbUpdates.description = updates.description;
    if ('category' in updates) dbUpdates.category = updates.category;
    if ('city' in updates) dbUpdates.city = updates.city;
    if ('address' in updates) dbUpdates.address = updates.address;
    if ('location' in updates) dbUpdates.location = updates.location;
    if ('main_image' in updates) dbUpdates.main_image = updates.main_image;
    if ('images' in updates) dbUpdates.images = updates.images;
    if ('ownerid' in updates) dbUpdates.ownerid = updates.ownerid;
    if ('rating' in updates) dbUpdates.rating = updates.rating;
    if ('review_count' in updates) dbUpdates.review_count = updates.review_count;
    if ('working_hours' in updates) dbUpdates.working_hours = updates.working_hours;
    if ('features' in updates) dbUpdates.features = updates.features;

    const { error } = await supabase
      .from('gyms')
      .update(dbUpdates)
      .eq('id', gymId);

    if (error) {
      console.error("Error updating gym:", error);
      throw error;
    }

    // Optimistically update the local state
    setGyms((prevGyms) =>
      prevGyms.map((gym) => (gym.id === gymId ? { ...gym, ...updates } : gym))
    );
    setFilteredGyms((prevFilteredGyms) =>
      prevFilteredGyms.map((gym) => (gym.id === gymId ? { ...gym, ...updates } : gym))
    );
  };

  const addGym = async (gym: Omit<Gym, 'id'>): Promise<Gym | null> => {
    const { data, error } = await supabase
      .from('gyms')
      .insert([gym])
      .select()
      .single();

    if (error) {
      console.error("Error adding gym:", error);
      return null;
    }

    // Optimistically update the local state
    setGyms((prevGyms) => [...prevGyms, data as Gym]);
    setFilteredGyms((prevFilteredGyms) => [...prevFilteredGyms, data as Gym]);

    return data as Gym;
  };

  const addClass = async (classData: Omit<FitnessClass, 'id'>): Promise<FitnessClass | null> => {
    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select()
      .single();

    if (error) {
      console.error("Error adding class:", error);
      return null;
    }

    // Optimistically update the local state
    setClasses((prevClasses) => [...prevClasses, data as FitnessClass]);

    return data as FitnessClass;
  };

  const deleteGym = async (gymId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('gyms')
      .delete()
      .eq('id', gymId);

    if (error) {
      console.error("Error deleting gym:", error);
      return false;
    }

    // Optimistically update the local state
    setGyms((prevGyms) => prevGyms.filter((gym) => gym.id !== gymId));
    setFilteredGyms((prevFilteredGyms) =>
      prevFilteredGyms.filter((gym) => gym.id !== gymId)
    );

    return true;
  };

  const createSubscription = async (subscription: Omit<Subscription, 'id'>): Promise<Subscription | null> => {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
      .single();

    if (error) {
      console.error("Error creating subscription:", error);
      return null;
    }

    // Optimistically update the local state
    setSubscriptions((prevSubscriptions) => [...prevSubscriptions, data as Subscription]);

    return data as Subscription;
  };

  const updateSubscription = async (subscriptionId: string, updates: Partial<Subscription>): Promise<void> => {
    const dbUpdates: Partial<Subscription> = {};

    if ('name' in updates) dbUpdates.name = updates.name;
    if ('durationDays' in updates) dbUpdates.durationDays = updates.durationDays;
    if ('price' in updates) dbUpdates.price = updates.price;
    if ('features' in updates) dbUpdates.features = updates.features;
    if ('isPopular' in updates) dbUpdates.isPopular = updates.isPopular;

    const { error } = await supabase
      .from('subscriptions')
      .update(dbUpdates)
      .eq('id', subscriptionId);

    if (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }

    // Optimistically update the local state
    setSubscriptions((prevSubscriptions) =>
      prevSubscriptions.map((sub) => (sub.id === subscriptionId ? { ...sub, ...updates } : sub))
    );
  };

  const deleteSubscription = async (subscriptionId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) {
      console.error("Error deleting subscription:", error);
      return false;
    }

    // Optimistically update the local state
    setSubscriptions((prevSubscriptions) => prevSubscriptions.filter((sub) => sub.id !== subscriptionId));

    return true;
  };

  // Provide the context value
  const value: AppContextType = {
    gyms,
    filteredGyms,
    subscriptions,
    bookings,
    classes,
    user: currentUser,
    filterGyms,
    getGymById,
    getClassById,
    getGymClasses,
    bookClass,
    cancelBooking,
    updateGym,
    addGym,
    deleteGym,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    getUserBookings,
    addClass,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Create a hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
