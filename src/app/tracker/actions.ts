'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getFoodItems() {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
      }
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { data: foods } = await supabase
    .from('food_items')
    .select('*')
    .order('created_at', { ascending: true })

  return {
    foods: foods || [],
    userEmail: session?.user.email
  }
} 