"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function quickAddFood(formData: FormData) {
  const cookieStore = cookies();

  const supabase = await createClient(cookieStore);
  const { data: user } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  const grams = formData.get("grams") || undefined;
  const unit = formData.get("unit") || undefined;
  const period = formData.get("period") as string;

  const { error } = await supabase.from("food_items").insert([
    {
      name,
      grams,
      unit,
      period,
      user_id: user.user?.id,
    },
  ]);

  if (error) throw error;

  revalidatePath("/tracker");
  return { success: true };
}

export async function updateFood(id: string, updates: { 
  name?: string; 
  grams?: number | null; 
  unit?: string | null 
}) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: user } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("food_items")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.user?.id);

  if (error) throw error;

  revalidatePath("/tracker");
  return { success: true };
}

export async function toggleFoodCompletion(id: string, isCompleted: boolean) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: user } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("food_items")
    .update({ is_completed: !isCompleted })
    .eq("id", id)
    .eq("user_id", user.user?.id);

  if (error) throw error;

  revalidatePath("/tracker");
  return { success: true };
}

export async function deleteFood(id: string) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: user } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("food_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.user?.id);

  if (error) throw error;

  revalidatePath("/tracker");
  return { success: true };
}
