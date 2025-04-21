'use server'

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function addFoodFromSuggestion({
  name,
  grams,
  period
}: {
  name: string;
  grams: number;
  period: string;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("food_items").insert([{
      name,
      grams,
      period,
      is_completed: false,
      user_id: user?.id,
    }]);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error adding food item:", error);
    return { success: false, error: "Failed to add food item" };
  }
} 