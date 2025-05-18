
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
  main_image: string; // Changed from mainImage
  images: string[];
  ownerid: string; // Confirmed as ownerid to match DB
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
  gymid: string; // Changed from gymId to match DB
  title: string;
  description: string;
  instructor: string;
  starttime: string; // Changed from startTime to match DB
  end_time: string; // Changed from endTime
  capacity: number;
  booked_count: number; // Changed from bookedCount
  category: string;
}

// Booking types
export interface Booking {
  id: string;
  user_id: string; // Confirmed as user_id to match DB
  class_id: string; // Confirmed as class_id to match DB
  gym_id: string; // Changed from gymId
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  date_time: string; // Confirmed as date_time to match DB
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

// Review types
export interface Review {
  id: string;
  user_id: string; // Changed from userId
  gym_id: string; // Changed from gymId
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
