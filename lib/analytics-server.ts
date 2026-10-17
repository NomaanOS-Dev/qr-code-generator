// lib/analytics-server.ts
// ⚠️ SERVER ONLY. Importing this from a 'use client' file will fail the build.
import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type {
  CountryBreakdown,
  DeviceBreakdown,
  Granularity,
  RecentScan,
  ScanPoint,
  ScanSummary,
  TopQrCode,
} from '@/lib/analytics'

// ============================================================
// Fetch: Scans over time (daily/weekly/monthly)
// ============================================================
export async function getScansOverTime(params: {
  userId: string
  qrCodeId?: string | null
  workspaceId?: string | null
  days?: number
  granularity?: Granularity
}): Promise<ScanPoint[]> {
  const supabase = await createClient()
  const {
    userId,
    qrCodeId = null,
    workspaceId = null,
    days = 30,
    granularity = 'day',
  } = params

  const { data, error } = await supabase.rpc('get_scans_over_time', {
    p_user_id: userId,
    p_workspace_id: workspaceId ?? undefined,
    p_qr_code_id: qrCodeId ?? undefined,
    p_days: days,
    p_granularity: granularity,
  })

  if (error) {
    console.error('[analytics] getScansOverTime error:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    bucket: row.bucket as string,
    scans: Number(row.scans ?? 0),
  }))
}

// ============================================================
// Fetch: Summary (total, today, week, month)
// ============================================================
export async function getScanSummary(params: {
  userId: string
  qrCodeId?: string | null
  workspaceId?: string | null
}): Promise<ScanSummary> {
  const supabase = await createClient()
  const { userId, qrCodeId = null, workspaceId = null } = params

  const { data, error } = await supabase.rpc('get_scan_summary', {
    p_user_id: userId,
    p_workspace_id: workspaceId ?? undefined,
    p_qr_code_id: qrCodeId ?? undefined,
  })

  if (error || !data || data.length === 0) {
    console.error('[analytics] getScanSummary error:', error)
    return { total: 0, today: 0, week: 0, month: 0 }
  }

  const row = data[0]
  return {
    total: Number(row.total ?? 0),
    today: Number(row.today ?? 0),
    week: Number(row.week ?? 0),
    month: Number(row.month ?? 0),
  }
}

// ============================================================
// Fetch: Top QR codes by scans
// ============================================================
export async function getTopQrCodes(params: {
  userId: string
  workspaceId?: string | null
  limit?: number
}): Promise<TopQrCode[]> {
  const supabase = await createClient()
  const { userId, workspaceId = null, limit = 5 } = params

  const { data, error } = await supabase.rpc('get_top_qr_codes', {
    p_user_id: userId,
    p_workspace_id: workspaceId ?? undefined,
    p_limit: limit,
  })

  if (error) {
    console.error('[analytics] getTopQrCodes error:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    scans: Number(row.scans ?? 0),
  }))
}

// ============================================================
// Fetch: Device breakdown
// ============================================================
export async function getDeviceBreakdown(params: {
  userId: string
  qrCodeId?: string | null
  workspaceId?: string | null
  days?: number
}): Promise<DeviceBreakdown[]> {
  const supabase = await createClient()
  const {
    userId,
    qrCodeId = null,
    workspaceId = null,
    days = 30,
  } = params

  const { data, error } = await supabase.rpc('get_device_breakdown', {
    p_user_id: userId,
    p_workspace_id: workspaceId ?? undefined,
    p_qr_code_id: qrCodeId ?? undefined,
    p_days: days,
  })

  if (error) {
    console.error('[analytics] getDeviceBreakdown error:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    device_type: (row.device_type as string) ?? 'unknown',
    scans: Number(row.scans ?? 0),
  }))
}

// ============================================================
// Fetch: Country breakdown
// ============================================================
export async function getCountryBreakdown(params: {
  userId: string
  qrCodeId?: string | null
  workspaceId?: string | null
  days?: number
  limit?: number
}): Promise<CountryBreakdown[]> {
  const supabase = await createClient()
  const {
    userId,
    qrCodeId = null,
    workspaceId = null,
    days = 30,
    limit = 10,
  } = params

  const { data, error } = await supabase.rpc('get_country_breakdown', {
    p_user_id: userId,
    p_workspace_id: workspaceId ?? undefined,
    p_qr_code_id: qrCodeId ?? undefined,
    p_days: days,
    p_limit: limit,
  })

  if (error) {
    console.error('[analytics] getCountryBreakdown error:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    country_code: (row.country_code as string) ?? 'Unknown',
    scans: Number(row.scans ?? 0),
  }))
}

// ============================================================
// Fetch: Recent scans
// ============================================================
export async function getRecentScans(params: {
  userId: string
  qrCodeId?: string | null
  workspaceId?: string | null
  limit?: number
}): Promise<RecentScan[]> {
  const supabase = await createClient()
  const {
    userId,
    qrCodeId = null,
    workspaceId = null,
    limit = 10,
  } = params

  const { data, error } = await supabase.rpc('get_recent_scans', {
    p_user_id: userId,
    p_workspace_id: workspaceId ?? undefined,
    p_qr_code_id: qrCodeId ?? undefined,
    p_limit: limit,
  })

  if (error) {
    console.error('[analytics] getRecentScans error:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    qr_code_id: row.qr_code_id as string,
    qr_code_name: row.qr_code_name as string,
    scanned_at: row.scanned_at as string,
    device_type: row.device_type as string | null,
    country_code: row.country_code as string | null,
    referrer_domain: row.referrer_domain as string | null,
  }))
}

// ============================================================
// Fetch: Scans in a range (for trends)
// ============================================================
export async function getScansInRange(params: {
  userId: string
  qrCodeId?: string | null
  workspaceId?: string | null
  startDate: string
  endDate: string
}): Promise<number> {
  const supabase = await createClient()
  const { userId, qrCodeId = null, workspaceId = null } = params

  const { data, error } = await supabase.rpc('get_scan_summary', {
    p_user_id: userId,
    p_workspace_id: workspaceId ?? undefined,
    p_qr_code_id: qrCodeId ?? undefined,
  })

  if (error || !data || data.length === 0) {
    return 0
  }

  return Number(data[0].total ?? 0)
}