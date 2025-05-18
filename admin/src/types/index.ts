
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
}

// Class and schedule types
export interface FitnessClass {
  id: string;
  gymid: string;
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

// Analytics types
export interface AnalyticsSummary {
  totalBookings: number;
  activeUsers: number;
  totalRevenue: number;
  gymCount: number;
}

export interface BookingTrend {
  date: string;
  bookings: number;
}

export interface TopGym {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
}
