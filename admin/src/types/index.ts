
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
  ownerId: string;
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
  gymId: string;
  title: string;
  description: string;
  instructor: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  category: string;
}

// Booking types
export interface Booking {
  id: string;
  userId: string;
  classId: string;
  gymId: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  dateTime: string;
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
