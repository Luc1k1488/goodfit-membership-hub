
import { User } from "@/types";

export type AuthContextType = {
  currentUser: User | null;
  login: (contact: string) => Promise<void>;
  verifyOTP: (contact: string, otp: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (name: string, contact: string) => Promise<void>;
  isLoading: boolean;
  authInitialized: boolean;
  userRole: "USER" | "PARTNER" | "ADMIN" | null;
};
