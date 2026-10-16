'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { validateDestinationUrl } from '@/lib/validate-url'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'

export async function createQrCode(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  // 1. Validate input
  const name = (formData.get('name') as string)?.trim()
  const destinationUrl = (formData.get('destination_url') as string)?.trim()
  const foregroundColor = (formData.get('foreground_color') as string) || '#000000'
  const backgroundColor = (formData.get('background_color') as string) || '#FFFFFF'
  const logoPath = (formData.get('logo_path') as string) || null

  if (!name || name.length < 2) {
    return { error: 'Name must be at least 2 characters' }
  }

  if (!destinationUrl) {
    return { error: 'Destination URL is required' }
  }

  const validation = validateDestinationUrl(destinationUrl)
  if (!validation.valid) {
    return { error: validation.reason }
  }

  // 2. Check plan limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single()

  const plan: Plan = (subscription?.plan as Plan) || 'free'
  const limits = PLAN_LIMITS[plan]

  const { count } = await supabase
    .from('qr_codes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= limits.maxQrCodes) {
    return {
      error: `You've reached the ${plan} plan limit (${limits.maxQrCodes} QR codes). Please upgrade to create more.`,
    }
  }

  // 3. Generate unique slug
  const slug = nanoid(8)

  // 4. Insert
  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      user_id: user.id,
      slug,
      name,
      destination_url: destinationUrl,
      foreground_color: foregroundColor,
      background_color: backgroundColor,
      logo_path: logoPath,
    })
    .select('id, slug')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, id: data.id, slug: data.slug }
}