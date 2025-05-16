
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, Gym, FitnessClass, Booking, Subscription } from '@/types';
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./AuthContext";

interface AppContextProps {
  user: User | null;
  gyms: Gym[];
  classes: FitnessClass[];
  bookings: Booking[];
  subscriptions: Subscription[];
  filteredGyms: Gym[];
  bookClass: (classId: string, gymId: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  filterGyms: (cityFilter?: string, categoryFilter?: string[]) => void;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  getGymById: (gymId: string) => Gym | undefined;
  getClassById: (classId: string) => FitnessClass | undefined;
  getGymClasses: (gymId: string) => Promise<FitnessClass[]>;
  addGym: (gym: Omit<Gym, 'id' | 'rating' | 'reviewCount'>) => Promise<boolean>;
  addClass: (fitnessClass: Omit<FitnessClass, 'id' | 'bookedCount'>) => Promise<boolean>;
  updateGym: (gymId: string, updatedGym: Partial<Gym>) => Promise<boolean>;
  deleteGym: (gymId: string) => Promise<boolean>;
  deleteClass: (classId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);

  // Fetch data when component mounts or user changes
  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Function to refresh all data
  const refreshData = async () => {
    await Promise.all([
      fetchGyms(),
      fetchClasses(),
      fetchSubscriptions(),
      currentUser ? fetchBookings() : Promise.resolve()
    ]);
  };

  // Fetch gyms from Supabase
  const fetchGyms = async () => {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*');

      if (error) {
        console.error('Error fetching gyms:', error);
        return;
      }

      const mappedGyms: Gym[] = data.map(gym => ({
        id: gym.id,
        name: gym.name,
        description: gym.description,
        address: gym.address,
        city: gym.city,
        mainImage: gym.main_image,
        images: gym.images,
        features: gym.features,
        category: gym.category,
        workingHours: gym.working_hours,
        rating: gym.rating,
        reviewCount: gym.review_count,
        ownerId: gym.owner_id || undefined
      }));

      setGyms(mappedGyms);
      setFilteredGyms(mappedGyms);
    } catch (error) {
      console.error('Error in fetchGyms:', error);
    }
  };

  // Fetch classes from Supabase
  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*');

      if (error) {
        console.error('Error fetching classes:', error);
        return;
      }

