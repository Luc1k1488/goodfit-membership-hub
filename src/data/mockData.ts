
import { User, Gym, FitnessClass, Subscription, Booking } from "@/types";

// Mock Users Data
export const usersData: User[] = [
  {
    id: "user_1",
    name: "John Doe",
    phone: "9001234567",
    email: "john@example.com",
    role: "USER",
    createdAt: "2023-05-10T08:00:00Z",
    profileImage: "/placeholder.svg"
  },
  {
    id: "user_2",
    name: "Jane Smith",
    phone: "9009876543",
    email: "jane@example.com",
    role: "USER",
    subscriptionId: "sub_1",
    createdAt: "2023-06-15T10:30:00Z",
    profileImage: "/placeholder.svg"
  },
  {
    id: "partner_1",
    name: "Alex Johnson",
    phone: "9007654321",
    email: "alex@fitgym.com",
    role: "PARTNER",
    createdAt: "2023-04-20T09:15:00Z",
    profileImage: "/placeholder.svg"
  },
  {
    id: "admin_1",
    name: "Admin User",
    phone: "9000000000",
    email: "admin@goodfit.com",
    role: "ADMIN",
    createdAt: "2023-01-01T00:00:00Z",
    profileImage: "/placeholder.svg"
  }
];

// Mock Gyms Data
export const gymData: Gym[] = [
  {
    id: "gym_1",
    name: "PowerFit Gym",
    description: "A state-of-the-art fitness center with the latest equipment and professional trainers.",
    category: ["gym", "weights", "cardio"],
    city: "Moscow",
    address: "123 Fitness St., Moscow",
    location: { lat: 55.751244, lng: 37.618423 },
    mainImage: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg"],
    ownerId: "partner_1",
    rating: 4.8,
    reviewCount: 156,
    features: ["24/7 Access", "Personal Trainers", "Showers", "Lockers"],
    workingHours: { open: "06:00", close: "23:00" }
  },
  {
    id: "gym_2",
    name: "ZenYoga Studio",
    description: "Find your inner peace in our tranquil yoga studio with experienced instructors.",
    category: ["yoga", "meditation", "pilates"],
    city: "Moscow",
    address: "456 Zen Way, Moscow",
    location: { lat: 55.761244, lng: 37.628423 },
    mainImage: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg"],
    ownerId: "partner_1",
    rating: 4.9,
    reviewCount: 98,
    features: ["Mats Provided", "Meditation Area", "Certified Instructors"],
    workingHours: { open: "08:00", close: "21:00" }
  },
  {
    id: "gym_3",
    name: "AquaSwim Center",
    description: "Olympic-size swimming pool with lanes for all skill levels and professional coaches.",
    category: ["pool", "swimming", "aqua aerobics"],
    city: "Moscow",
    address: "789 Aqua Blvd., Moscow",
    location: { lat: 55.741244, lng: 37.608423 },
    mainImage: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg"],
    ownerId: "partner_1",
    rating: 4.7,
    reviewCount: 112,
    features: ["Olympic Pool", "Swimming Lessons", "Sauna", "Towel Service"],
    workingHours: { open: "07:00", close: "22:00" }
  },
  {
    id: "gym_4",
    name: "Boxing Academy",
    description: "Professional boxing training for all levels from beginners to competitive athletes.",
    category: ["boxing", "martial arts", "fitness"],
    city: "Saint Petersburg",
    address: "101 Punch Ave, Saint Petersburg",
    location: { lat: 59.934280, lng: 30.335098 },
    mainImage: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg"],
    ownerId: "partner_1",
    rating: 4.6,
    reviewCount: 87,
    features: ["Boxing Rings", "Training Equipment", "Professional Coaches"],
    workingHours: { open: "09:00", close: "22:00" }
  },
  {
    id: "gym_5",
    name: "Crossfit Arena",
    description: "High-intensity functional training in a supportive community environment.",
    category: ["crossfit", "weights", "fitness"],
    city: "Saint Petersburg",
    address: "202 Lifting St., Saint Petersburg",
    location: { lat: 59.944280, lng: 30.345098 },
    mainImage: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg"],
    ownerId: "partner_1",
    rating: 4.5,
    reviewCount: 143,
    features: ["Crossfit Equipment", "Group Classes", "Personal Training"],
    workingHours: { open: "06:00", close: "23:00" }
  },
  {
    id: "gym_6",
    name: "Dance Studio",
    description: "Express yourself through dance with a variety of styles and expert instructors.",
    category: ["dance", "fitness", "ballet"],
    city: "Kazan",
    address: "303 Dance Way, Kazan",
    location: { lat: 55.796289, lng: 49.108795 },
    mainImage: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg"],
    ownerId: "partner_1",
    rating: 4.9,
    reviewCount: 76,
    features: ["Dance Floors", "Multiple Studios", "Professional Sound System"],
    workingHours: { open: "10:00", close: "22:00" }
  }
];

