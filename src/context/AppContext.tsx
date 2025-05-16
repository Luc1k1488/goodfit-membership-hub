
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, Gym, FitnessClass, Booking, Subscription } from '@/types';
import { gymData, classesData, usersData, subscriptionsData, bookingsData } from '@/data/mockData';
import { toast } from "sonner";

interface AppContextProps {
  user: User | null;
  gyms: Gym[];
  classes: FitnessClass[];
  bookings: Booking[];
  subscriptions: Subscription[];
  filteredGyms: Gym[];
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, phone: string, password: string, role: UserRole) => Promise<boolean>;
  bookClass: (classId: string, gymId: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => void;
  filterGyms: (cityFilter?: string, categoryFilter?: string[]) => void;
  getUserBookings: (userId: string) => Booking[];
  getGymById: (gymId: string) => Gym | undefined;
  getClassById: (classId: string) => FitnessClass | undefined;
  getGymClasses: (gymId: string) => FitnessClass[];
  addGym: (gym: Omit<Gym, 'id' | 'rating' | 'reviewCount'>) => Promise<boolean>;
  addClass: (fitnessClass: Omit<FitnessClass, 'id' | 'bookedCount'>) => Promise<boolean>;
  updateGym: (gymId: string, updatedGym: Partial<Gym>) => Promise<boolean>;
  deleteGym: (gymId: string) => Promise<boolean>;
  deleteClass: (classId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [gyms, setGyms] = useState<Gym[]>(gymData);
  const [classes, setClasses] = useState<FitnessClass[]>(classesData);
  const [bookings, setBookings] = useState<Booking[]>(bookingsData);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(subscriptionsData);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>(gymData);
  
  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('goodfit_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('goodfit_user');
      }
    }
  }, []);

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

  // Authentication functions
  const login = async (phone: string, password: string): Promise<boolean> => {
    const foundUser = usersData.find(u => u.phone === phone);
    
    if (foundUser) {
      // In a real app, this would verify the password against a hashed version
      setUser(foundUser);
      localStorage.setItem('goodfit_user', JSON.stringify(foundUser));
      toast.success(`Welcome back, ${foundUser.name}!`);
      return true;
    }
    
    toast.error('Login failed. Please check your credentials.');
    return false;
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('goodfit_user');
    toast.info('You have been logged out');
  };
  
  const register = async (
    name: string, 
    phone: string, 
    password: string, 
    role: UserRole = 'USER'
  ): Promise<boolean> => {
    const userExists = usersData.some(u => u.phone === phone);
    
    if (userExists) {
      toast.error('A user with this phone number already exists');
      return false;
    }
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      phone,
      role,
      createdAt: new Date().toISOString(),
    };
    
    // In a real app, this would save to the database
    usersData.push(newUser);
    setUser(newUser);
    localStorage.setItem('goodfit_user', JSON.stringify(newUser));
    
    toast.success('Registration successful! Welcome to GoodFit');
    return true;
  };
  
  // Booking functions
  const bookClass = async (classId: string, gymId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please log in to book a class');
      return false;
    }
    
    const fitnessClass = classes.find(c => c.id === classId);
    const gym = gyms.find(g => g.id === gymId);
    
    if (!fitnessClass || !gym) {
      toast.error('Class or gym not found');
      return false;
    }
    
    if (fitnessClass.bookedCount >= fitnessClass.capacity) {
      toast.error('This class is already at full capacity');
      return false;
    }
    
    // Check if user already booked this class
    const alreadyBooked = bookings.some(b => 
      b.userId === user.id && 
      b.classId === classId &&
      b.status === 'BOOKED'
    );
    
    if (alreadyBooked) {
      toast.error('You have already booked this class');
      return false;
    }
    
    const newBooking: Booking = {
      id: `booking_${Date.now()}`,
      userId: user.id,
      classId,
      gymId,
      className: fitnessClass.title,
      gymName: gym.name,
      status: 'BOOKED',
      dateTime: fitnessClass.startTime,
    };
    
    // Update booking state
    setBookings([...bookings, newBooking]);
    
    // Update class booked count
    setClasses(classes.map(c => 
      c.id === classId ? { ...c, bookedCount: c.bookedCount + 1 } : c
    ));
    
    toast.success('Class booked successfully!');
    return true;
  };
  
  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
      toast.error('Booking not found');
      return;
    }
    
    // Update booking status
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
    ));
    
    // Update class booked count
    setClasses(classes.map(c => 
      c.id === booking.classId ? { ...c, bookedCount: c.bookedCount - 1 } : c
    ));
    
    toast.success('Booking cancelled successfully');
  };
  
  // Utility functions
  const getUserBookings = (userId: string) => {
    return bookings.filter(b => b.userId === userId);
  };
  
  const getGymById = (gymId: string) => {
    return gyms.find(g => g.id === gymId);
  };
  
  const getClassById = (classId: string) => {
    return classes.find(c => c.id === classId);
  };
  
  const getGymClasses = (gymId: string) => {
    return classes.filter(c => c.gymId === gymId);
  };
  
  // Admin and partner functions
  const addGym = async (gym: Omit<Gym, 'id' | 'rating' | 'reviewCount'>): Promise<boolean> => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PARTNER')) {
      toast.error('You do not have permission to add a gym');
      return false;
    }
    
    const newGym: Gym = {
      ...gym,
      id: `gym_${Date.now()}`,
      rating: 0,
      reviewCount: 0,
    };
    
    setGyms([...gyms, newGym]);
    setFilteredGyms([...filteredGyms, newGym]);
    
    toast.success('Gym added successfully');
    return true;
  };
  
  const addClass = async (
    fitnessClass: Omit<FitnessClass, 'id' | 'bookedCount'>
  ): Promise<boolean> => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PARTNER')) {
      toast.error('You do not have permission to add a class');
      return false;
    }
    
    const newClass: FitnessClass = {
      ...fitnessClass,
      id: `class_${Date.now()}`,
      bookedCount: 0,
    };
    
    setClasses([...classes, newClass]);
    
    toast.success('Class added successfully');
    return true;
  };
  
  const updateGym = async (gymId: string, updatedGym: Partial<Gym>): Promise<boolean> => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PARTNER')) {
      toast.error('You do not have permission to update a gym');
      return false;
    }
    
    const gymIndex = gyms.findIndex(g => g.id === gymId);
    
    if (gymIndex === -1) {
      toast.error('Gym not found');
      return false;
    }
    
    // Check if user is owner or admin
    if (user.role === 'PARTNER' && gyms[gymIndex].ownerId !== user.id) {
      toast.error('You can only update your own gyms');
      return false;
    }
    
    const updatedGyms = [...gyms];
    updatedGyms[gymIndex] = { ...updatedGyms[gymIndex], ...updatedGym };
    
    setGyms(updatedGyms);
    setFilteredGyms(updatedGyms); // Update filtered gyms too
    
    toast.success('Gym updated successfully');
    return true;
  };
  
  const deleteGym = async (gymId: string): Promise<boolean> => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PARTNER')) {
      toast.error('You do not have permission to delete a gym');
      return false;
    }
    
    const gym = gyms.find(g => g.id === gymId);
    
    if (!gym) {
      toast.error('Gym not found');
      return false;
    }
    
    // Check if user is owner or admin
    if (user.role === 'PARTNER' && gym.ownerId !== user.id) {
      toast.error('You can only delete your own gyms');
      return false;
    }
    
    // Delete gym
    const updatedGyms = gyms.filter(g => g.id !== gymId);
    setGyms(updatedGyms);
    setFilteredGyms(updatedGyms);
    
    // Delete associated classes
    const updatedClasses = classes.filter(c => c.gymId !== gymId);
    setClasses(updatedClasses);
    
    toast.success('Gym deleted successfully');
    return true;
  };
  
  const deleteClass = async (classId: string): Promise<boolean> => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PARTNER')) {
      toast.error('You do not have permission to delete a class');
      return false;
    }
    
    const classToDelete = classes.find(c => c.id === classId);
    
    if (!classToDelete) {
      toast.error('Class not found');
      return false;
    }
    
    // Find the gym for this class
    const gym = gyms.find(g => g.id === classToDelete.gymId);
    
    // Check if user is owner or admin
    if (user.role === 'PARTNER' && gym && gym.ownerId !== user.id) {
      toast.error('You can only delete classes from your own gyms');
      return false;
    }
    
    // Delete class
    setClasses(classes.filter(c => c.id !== classId));
    
    toast.success('Class deleted successfully');
    return true;
  };
  
  const value = {
    user,
    gyms,
    classes,
    bookings,
    subscriptions,
    filteredGyms,
    login,
    logout,
    register,
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
