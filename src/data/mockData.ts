import { Gym, FitnessClass, Booking, User, Review, Subscription } from '@/types';

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Александр Петров",
    email: "alex@example.com",
    phone: "+7 (913) 123-4567",
    role: "USER",
    createdAt: "2023-05-15T10:00:00Z",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "user-2",
    name: "Екатерина Смирнова",
    email: "ekaterina@example.com",
    phone: "+7 (926) 987-6543",
    role: "USER",
    createdAt: "2023-06-20T14:30:00Z",
    profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "partner-1",
    name: "Фитнес Плюс",
    email: "fitness@example.com",
    phone: "+7 (495) 111-2233",
    role: "PARTNER",
    createdAt: "2023-04-10T09:15:00Z",
    profileImage: "/fitness-plus-logo.png",
  },
  {
    id: "admin-1",
    name: "Админ Системы",
    email: "admin@goodfit.ru",
    phone: "+7 (800) 555-3535",
    role: "ADMIN",
    createdAt: "2023-01-01T00:00:00Z",
    profileImage: "/admin-logo.png",
  }
];

// Mock Gyms
export const MOCK_GYMS: Gym[] = [
  {
    id: "gym-1",
    name: "Фитнес-центр 'Олимп'",
    description: "Современный фитнес-клуб с полным спектром услуг",
    category: ["Тренажерный зал", "Групповые занятия", "Бассейн"],
    city: "Москва",
    address: "ул. Тверская, 18",
    location: {
      lat: 55.767539,
      lng: 37.604673
    },
    mainImage: "https://via.placeholder.com/800x600?text=Olimp+Gym",
    images: [
      "https://via.placeholder.com/800x600?text=Olimp+Gym+1",
      "https://via.placeholder.com/800x600?text=Olimp+Gym+2",
      "https://via.placeholder.com/800x600?text=Olimp+Gym+3"
    ],
    ownerid: "partner-1",
    rating: 4.8,
    reviewCount: 124,
    features: ["Парковка", "Сауна", "Душевые", "Шкафчики", "Wi-Fi"],
    workingHours: {
      open: "07:00",
      close: "23:00"
    }
  },
  {
    id: "gym-2",
    name: "Фитнес-студия 'Энергия'",
    description: "Специализированная студия групповых программ",
    category: ["Групповые занятия", "Йога", "Пилатес"],
    city: "Москва",
    address: "ул. Ленина, 42",
    location: {
      lat: 55.751244,
      lng: 37.618423
    },
    mainImage: "https://via.placeholder.com/800x600?text=Energy+Studio",
    images: [
      "https://via.placeholder.com/800x600?text=Energy+Studio+1",
      "https://via.placeholder.com/800x600?text=Energy+Studio+2"
    ],
    ownerid: "partner-1",
    rating: 4.6,
    reviewCount: 87,
    features: ["Душевые", "Шкафчики", "Wi-Fi"],
    workingHours: {
      open: "08:00",
      close: "22:00"
    }
  },
  {
    id: "gym-3",
    name: "Тренажёрный зал 'Сила'",
    description: "Специализированный зал для силовых тренировок",
    category: ["Тренажерный зал", "Кроссфит"],
    city: "Санкт-Петербург",
    address: "пр. Невский, 78",
    location: {
      lat: 59.932642,
      lng: 30.361144
    },
    mainImage: "https://via.placeholder.com/800x600?text=Power+Gym",
    images: [
      "https://via.placeholder.com/800x600?text=Power+Gym+1",
      "https://via.placeholder.com/800x600?text=Power+Gym+2",
      "https://via.placeholder.com/800x600?text=Power+Gym+3"
    ],
    ownerid: "partner-1",
    rating: 4.7,
    reviewCount: 92,
    features: ["Парковка", "Душевые", "Шкафчики"],
    workingHours: {
      open: "06:00",
      close: "23:00"
    }
  },
  {
    id: "gym-4",
    name: "Йога-студия 'Гармония'",
    description: "Уютная студия для практики йоги и медитации",
    category: ["Йога", "Медитация", "Пилатес"],
    city: "Санкт-Петербург",
    address: "ул. Восточная, 15",
    location: {
      lat: 59.942642,
      lng: 30.351144
    },
    mainImage: "https://via.placeholder.com/800x600?text=Harmony+Yoga",
    images: [
      "https://via.placeholder.com/800x600?text=Harmony+Yoga+1",
      "https://via.placeholder.com/800x600?text=Harmony+Yoga+2"
    ],
    ownerid: "partner-1",
    rating: 4.9,
    reviewCount: 65,
    features: ["Душевые", "Шкафчики", "Чай"],
    workingHours: {
      open: "09:00",
      close: "21:00"
    }
  },
  {
    id: "gym-5",
    name: "Спортивный центр 'Чемпион'",
    description: "Многофункциональный спортивный комплекс для всей семьи",
    category: ["Тренажерный зал", "Бассейн", "Игровые виды спорта"],
    city: "Казань",
    address: "пр. Победы, 50",
    location: {
      lat: 55.788746,
      lng: 49.122325
    },
    mainImage: "https://via.placeholder.com/800x600?text=Champion",
    images: [
      "https://via.placeholder.com/800x600?text=Champion+1",
      "https://via.placeholder.com/800x600?text=Champion+2",
      "https://via.placeholder.com/800x600?text=Champion+3"
    ],
    ownerid: "partner-1",
    rating: 4.5,
    reviewCount: 118,
    features: ["Парковка", "Сауна", "Душевые", "Шкафчики", "Wi-Fi", "Кафе"],
    workingHours: {
      open: "07:00",
      close: "22:00"
    }
  },
  {
    id: "gym-6",
    name: "Танцевальная студия 'Ритм'",
    description: "Студия современных танцевальных направлений",
    category: ["Танцы", "Групповые занятия"],
    city: "Москва",
    address: "ул. Садовая, 33",
    location: {
      lat: 55.762613,
      lng: 37.621913
    },
    mainImage: "https://via.placeholder.com/800x600?text=Rhythm+Dance",
    images: [
      "https://via.placeholder.com/800x600?text=Rhythm+Dance+1",
      "https://via.placeholder.com/800x600?text=Rhythm+Dance+2"
    ],
    ownerid: "partner-1",
    rating: 4.7,
    reviewCount: 53,
    features: ["Душевые", "Шкафчики", "Wi-Fi"],
    workingHours: {
      open: "10:00",
      close: "22:00"
    }
  }
];