// Mock Classes Data
export const classesData: FitnessClass[] = [
  {
    id: "class_1",
    gymId: "gym_1",
    title: "Morning Power Workout",
    description: "Start your day with an energizing full-body workout to boost your metabolism.",
    instructor: "Mike Johnson",
    startTime: "2023-07-01T07:00:00Z",
    endTime: "2023-07-01T08:00:00Z",
    capacity: 15,
    bookedCount: 8,
    category: "weights"
  },
  {
    id: "class_2",
    gymId: "gym_1",
    title: "HIIT Challenge",
    description: "High-intensity interval training to burn maximum calories in minimum time.",
    instructor: "Sarah Williams",
    startTime: "2023-07-01T18:30:00Z",
    endTime: "2023-07-01T19:30:00Z",
    capacity: 12,
    bookedCount: 12,
    category: "cardio"
  },
  {
    id: "class_3",
    gymId: "gym_2",
    title: "Vinyasa Flow Yoga",
    description: "Dynamic yoga sequence linking breath with movement for all skill levels.",
    instructor: "Lily Chen",
    startTime: "2023-07-02T09:00:00Z",
    endTime: "2023-07-02T10:15:00Z",
    capacity: 20,
    bookedCount: 15,
    category: "yoga"
  },
  {
    id: "class_4",
    gymId: "gym_2",
    title: "Meditation & Mindfulness",
    description: "Guided meditation session to reduce stress and improve mental clarity.",
    instructor: "David Ross",
    startTime: "2023-07-02T19:00:00Z",
    endTime: "2023-07-02T20:00:00Z",
    capacity: 25,
    bookedCount: 10,
    category: "meditation"
  },
  {
    id: "class_5",
    gymId: "gym_3",
    title: "Advanced Swim Technique",
    description: "Improve your swimming technique with professional coaching.",
    instructor: "Emma Watson",
    startTime: "2023-07-03T16:00:00Z",
    endTime: "2023-07-03T17:30:00Z",
    capacity: 10,
    bookedCount: 7,
    category: "swimming"
  },
  {
    id: "class_6",
    gymId: "gym_3",
    title: "Aqua Aerobics",
    description: "Low-impact, high-energy water workout suitable for all fitness levels.",
    instructor: "Tom Baker",
    startTime: "2023-07-03T18:00:00Z",
    endTime: "2023-07-03T19:00:00Z",
    capacity: 15,
    bookedCount: 9,
    category: "aqua aerobics"
  },
  {
    id: "class_7",
    gymId: "gym_4",
    title: "Boxing Fundamentals",
    description: "Learn the basics of boxing technique, footwork, and combinations.",
    instructor: "Jack Hammer",
    startTime: "2023-07-04T17:00:00Z",
    endTime: "2023-07-04T18:30:00Z",
    capacity: 10,
    bookedCount: 5,
    category: "boxing"
  },
  {
    id: "class_8",
    gymId: "gym_5",
    title: "Crossfit WOD",
    description: "Workout of the day featuring varied functional movements at high intensity.",
    instructor: "Chris Power",
    startTime: "2023-07-04T19:00:00Z",
    endTime: "2023-07-04T20:00:00Z",
    capacity: 12,
    bookedCount: 11,
    category: "crossfit"
  },
  {
    id: "class_9",
    gymId: "gym_6",
    title: "Hip-Hop Dance",
    description: "Learn popular hip-hop choreography in a fun, high-energy environment.",
    instructor: "Maria Lopez",
    startTime: "2023-07-05T18:00:00Z",
    endTime: "2023-07-05T19:30:00Z",
    capacity: 18,
    bookedCount: 12,
    category: "dance"
  }
];

// Mock Subscriptions Data
export const subscriptionsData: Subscription[] = [
  {
    id: "sub_1",
    name: "30-Day Pass",
    durationDays: 30,
    price: 4800,
    features: [
      "Access to all partner gyms",
      "Unlimited class bookings",
      "No long-term commitment"
    ]
  },
  {
    id: "sub_2",
    name: "90-Day Pass",
    durationDays: 90,
    price: 12600,
    features: [
      "Access to all partner gyms",
      "Unlimited class bookings",
      "Priority booking window",
      "16% discount vs monthly"
    ],
    isPopular: true
  },
  {
    id: "sub_3",
    name: "180-Day Pass",
    durationDays: 180,
    price: 23400,
    features: [
      "Access to all partner gyms",
      "Unlimited class bookings",
      "Priority booking window",
      "Free guest pass each month",
      "19% discount vs monthly"
    ]
  },
  {
    id: "sub_4",
    name: "365-Day Pass",
    durationDays: 365,
    price: 42000,
    features: [
      "Access to all partner gyms",
      "Unlimited class bookings",
      "Priority booking window",
      "Free guest pass each month",
      "Personal fitness consultation",
      "28% discount vs monthly"
    ]
  }
];

// Mock Bookings Data
export const bookingsData: Booking[] = [
  {
    id: "booking_1",
    userId: "user_1",
    classId: "class_1",
    gymId: "gym_1",
    className: "Morning Power Workout",
    gymName: "PowerFit Gym",
    status: "COMPLETED",
    dateTime: "2023-06-28T07:00:00Z"
  },
  {
    id: "booking_2",
    userId: "user_1",
    classId: "class_3",
    gymId: "gym_2",
    className: "Vinyasa Flow Yoga",
    gymName: "ZenYoga Studio",
    status: "BOOKED",
    dateTime: "2023-07-02T09:00:00Z"
  },
  {
    id: "booking_3",
    userId: "user_2",
    classId: "class_5",
    gymId: "gym_3",
    className: "Advanced Swim Technique",
    gymName: "AquaSwim Center",
    status: "BOOKED",
    dateTime: "2023-07-03T16:00:00Z"
  },
  {
    id: "booking_4",
    userId: "user_2",
    classId: "class_7",
    gymId: "gym_4",
    className: "Boxing Fundamentals",
    gymName: "Boxing Academy",
    status: "CANCELLED",
    dateTime: "2023-07-04T17:00:00Z"
  }
];
