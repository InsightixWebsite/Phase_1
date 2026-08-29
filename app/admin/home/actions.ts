'use server'

import { revalidatePath } from 'next/cache'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { homeContentSchema, type HomeContentInput } from '@/lib/schemas'

export async function updateHomeContent(input: HomeContentInput): Promise<{ error?: string }> {
  const parsed = homeContentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase
    .from('home_content')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', true)

  if (error) return { error: error.message }
  revalidatePath('/')
  return {}
}