// Mock Fitness Classes
export const MOCK_CLASSES: FitnessClass[] = [
  {
    id: "class-1",
    gymId: "gym-1",
    title: "Функциональный тренинг",
    description: "Высокоинтенсивная тренировка для всего тела",
    instructor: "Иванов Петр",
    startTime: "2024-03-15T18:00:00Z",
    endTime: "2024-03-15T19:00:00Z",
    capacity: 20,
    bookedCount: 8,
    category: "Функциональный тренинг"
  },
  {
    id: "class-2",
    gymId: "gym-1",
    title: "Йога для начинающих",
    description: "Мягкая практика для развития гибкости и баланса",
    instructor: "Сидорова Анна",
    startTime: "2024-03-16T10:00:00Z",
    endTime: "2024-03-16T11:30:00Z",
    capacity: 15,
    bookedCount: 12,
    category: "Йога"
  },
  {
    id: "class-3",
    gymId: "gym-2",
    title: "Пилатес",
    description: "Укрепление мышц кора и улучшение осанки",
    instructor: "Козлова Ольга",
    startTime: "2024-03-17T12:00:00Z",
    endTime: "2024-03-17T13:00:00Z",
    capacity: 10,
    bookedCount: 7,
    category: "Пилатес"
  },
  {
    id: "class-4",
    gymId: "gym-3",
    title: "Кроссфит",
    description: "Комплексная тренировка на силу и выносливость",
    instructor: "Смирнов Алексей",
    startTime: "2024-03-18T19:00:00Z",
    endTime: "2024-03-18T20:00:00Z",
    capacity: 12,
    bookedCount: 10,
    category: "Кроссфит"
  },
  {
    id: "class-5",
    gymId: "gym-4",
    title: "Медитация",
    description: "Практика осознанности и релаксации",
    instructor: "Морозова Елена",
    startTime: "2024-03-19T08:00:00Z",
    endTime: "2024-03-19T09:00:00Z",
    capacity: 8,
    bookedCount: 6,
    category: "Медитация"
  },
  {
    id: "class-6",
    gymId: "gym-5",
    title: "Аквааэробика",
    description: "Эффективная тренировка в воде",
    instructor: "Павлова Светлана",
    startTime: "2024-03-20T11:00:00Z",
    endTime: "2024-03-20T12:00:00Z",
    capacity: 15,
    bookedCount: 13,
    category: "Аквааэробика"
  },
  {
    id: "class-7",
    gymId: "gym-6",
    title: "Современные танцы",
    description: "Изучение различных танцевальных стилей",
    instructor: "Андреева Юлия",
    startTime: "2024-03-21T17:00:00Z",
    endTime: "2024-03-21T18:30:00Z",
    capacity: 10,
    bookedCount: 9,
    category: "Танцы"
  }
];

// Mock Bookings
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "booking-1",
    userId: "user-1",
    classId: "class-1",
    gymId: "gym-1",
    status: "BOOKED",
    dateTime: "2024-03-15T18:00:00Z"
  },
  {
    id: "booking-2",
    userId: "user-2",
    classId: "class-2",
    gymId: "gym-1",
    status: "BOOKED",
    dateTime: "2024-03-16T10:00:00Z"
  },
  {
    id: "booking-3",
    userId: "user-1",
    classId: "class-3",
    gymId: "gym-2",
    status: "BOOKED",
    dateTime: "2024-03-17T12:00:00Z"
  }
];

// Mock Reviews
export const MOCK_REVIEWS: Review[] = [
  {
    id: "review-1",
    userId: "user-1",
    gymId: "gym-1",
    userName: "Александр Петров",
    rating: 5,
    comment: "Отличный фитнес-центр, все на высшем уровне!",
    date: "2024-03-10T12:00:00Z"
  },
  {
    id: "review-2",
    userId: "user-2",
    gymId: "gym-1",
    userName: "Екатерина Смирнова",
    rating: 4,
    comment: "Хорошие тренеры и современное оборудование.",
    date: "2024-03-09T15:00:00Z"
  }
];

// Mock Subscriptions
export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-1",
    name: "Базовый",
    durationDays: 30,
    price: 1500,
    features: ["Тренажерный зал"],
    isPopular: true
  },
  {
    id: "sub-2",
    name: "Стандарт",
    durationDays: 90,
    price: 4000,
    features: ["Тренажерный зал", "Групповые занятия"],
    isPopular: false
  },
  {
    id: "sub-3",
    name: "Премиум",
    durationDays: 365,
    price: 15000,
    features: ["Тренажерный зал", "Групповые занятия", "Бассейн", "Сауна"],
    isPopular: false
  }
];
