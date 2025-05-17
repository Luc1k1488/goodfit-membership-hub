
import { User } from "@/types";

export type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  authInitialized: boolean;
  userRole: "USER" | "PARTNER" | "ADMIN" | null;
};
