
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/types";
import { isEmail, formatPhoneNumber } from "./formatUtils";

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
    // Шаг 1: Проверяем, существует ли пользователь с таким ID в базе данных
    const { data: existingUserById, error: userIdError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // Если пользователь с таким ID существует, обновляем данные и возвращаем
    if (!userIdError && existingUserById) {
      console.log("User found in database by ID:", existingUserById);
      
      // Check if we need to update any user data
      const updateData: Record<string, any> = {};
      let needsUpdate = false;
      
      // If user has no phone but we have one, update it
      if (!existingUserById.phone && userData.phone) {
        updateData.phone = userData.phone;
        needsUpdate = true;
      }
      
      // If user has no email but we have one, update it
      if (!existingUserById.email && userData.email) {
        updateData.email = userData.email;
        needsUpdate = true;
      }
      
      // If we have a name and the existing one is empty, update it
      if (userData.name && (!existingUserById.name || existingUserById.name.trim() === '')) {
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
        id: existingUserById.id,
        name: existingUserById.name || userData.name || '',
        email: existingUserById.email || userData.email || '',
        phone: existingUserById.phone || userData.phone || '',
        role: (existingUserById.role || 'USER') as "USER" | "PARTNER" | "ADMIN",
        createdAt: existingUserById.created_at,
        profileImage: existingUserById.profile_image || '/placeholder.svg',
        subscriptionId: existingUserById.subscription_id || null
      };

      return user;
    }

    // Шаг 2: Если пользователь с таким ID не найден, но у нас есть email, ищем по email
    if (userData.email) {
      const { data: existingUserByEmail, error: userEmailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.email)
        .single();

      if (!userEmailError && existingUserByEmail) {
        console.log("User found in database by email:", existingUserByEmail);
        
        // Важное решение: если пользователь найден по email, но с другим ID, 
        // обновляем ID в базе данных на новый от auth
        const { error: updateIdError } = await supabase
          .from('users')
          .update({ id: userId })
          .eq('id', existingUserByEmail.id);
          
        if (updateIdError) {
          console.error("Error updating user ID:", updateIdError);
        } else {
          console.log(`Updated user ID from ${existingUserByEmail.id} to ${userId}`);
        }
        
        // Обновляем другие данные, если необходимо
        const updateData: Record<string, any> = { id: userId };
        let needsUpdate = false;
        
        if (!existingUserByEmail.phone && userData.phone) {
          updateData.phone = userData.phone;
          needsUpdate = true;
        }
        
        if (userData.name && (!existingUserByEmail.name || existingUserByEmail.name.trim() === '')) {
          updateData.name = userData.name;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          console.log("Updating existing user data with:", updateData);
          const { error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', existingUserByEmail.id);
            
          if (updateError) {
            console.error("Error updating user data:", updateError);
          }
        }

        const user: User = {
          id: userId, // Используем новый ID
          name: existingUserByEmail.name || userData.name || '',
          email: existingUserByEmail.email || userData.email || '',
          phone: existingUserByEmail.phone || userData.phone || '',
          role: (existingUserByEmail.role || 'USER') as "USER" | "PARTNER" | "ADMIN",
          createdAt: existingUserByEmail.created_at,
          profileImage: existingUserByEmail.profile_image || '/placeholder.svg',
          subscriptionId: existingUserByEmail.subscription_id || null
        };

        return user;
      }
    }

    // Шаг 3: Если пользователь не существует ни по ID, ни по email, создаем новую запись
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
        console.log("Error fetching user data:", userError.message);
        
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

      if (!userData) {
        console.log("No user data found for ID:", session.user.id);
        // Try to create user
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
    } catch (error) {
      console.error("Error getting user data:", error);
      return { session, user: null };
    }
  } catch (error) {
    console.error("Error in getCurrentUserSession:", error);
    return { session: null, user: null };
  }
};
