"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }

  return true;
}

export async function signup(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  revalidatePath("/");
  redirect("/auth/login");
} 