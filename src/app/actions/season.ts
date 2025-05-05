"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function startSeason({ type, date }: { type: "cutting" | "bulking"; date: string }) {
  const supabase = createClient(cookies());
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated" };
  }
  // Only allow one open season of each type
  const { data: openSeasons } = await supabase
    .from("seasons")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", type)
    .is("ended_at", null);
  if (openSeasons && openSeasons.length > 0) {
    return { error: `You already have an open ${type} season.` };
  }
  const { error } = await supabase.from("seasons").insert({
    user_id: user.id,
    type,
    started_at: date,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function endSeason({ type }: { type: "cutting" | "bulking" }) {
  const supabase = createClient(cookies());
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated" };
  }
  // Find latest open season
  const { data: openSeason, error: fetchError } = await supabase
    .from("seasons")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", type)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (fetchError || !openSeason) {
    return { error: `No open ${type} season to end.` };
  }
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from("seasons")
    .update({ ended_at: today })
    .eq("id", openSeason.id);
  if (error) return { error: error.message };
  return { success: true, endDate: today };
}

export async function getSeasons() {
  const supabase = createClient(cookies());
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { seasons: [] };
  }
  const { data, error } = await supabase
    .from("seasons")
    .select("id, type, started_at, ended_at")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });
  if (error) return { seasons: [] };
  return { seasons: data };
} 