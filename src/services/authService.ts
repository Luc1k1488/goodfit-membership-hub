
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/types";
import { toast } from "sonner";

// Helper function to check if input is an email or phone number
export const isEmail = (input: string): boolean => {
  return input && typeof input === 'string' && input.includes('@');
};

// Функция для форматирования телефонного номера в формат E.164
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Удаляем все нецифровые символы
  const digits = phone.replace(/\D/g, '');
  
  // Проверяем начало номера и форматируем для России
  if (digits.startsWith('7') || digits.startsWith('8')) {
    return `+7${digits.substring(1)}`;
  } else if (!digits.startsWith('+')) {
    return `+7${digits}`;
  }
  
  return phone;
};

// Функция для отправки OTP на телефон или email
export const sendOTP = async (contact: string): Promise<void> => {
  if (!contact) {
    throw new Error('Контактные данные не указаны');
  }
  
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
    try {
      const formattedPhone = formatPhoneNumber(contact);
      console.log("Sending OTP to phone:", formattedPhone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        console.error("SignInWithOtp error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Phone OTP error:", error);
      throw error;
    }
  }
  
  return;
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

// Функция для создания или получения пользователя из базы данных
export const getUserOrCreate = async (userId: string, userData: {
  name?: string;
  phone?: string;
  email?: string;
}): Promise<User> => {
  if (!userId) {
    throw new Error('Идентификатор пользователя не указан');
  }
  
  console.log("Getting or creating user with ID:", userId, "userData:", userData);
  
  try {
    // Проверяем, существует ли пользователь в базе данных
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // Если пользователь существует, обновляем данные, которые могли измениться
    if (!userError && existingUser) {
      console.log("User found in database:", existingUser);
      
      // Check if we need to update any user data
      const updateData: Record<string, any> = {};
      let needsUpdate = false;
      
      // If user has no phone but we have one, update it
      if (!existingUser.phone && userData.phone) {
        updateData.phone = userData.phone;
        needsUpdate = true;
      }
      
      // If user has no email but we have one, update it
      if (!existingUser.email && userData.email) {
        updateData.email = userData.email;
        needsUpdate = true;
      }
      
      // If we have a name and the existing one is empty, update it
      if (userData.name && (!existingUser.name || existingUser.name.trim() === '')) {
        updateData.name = userData.name;
        needsUpdate = true;
      }
      
      // If we need to update user data
      if (needsUpdate) {
        console.log("Updating existing user data with:", updateData);
        const { error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId);
          
        if (updateError) {
          console.error("Error updating user data:", updateError);
        }
      }

      // Создаем объект пользователя из данных БД с правильными значениями по умолчанию
      const user: User = {
        id: existingUser.id,
        name: existingUser.name || userData.name || '',
        email: existingUser.email || userData.email || '',
        phone: existingUser.phone || userData.phone || '',
        role: (existingUser.role || 'USER') as "USER" | "PARTNER" | "ADMIN",
        createdAt: existingUser.created_at,
        profileImage: existingUser.profile_image || '/placeholder.svg',
        subscriptionId: existingUser.subscription_id || null
      };

      return user;
    }

    // Если пользователь не существует, создаем новую запись
    console.log("User not found in database, creating new user with data:", userData);
    
    // Создаем нового пользователя с ролью USER по умолчанию
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          name: userData.name || '',
          phone: userData.phone || '',
          email: userData.email || '',
          role: 'USER',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error("Error creating new user:", createError);
      
      // Попробуем еще раз получить пользователя, на случай если он был создан, но произошла ошибка
      const { data: retryUser, error: retryError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (retryError || !retryUser) {
        throw createError;
      }
      
      console.log("Successfully retrieved user on retry:", retryUser);
      
      const user: User = {
        id: retryUser.id,
        name: retryUser.name || '',
        email: retryUser.email || '',
        phone: retryUser.phone || '',
        role: (retryUser.role || 'USER') as "USER" | "PARTNER" | "ADMIN",
        createdAt: retryUser.created_at,
        profileImage: retryUser.profile_image || '/placeholder.svg',
        subscriptionId: retryUser.subscription_id || null
      };

      return user;
    }

    if (!newUser) {
      throw new Error('Не удалось создать пользователя');
    }

    console.log("New user created successfully:", newUser);

    const user: User = {
      id: newUser.id,
      name: newUser.name || '',
      email: newUser.email || '',
      phone: newUser.phone || '',
      role: (newUser.role || 'USER') as "USER" | "PARTNER" | "ADMIN",
      createdAt: newUser.created_at,
      profileImage: newUser.profile_image || '/placeholder.svg',
      subscriptionId: newUser.subscription_id || null
    };

    return user;
  } catch (error) {
    console.error("Error in getUserOrCreate:", error);
    throw error;
  }
};

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

// Функция для получения текущей сессии пользователя
export const getCurrentUserSession = async (): Promise<{
  session: any;
  user: User | null;
}> => {
  try {
    console.log("Checking current user session...");
    // Получаем текущую сессию пользователя из Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session:", sessionError);
      return { session: null, user: null };
    }
    
    if (!session) {
      console.log("No active session found");
      return { session: null, user: null };
    }
    
    console.log("Active session found:", session.user.id);
    
    try {
      // Получаем данные пользователя из базы данных
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.log("User not found in database, creating user entry");
        
        // User authenticated but not in users table - create entry with available data
        const authUser = session.user;
        const newUserData: Record<string, string> = {};
        
        if (authUser.email) {
          newUserData.email = authUser.email;
        }
        
        if (authUser.phone) {
          newUserData.phone = authUser.phone;
        }
        
        try {
          const user = await getUserOrCreate(authUser.id, newUserData);
          return { session, user };
        } catch (createError) {
          console.error("Failed to create missing user:", createError);
          return { session, user: null };
        }
      }

      if (userData) {
        // Преобразуем данные пользователя из базы данных в формат приложения
        const user: User = {
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: (userData.role || 'USER') as "USER" | "PARTNER" | "ADMIN",
          createdAt: userData.created_at,
          profileImage: userData.profile_image || '/placeholder.svg',
          subscriptionId: userData.subscription_id || null
        };

        console.log("User data retrieved:", user);
        return { session, user };
      }
      
      console.log("User data not found in the database");
      return { session, user: null };
    } catch (error) {
      console.error("Error getting user data:", error);
      return { session, user: null };
    }
  } catch (error) {
    console.error("Error in getCurrentUserSession:", error);
    return { session: null, user: null };
  }
};
