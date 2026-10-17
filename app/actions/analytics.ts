'use server'

import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'

export async function exportScansCsv(params: {
  qrCodeId?: string | null
  days?: number
}): Promise<{ error?: string; csv?: string; filename?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan: Plan = (subscription?.plan as Plan) || 'free'
  if (!PLAN_LIMITS[plan].csvExport) {
    return {
      error:
        'CSV export is only available on Pro and Agency plans. Please upgrade.',
    }
  }

  const { qrCodeId = null, days = 30 } = params

  const since = new Date()
  since.setDate(since.getDate() - days)

  let query = supabase
    .from('qr_scans')
    .select(
      `
      id,
      scanned_at,
      device_type,
      country_code,
      referrer_domain,
      qr_codes!inner (id, name, slug, user_id)
    `
    )
    .eq('qr_codes.user_id', user.id)
    .gte('scanned_at', since.toISOString())
    .order('scanned_at', { ascending: false })
    .limit(10000)

  if (qrCodeId) {
    query = query.eq('qr_code_id', qrCodeId)
  }

  const { data, error } = await query
  if (error) return { error: error.message }

  const headers = [
    'scan_id',
    'qr_code_name',
    'qr_slug',
    'scanned_at',
    'device_type',
    'country_code',
    'referrer_domain',
  ]

  const rows = (data ?? []).map((scan) => {
    const qr = Array.isArray(scan.qr_codes)
      ? scan.qr_codes[0]
      : scan.qr_codes
    return [
      scan.id,
      csvEscape(qr?.name ?? ''),
      csvEscape(qr?.slug ?? ''),
      scan.scanned_at,
      scan.device_type ?? '',
      scan.country_code ?? '',
      scan.referrer_domain ?? '',
    ]
  })

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  const filename = `scanflow-scans-${
    qrCodeId ? 'single-' : ''
  }${new Date().toISOString().slice(0, 10)}.csv`

  return { csv, filename }
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}