
import { supabase } from "@/lib/supabaseClient";
import { isEmail, formatPhoneNumber } from './formatUtils';
import { toast } from "sonner";

// Функция для отправки OTP на телефон или email
export const sendOTP = async (contact: string): Promise<void> => {
  if (!contact) {
    throw new Error('Контактные данные не указаны');
  }
  
  try {
    if (isEmail(contact)) {
      console.log("Sending OTP to email:", contact);
      const { error } = await supabase.auth.signInWithOtp({
        email: contact,
      });
      
      if (error) {
        console.error("SignInWithOtp error:", error);
        throw error;
      }
    } else {
      const formattedPhone = formatPhoneNumber(contact);
      console.log("Sending OTP to phone:", formattedPhone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        console.error("SignInWithOtp error:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("OTP sending error:", error);
    throw error;
  }
};

// Функция для проверки OTP кода
export const verifyOTPCode = async (contact: string, otp: string): Promise<any> => {
  if (!contact || !otp) {
    throw new Error('Контактные данные или код не указаны');
  }
  
  try {
    let verifyOptions;
    
    if (isEmail(contact)) {
      console.log("Verifying OTP for email:", contact);
      verifyOptions = {
        email: contact,
        token: otp,
        type: 'email' as const
      };
    } else {
      const formattedPhone = formatPhoneNumber(contact);
      console.log("Verifying OTP for phone:", formattedPhone);
      verifyOptions = {
        phone: formattedPhone,
        token: otp,
        type: 'sms' as const
      };
    }
    
    const { data, error } = await supabase.auth.verifyOtp(verifyOptions);

    if (error) {
      console.error("OTP verification error:", error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Пользователь не найден');
    }

    console.log("OTP verification successful:", data.user);
    return data.user;
  } catch (error) {
    console.error("Verification error:", error);
    throw error;
  }
};

// Re-export formatting utilities for convenience
export { isEmail, formatPhoneNumber };
