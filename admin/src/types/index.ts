
// User types
export type UserRole = 'USER' | 'PARTNER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  subscription_id?: string; // Changed from subscriptionId
  created_at: string; // Changed from createdAt
  profile_image?: string; // Changed from profileImage
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
  main_image: string; // Changed from mainImage
  images: string[];
  ownerid: string; // Confirmed as ownerid
  rating: number;
  review_count: number; // Changed from reviewCount
  features: string[];
  working_hours: { // Changed from workingHours
    open: string;
    close: string;
  };
}

// Class and schedule types
export interface FitnessClass {
  id: string;
  gymid: string; // Changed from gymId
  title: string;
  description: string;
  instructor: string;
  starttime: string; // Changed from startTime
  end_time: string; // Changed from endTime
  capacity: number;
  booked_count: number; // Changed from bookedCount
  category: string;
}

// Booking types
export interface Booking {
  id: string;
  user_id: string; // Confirmed as user_id
  class_id: string; // Confirmed as class_id
  gym_id: string; // Changed from gymId
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  date_time: string; // Confirmed as date_time
  created_at?: string; // Changed from createdAt
  className?: string;
  gymName?: string;
  userName?: string;
  class?: FitnessClass;
  gym?: {
    id: string;
    name: string;
    city: string;
    main_image: string; // Changed from mainImage
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
