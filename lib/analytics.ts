// lib/analytics.ts
// ⚠️ CLIENT-SAFE ONLY. Do not import supabase or next/headers here.

export type Granularity = 'day' | 'week' | 'month'

export interface ScanPoint {
  bucket: string
  scans: number
}

export interface ScanSummary {
  total: number
  today: number
  week: number
  month: number
}

export interface TopQrCode {
  id: string
  name: string
  slug: string
  scans: number
}

export interface DeviceBreakdown {
  device_type: string
  scans: number
}

export interface CountryBreakdown {
  country_code: string
  scans: number
}

export interface RecentScan {
  id: string
  qr_code_id: string
  qr_code_name: string
  scanned_at: string
  device_type: string | null
  country_code: string | null
  referrer_domain: string | null
}

export interface TrendData {
  current: number
  previous: number
  delta: number
  deltaPercent: number
  direction: 'up' | 'down' | 'flat'
}

// ============================================================
// Utility: Fill missing days in the time series
// ============================================================
export function fillMissingDays(
  points: ScanPoint[],
  days: number
): ScanPoint[] {
  const map = new Map<string, number>()
  points.forEach((p) => {
    const key = p.bucket.slice(0, 10)
    map.set(key, p.scans)
  })

  const result: ScanPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({
      bucket: key,
      scans: map.get(key) ?? 0,
    })
  }

  return result
}

// ============================================================
// Utility: Country code → name
// ============================================================
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  IN: 'India',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  CA: 'Canada',
  AU: 'Australia',
  AE: 'United Arab Emirates',
  SG: 'Singapore',
  BR: 'Brazil',
  JP: 'Japan',
  KR: 'South Korea',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  Unknown: 'Unknown',
}

export function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code
}

export function countryFlag(code: string): string {
  if (!code || code === 'Unknown' || code.length !== 2) return '🌍'
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((c) => 127397 + c.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// ============================================================
// Utility: Device labels
// ============================================================
const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
  smarttv: 'Smart TV',
  console: 'Console',
  wearable: 'Wearable',
  unknown: 'Unknown',
}

export function deviceLabel(type: string): string {
  return DEVICE_LABELS[type] ?? type
}

// ============================================================
// Trend comparison (pure)
// ============================================================
export function computeTrend(current: number, previous: number): TrendData {
  const delta = current - previous
  const deltaPercent =
    previous === 0 ? (current > 0 ? 100 : 0) : (delta / previous) * 100

  return {
    current,
    previous,
    delta,
    deltaPercent: Math.round(deltaPercent * 10) / 10,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
  }
}