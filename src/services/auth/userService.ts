import { supabase } from "@/lib/supabaseClient";
import { User } from "@/types";
import { isEmail, formatPhoneNumber } from "./formatUtils";

export const getUserOrCreate = async (
  userId: string,
  userData: {
    name?: string;
    phone?: string;
    email?: string;
  }
): Promise<User> => {
  if (!userId) throw new Error("User ID is required");

  console.log("▶️ getUserOrCreate → userId:", userId, "userData:", userData);

  try {
    // Шаг 1: Поиск по ID
    const { data: userById, error: errorById } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userById && !errorById) {
      console.log("✅ Found user by ID:", userById);
      return buildUser(userById, userData);
    }

    // Шаг 2: Поиск по email
    if (userData.email) {
      const { data: userByEmail, error: errorByEmail } = await supabase
        .from("users")
        .select("*")
        .eq("email", userData.email)
        .single();

      if (userByEmail && !errorByEmail) {
        console.log("✅ Found user by email:", userByEmail);

        if (userByEmail.id !== userId) {
          console.log(`🔁 Updating ID from ${userByEmail.id} to ${userId}`);
          await supabase.from("users").update({ id: userId }).eq("id", userByEmail.id);
        }

        await updateMissingFields(userId, userByEmail, userData);
        return buildUser({ ...userByEmail, id: userId }, userData);
      }
    }

    // Шаг 3: Создание нового пользователя
    console.log("🆕 Creating new user:", userData);

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: "USER",
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError || !newUser) {
      console.error("❌ Failed to insert user:", insertError);
      throw insertError;
    }

    console.log("✅ User created:", newUser);
    return buildUser(newUser, userData);
  } catch (err) {
    console.error("❌ getUserOrCreate error:", err);
    throw err;
  }
};

// Вспомогательная функция для формирования объекта пользователя
const buildUser = (row: any, fallback: Partial<User>): User => ({
  id: row.id,
  name: row.name || fallback.name || "",
  email: row.email || fallback.email || "",
  phone: row.phone || fallback.phone || "",
  role: (row.role || "USER") as "USER" | "PARTNER" | "ADMIN",
  createdAt: row.created_at,
  profileImage: row.profile_image || "/placeholder.svg",
  subscriptionId: row.subscription_id || null
});

// Обновление недостающих полей
const updateMissingFields = async (id: string, existing: any, provided: any) => {
  const updates: Record<string, any> = {};
  let shouldUpdate = false;

  if (!existing.phone && provided.phone) {
    updates.phone = provided.phone;
    shouldUpdate = true;
  }

  if (!existing.name && provided.name) {
    updates.name = provided.name;
    shouldUpdate = true;
  }

  if (shouldUpdate) {
    console.log("🛠 Updating user fields:", updates);
    await supabase.from("users").update(updates).eq("id", id);
  }
};
