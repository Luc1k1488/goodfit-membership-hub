
// User types
export type UserRole = 'USER' | 'PARTNER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  subscriptionId?: string;
  createdAt: string;
  profileImage?: string;
}

export interface UserProfile extends User {
  bookings: Booking[];
}

// Subscription types
export interface Subscription {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  features: string[];
  isPopular?: boolean;
}

// Gym and fitness center types
export interface Gym {
  id: string;
  name: string;
  description: string;
  category: string[];
  city: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  mainImage: string;
  images: string[];
  ownerid: string; // Changed from ownerId to ownerid to match DB
  rating: number;
  reviewCount: number;
  features: string[];
  workingHours: {
    open: string;
    close: string;
  };
}

// Class and schedule types
export interface FitnessClass {
  id: string;
  gymId: string; // Internal representation, might need mapping to/from gymid
  title: string;
  description: string;
  instructor: string;
  startTime: string; // Internal representation, might need mapping to/from starttime
  endTime: string;
  capacity: number;
  bookedCount: number;
  category: string;
}

// Booking types
export interface Booking {
  id: string;
  userId: string; // Changed from userId to user_id to match DB when accessing directly
  classId: string; // Changed from classId to class_id to match DB when accessing directly
  gymId: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  dateTime: string; // Changed from dateTime to date_time to match DB when accessing directly
  createdAt?: string;
  className?: string;
  gymName?: string;
  userName?: string;
  class?: FitnessClass;
  gym?: {
    id: string;
    name: string;
    city: string;
    mainImage: string;
  };
}

// Review types
export interface Review {
  id: string;
  userId: string;
  gymId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userImage?: string;
}

// Filter types
export interface GymFilters {
  city?: string;
  category?: string[];
  rating?: number;
}
