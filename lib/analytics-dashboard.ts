import 'server-only'
import {
  getScansOverTime,
  getScanSummary,
  getTopQrCodes,
  getDeviceBreakdown,
  getCountryBreakdown,
  getRecentScans,
} from '@/lib/analytics-server'
import {
  fillMissingDays,
  computeTrend,
  type ScanPoint,
  type ScanSummary,
  type TopQrCode,
  type DeviceBreakdown,
  type CountryBreakdown,
  type RecentScan,
  type TrendData,
} from '@/lib/analytics'

export interface DashboardAnalytics {
  summary: ScanSummary
  timeSeries: ScanPoint[]
  topCodes: TopQrCode[]
  devices: DeviceBreakdown[]
  countries: CountryBreakdown[]
  recent: RecentScan[]
  trend: TrendData
  days: number
}

/**
 * Global analytics for a workspace (dashboard overview).
 */
export async function getDashboardAnalytics(
  userId: string,
  workspaceId: string,
  days: number = 30
): Promise<DashboardAnalytics> {
  const [
    summary,
    rawTimeSeries,
    topCodes,
    devices,
    countries,
    recent,
    prevRaw,
  ] = await Promise.all([
    getScanSummary({ userId, workspaceId }),
    getScansOverTime({ userId, workspaceId, days, granularity: 'day' }),
    getTopQrCodes({ userId, workspaceId, limit: 5 }),
    getDeviceBreakdown({ userId, workspaceId, days }),
    getCountryBreakdown({ userId, workspaceId, days, limit: 8 }),
    getRecentScans({ userId, workspaceId, limit: 10 }),
    getScansOverTime({
      userId,
      workspaceId,
      days: days * 2,
      granularity: 'day',
    }),
  ])

  const currentTotal = rawTimeSeries.reduce((s, p) => s + p.scans, 0)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const prevTotal = prevRaw
    .filter((p) => new Date(p.bucket).getTime() < cutoff.getTime())
    .reduce((s, p) => s + p.scans, 0)

  return {
    summary,
    timeSeries: fillMissingDays(rawTimeSeries, days),
    topCodes,
    devices,
    countries,
    recent,
    trend: computeTrend(currentTotal, prevTotal),
    days,
  }
}

/**
 * Per-QR analytics.
 */
export async function getSingleQrAnalytics(
  userId: string,
  workspaceId: string,
  qrCodeId: string,
  days: number = 30
): Promise<DashboardAnalytics> {
  const [
    summary,
    rawTimeSeries,
    devices,
    countries,
    recent,
    prevRaw,
  ] = await Promise.all([
    getScanSummary({ userId, workspaceId, qrCodeId }),
    getScansOverTime({ userId, workspaceId, qrCodeId, days, granularity: 'day' }),
    getDeviceBreakdown({ userId, workspaceId, qrCodeId, days }),
    getCountryBreakdown({ userId, workspaceId, qrCodeId, days, limit: 8 }),
    getRecentScans({ userId, workspaceId, qrCodeId, limit: 10 }),
    getScansOverTime({
      userId,
      workspaceId,
      qrCodeId,
      days: days * 2,
      granularity: 'day',
    }),
  ])

  const currentTotal = rawTimeSeries.reduce((s, p) => s + p.scans, 0)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const prevTotal = prevRaw
    .filter((p) => new Date(p.bucket).getTime() < cutoff.getTime())
    .reduce((s, p) => s + p.scans, 0)

  return {
    summary,
    timeSeries: fillMissingDays(rawTimeSeries, days),
    topCodes: [],
    devices,
    countries,
    recent,
    trend: computeTrend(currentTotal, prevTotal),
    days,
  }
}