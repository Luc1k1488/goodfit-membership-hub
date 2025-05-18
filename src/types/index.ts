
// User types
export type UserRole = 'USER' | 'PARTNER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  subscription_id?: string;
  created_at: string;
  profile_image?: string;
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
  main_image: string;
  images: string[];
  ownerid: string;
  rating: number;
  review_count: number;
  working_hours: {
    open: string;
    close: string;
  };
  features: string[];
}

// Class and schedule types
export interface FitnessClass {
  id: string;
  gym_id: string;
  title: string;
  description: string;
  instructor: string;
  starttime: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  category: string;
}

// Booking types
export interface Booking {
  id: string;
  user_id: string;
  class_id: string;
  gym_id: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  date_time: string;
  created_at?: string;
  className?: string;
  gymName?: string;
  userName?: string;
  class?: FitnessClass;
  gym?: {
    id: string;
    name: string;
    city: string;
    main_image: string;
  };
}

// Review types
export interface Review {
  id: string;
  user_id: string;
  gym_id: string;
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
  search?: string;
}
