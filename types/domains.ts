export type DomainStatus = 'pending' | 'verifying' | 'verified' | 'failed'

export interface CustomDomain {
  id: string
  workspace_id: string
  domain: string
  verification_token: string
  status: DomainStatus
  verification_error: string | null
  verified_at: string | null
  created_at: string | null // ✅ FIXED: Allows null
  updated_at: string | null // ✅ FIXED: Allows null
  created_by: string | null
}

export const DOMAIN_STATUS_LABELS: Record<DomainStatus, string> = {
  pending: 'Pending verification',
  verifying: 'Verifying…',
  verified: 'Verified',
  failed: 'Verification failed',
}

export const DOMAIN_STATUS_COLORS: Record<DomainStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  verifying: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  verified: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  failed: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

/**
 * Extract the base domain (strip subdomain if it's a common host like www).
 * Example: "www.myrestaurant.com" → "myrestaurant.com"
 *          "go.myrestaurant.com" → "go.myrestaurant.com" (kept as-is)
 */
export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/\.$/, '')
}

/**
 * Basic domain validation. Accepts "myrestaurant.com", "go.myrestaurant.com".
 * Rejects "localhost", IPs, and domains without a dot.
 */
export function isValidDomain(domain: string): { valid: boolean; reason?: string } {
  if (!domain) return { valid: false, reason: 'Domain is required' }
  if (domain.length > 253) return { valid: false, reason: 'Domain too long' }
  if (domain === 'localhost') return { valid: false, reason: 'localhost is not allowed' }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
    return { valid: false, reason: 'IP addresses are not allowed' }
  }
  if (!domain.includes('.')) {
    return { valid: false, reason: 'Must include a TLD (e.g., .com)' }
  }
  if (domain.startsWith('scanflow') || domain.startsWith('www.scanflow')) {
    return { valid: false, reason: 'This domain is reserved' }
  }
  // Basic DNS label check
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return { valid: false, reason: 'Invalid domain format' }
  }
  return { valid: true }
}

/**
 * The DNS record the user needs to add.
 */
export interface DnsRecord {
  type: 'CNAME'
  host: string
  value: string
  ttl: 'Auto' | '300' | '3600'
}

/**
 * Get the CNAME target our infrastructure expects.
 * In production this is what your deployment platform (Vercel/Cloudflare)
 * gives you for domain verification.
 */
export function getExpectedCnameTarget(): string {
  return process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME || 'cname.scanflow.app'
}

export function getDnsRecordForDomain(domain: string): DnsRecord {
  // For a bare domain "myrestaurant.com", user typically uses "www" or root CNAME
  // For subdomain "go.myrestaurant.com", host is "go"
  const isSubdomain = domain.split('.').length > 2
  const host = isSubdomain ? domain.split('.')[0] : '@'
  return {
    type: 'CNAME',
    host,
    value: getExpectedCnameTarget(),
    ttl: 'Auto',
  }
}