      const mappedClasses: FitnessClass[] = data.map(cls => ({
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

      setClasses(mappedClasses);
    } catch (error) {
      console.error('Error in fetchClasses:', error);
    }
  };

  // Fetch bookings for current user
  const fetchBookings = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          class_id,
          gym_id,
          status,
          date_time,
          created_at,
          classes(title),
          gyms(name)
        `)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      const mappedBookings: Booking[] = data.map(booking => ({
        id: booking.id,
        userId: booking.user_id,
        classId: booking.class_id,
        gymId: booking.gym_id,
        status: booking.status as 'BOOKED' | 'COMPLETED' | 'CANCELLED',
        dateTime: booking.date_time,
        className: booking.classes?.title || '',
        gymName: booking.gyms?.name || ''
      }));

      setBookings(mappedBookings);
    } catch (error) {
      console.error('Error in fetchBookings:', error);
    }
  };

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*');

      if (error) {
        console.error('Error fetching subscriptions:', error);
        return;
      }

      const mappedSubscriptions: Subscription[] = data.map(sub => ({
        id: sub.id,
        name: sub.name,
        price: sub.price,
        durationDays: sub.duration_days,
        features: sub.features,
        isPopular: sub.is_popular
      }));

      setSubscriptions(mappedSubscriptions);
    } catch (error) {
      console.error('Error in fetchSubscriptions:', error);
    }
  };

  // Filter gyms
  const filterGyms = (cityFilter?: string, categoryFilter?: string[]) => {
    let filtered = [...gyms];
    
    if (cityFilter) {
      filtered = filtered.filter(gym => gym.city.toLowerCase() === cityFilter.toLowerCase());
    }
    
    if (categoryFilter && categoryFilter.length > 0) {
      filtered = filtered.filter(gym => 
        gym.category.some(cat => categoryFilter.includes(cat))
      );
    }
    
    setFilteredGyms(filtered);
  };

  // Book a class
  const bookClass = async (classId: string, gymId: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error('Please log in to book a class');
      return false;
    }
    
    try {
      // Get the class to check availability
      const classToBook = classes.find(c => c.id === classId);
      
      if (!classToBook) {
        toast.error('Class not found');
        return false;
      }
      
      if (classToBook.bookedCount >= classToBook.capacity) {
        toast.error('This class is already at full capacity');
        return false;
      }
      
      // Check if user already booked this class
      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('class_id', classId)
        .eq('status', 'BOOKED');
      
      if (checkError) {
        console.error('Error checking existing booking:', checkError);
        toast.error('Could not verify booking status');
        return false;
      }
      
      if (existingBookings && existingBookings.length > 0) {
        toast.error('You have already booked this class');
        return false;
      }
      
      // Create the booking
      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: currentUser.id,
            class_id: classId,
            gym_id: gymId,
            status: 'BOOKED',
            date_time: classToBook.startTime,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        toast.error('Failed to book the class');
        return false;
      }
      
      // Update class booked count
      const { error: updateError } = await supabase
        .from('classes')
        .update({ booked_count: classToBook.bookedCount + 1 })
        .eq('id', classId);
      
      if (updateError) {
        console.error('Error updating class booked count:', updateError);
        // Try to rollback the booking if the count update fails
        await supabase.from('bookings').delete().eq('id', newBooking.id);
        toast.error('Failed to book the class');
        return false;
      }
      
      // Refresh data
      refreshData();
      toast.success('Class booked successfully!');
      return true;
    } catch (error) {
      console.error('Error in bookClass:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };
  
  // Cancel a booking
  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error('Please log in to cancel a booking');
      return false;
    }
    
    try {
      // Get the booking first
      const { data: bookingData, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching booking:', fetchError);
        toast.error('Could not find booking');
        return false;
      }
      
      // Check if user owns this booking
      if (bookingData.user_id !== currentUser.id) {
        toast.error('You are not authorized to cancel this booking');
        return false;
      }
      
      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'CANCELLED' })
        .eq('id', bookingId);
      
      if (updateError) {
        console.error('Error cancelling booking:', updateError);
        toast.error('Failed to cancel the booking');
        return false;
      }
      
      // Update class booked count
      const { error: classError } = await supabase
        .from('classes')
        .select('booked_count')
        .eq('id', bookingData.class_id)
        .single();
      
      if (!classError) {
        // Get current class
        const { data: classData, error: fetchClassError } = await supabase
          .from('classes')
          .select('booked_count')
          .eq('id', bookingData.class_id)
          .single();
        
        if (!fetchClassError && classData) {
          // Update the count
          await supabase
            .from('classes')
            .update({ booked_count: Math.max(0, classData.booked_count - 1) })
            .eq('id', bookingData.class_id);
        }
      }
      
      // Refresh data
      refreshData();
      toast.success('Booking cancelled successfully');
      return true;
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };
  
  // Get user bookings
  const getUserBookings = async (userId: string): Promise<Booking[]> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          class_id,
          gym_id,
          status,
          date_time,
          created_at,
          classes(title),
          gyms(name)
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user bookings:', error);
        return [];
      }

      return data.map(booking => ({
        id: booking.id,
        userId: booking.user_id,
        classId: booking.class_id,
        gymId: booking.gym_id,
        status: booking.status as 'BOOKED' | 'COMPLETED' | 'CANCELLED',
        dateTime: booking.date_time,
        className: booking.classes?.title || '',
        gymName: booking.gyms?.name || ''
      }));
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      return [];
    }
  };
  
  // Get gym by ID
  const getGymById = (gymId: string) => {
    return gyms.find(g => g.id === gymId);
  };
  
  // Get class by ID
  const getClassById = (classId: string) => {
    return classes.find(c => c.id === classId);
  };
  
  // Get classes for a specific gym
  const getGymClasses = async (gymId: string): Promise<FitnessClass[]> => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('gym_id', gymId);
      
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
    } catch (error) {
      console.error('Error in getGymClasses:', error);
      return [];
    }
  };
  
  // Add a new gym (for partners/admins)
  const addGym = async (gym: Omit<Gym, 'id' | 'rating' | 'reviewCount'>): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'PARTNER')) {
      toast.error('You do not have permission to add a gym');
      return false;
    }
    
    try {
      // Transform the gym data to match Supabase structure
      const { data, error } = await supabase
        .from('gyms')
        .insert([
          {
            name: gym.name,
            description: gym.description,
            address: gym.address,
            city: gym.city,
            main_image: gym.mainImage,
            images: gym.images,
            features: gym.features,
            category: gym.category,
            working_hours: gym.workingHours,
            rating: 0,
            review_count: 0,
            owner_id: currentUser.role === 'PARTNER' ? currentUser.id : gym.ownerId
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding gym:', error);
        toast.error('Failed to add the gym');
        return false;
      }
      
      // Refresh gym data
      fetchGyms();
      toast.success('Gym added successfully');
      return true;
    } catch (error) {
      console.error('Error in addGym:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };
  
  // Add a new fitness class
  const addClass = async (fitnessClass: Omit<FitnessClass, 'id' | 'bookedCount'>): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'PARTNER')) {
      toast.error('You do not have permission to add a class');
      return false;
    }
    
    try {
      // Check if user is gym owner or admin
      if (currentUser.role === 'PARTNER') {
        const { data, error } = await supabase
          .from('gyms')
          .select('owner_id')
          .eq('id', fitnessClass.gymId)
          .single();
        
        if (error || (data && data.owner_id !== currentUser.id)) {
          toast.error('You can only add classes to your own gyms');
          return false;
        }
      }
      
      // Add the class
      const { error } = await supabase
        .from('classes')
        .insert([
          {
            gym_id: fitnessClass.gymId,
            title: fitnessClass.title,
            description: fitnessClass.description,
            instructor: fitnessClass.instructor,
            start_time: fitnessClass.startTime,
            end_time: fitnessClass.endTime,
            category: fitnessClass.category,
            capacity: fitnessClass.capacity,
            booked_count: 0
          }
        ]);
      
      if (error) {
        console.error('Error adding class:', error);
        toast.error('Failed to add the class');
        return false;
      }
      
      // Refresh class data
      fetchClasses();
      toast.success('Class added successfully');
      return true;
    } catch (error) {
      console.error('Error in addClass:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };
  
  // Update gym information
  const updateGym = async (gymId: string, updatedGym: Partial<Gym>): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'PARTNER')) {
      toast.error('You do not have permission to update a gym');
      return false;
    }
    
    try {
      // Check if user is gym owner or admin
      if (currentUser.role === 'PARTNER') {
        const { data, error } = await supabase
          .from('gyms')
          .select('owner_id')
          .eq('id', gymId)
          .single();
        
        if (error || (data && data.owner_id !== currentUser.id)) {
          toast.error('You can only update your own gyms');
          return false;
        }
      }
      
      // Prepare the update data
      const updateData: any = {};
      
      if (updatedGym.name) updateData.name = updatedGym.name;
      if (updatedGym.description) updateData.description = updatedGym.description;
      if (updatedGym.address) updateData.address = updatedGym.address;
      if (updatedGym.city) updateData.city = updatedGym.city;
      if (updatedGym.mainImage) updateData.main_image = updatedGym.mainImage;
      if (updatedGym.images) updateData.images = updatedGym.images;
      if (updatedGym.features) updateData.features = updatedGym.features;
      if (updatedGym.category) updateData.category = updatedGym.category;
      if (updatedGym.workingHours) updateData.working_hours = updatedGym.workingHours;
      if (updatedGym.ownerId && currentUser.role === 'ADMIN') updateData.owner_id = updatedGym.ownerId;
      
      // Update the gym
      const { error } = await supabase
        .from('gyms')
        .update(updateData)
        .eq('id', gymId);
      
      if (error) {
        console.error('Error updating gym:', error);
        toast.error('Failed to update the gym');
        return false;
      }
      
      // Refresh gym data
      fetchGyms();
      toast.success('Gym updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateGym:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };
  
  // Delete a gym
  const deleteGym = async (gymId: string): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'PARTNER')) {
      toast.error('You do not have permission to delete a gym');
      return false;
    }
    
    try {
      // Check if user is gym owner or admin
      if (currentUser.role === 'PARTNER') {
        const { data, error } = await supabase
          .from('gyms')
          .select('owner_id')
          .eq('id', gymId)
          .single();
        
        if (error || (data && data.owner_id !== currentUser.id)) {
          toast.error('You can only delete your own gyms');
          return false;
        }
      }
      
      // Delete associated classes first
      const { error: classesError } = await supabase
        .from('classes')
        .delete()
        .eq('gym_id', gymId);
      
      if (classesError) {
        console.error('Error deleting gym classes:', classesError);
        toast.error('Failed to delete gym classes');
        return false;
      }
      
      // Delete the gym
      const { error } = await supabase
        .from('gyms')
        .delete()
        .eq('id', gymId);
      
      if (error) {
        console.error('Error deleting gym:', error);
        toast.error('Failed to delete the gym');
        return false;
      }
      
      // Refresh gym data
      fetchGyms();
      toast.success('Gym deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteGym:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };
  
  // Delete a class
  const deleteClass = async (classId: string): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'PARTNER')) {
      toast.error('You do not have permission to delete a class');
      return false;
    }
    
    try {
      // Get class info to check gym ownership
      const { data, error } = await supabase
        .from('classes')
        .select('gym_id')
        .eq('id', classId)
        .single();
      
      if (error) {
        console.error('Error fetching class:', error);
        toast.error('Could not find class');
        return false;
      }
      
      // If partner, check if they own the gym
      if (currentUser.role === 'PARTNER') {
        const { data: gymData, error: gymError } = await supabase
          .from('gyms')
          .select('owner_id')
          .eq('id', data.gym_id)
          .single();
        
        if (gymError || (gymData && gymData.owner_id !== currentUser.id)) {
          toast.error('You can only delete classes from your own gyms');
          return false;
        }
      }
      
      // Delete associated bookings first
      await supabase
        .from('bookings')
        .delete()
        .eq('class_id', classId);
      
      // Delete the class
      const { error: deleteError } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);
      
      if (deleteError) {
        console.error('Error deleting class:', deleteError);
        toast.error('Failed to delete the class');
        return false;
      }
      
      // Refresh class data
      fetchClasses();
      toast.success('Class deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteClass:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };
  
  const value = {
    user: currentUser,
    gyms,
    classes,
    bookings,
    subscriptions,
    filteredGyms,
    bookClass,
    cancelBooking,
    filterGyms,
    getUserBookings,
    getGymById,
    getClassById,
    getGymClasses,
    addGym,
    addClass,
    updateGym,
    deleteGym,
    deleteClass,
    refreshData
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
