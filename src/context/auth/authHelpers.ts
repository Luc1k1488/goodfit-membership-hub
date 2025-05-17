
import { toast } from "sonner";
import { User } from "@/types";
import {
  sendOTP,
  verifyOTPCode,
  getUserOrCreate,
  formatPhoneNumber,
  isEmail
} from "@/services/auth";

export const loginWithOTP = async (
  contact: string,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
  setIsLoading(true);
  try {
    console.log("Attempting login with contact:", contact);
    await sendOTP(contact);
    toast.success("Код подтверждения отправлен", {
      description: isEmail(contact)
        ? "Пожалуйста, проверьте вашу почту"
        : "Пожалуйста, введите полученный SMS-код"
    });
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Не удалось войти';
    toast.error(errorMessage);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

export const verifyUserOTP = async (
  contact: string,
  otp: string,
  setCurrentUser: (user: User) => void,
  setUserRole: (role: "USER" | "PARTNER" | "ADMIN" | null) => void,
  setIsLoading: (loading: boolean) => void
): Promise<User> => {
  setIsLoading(true);
  try {
    const supabaseUser = await verifyOTPCode(contact, otp);
    const userData: Record<string, string> = {};
    if (isEmail(contact)) userData.email = contact;
    else userData.phone = formatPhoneNumber(contact);
    const pendingName = localStorage.getItem('pendingRegistrationName');
    if (pendingName) {
      userData.name = pendingName;
      localStorage.removeItem('pendingRegistrationName');
    }
    const user = await getUserOrCreate(supabaseUser.id, userData);
    setCurrentUser(user);
    setUserRole(user.role);
    return user;
  } catch (error) {
    console.error("Error during verification process:", error);
    const errorMessage = error instanceof Error ? error.message : 'Неверный код';
    toast.error(errorMessage);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

export const registerUser = async (
  name: string,
  contact: string,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
  setIsLoading(true);
  try {
    await sendOTP(contact);
    localStorage.setItem('pendingRegistrationName', name);
    toast.success("Код подтверждения отправлен", {
      description: isEmail(contact)
        ? "Пожалуйста, проверьте вашу почту"
        : "Пожалуйста, введите полученный SMS-код для завершения регистрации"
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';
    toast.error(errorMessage);
    throw error;
  } finally {
    setIsLoading(false);
  }
};
