
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// Функция для выхода из системы
export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    toast.info('Вы вышли из системы');
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
