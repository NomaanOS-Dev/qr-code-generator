import 'server-only'
import { promises as dns } from 'dns'
import { getExpectedCnameTarget, normalizeDomain } from '@/types/domains'

export interface VerificationResult {
  verified: boolean
  records: string[]
  error?: string
  expectedTarget: string
}

/**
 * Verify that a domain's CNAME points to our infrastructure target.
 * Returns the actual DNS records found so the UI can display what's wrong.
 */
export async function verifyDomainCname(domain: string): Promise<VerificationResult> {
  const normalized = normalizeDomain(domain)
  const expectedTarget = getExpectedCnameTarget()

  try {
    // 1. Try CNAME (subdomains)
    let records: string[] = []
    try {
      records = await dns.resolveCname(normalized)
    } catch (cnameErr) {
      // 2. Fall back to A records (some providers only support A records for root)
      try {
        const aRecords = await dns.resolve4(normalized)
        records = aRecords
      } catch {
        // Neither CNAME nor A resolved
        return {
          verified: false,
          records: [],
          error: 'DNS records not found. Have you added the CNAME record and waited for propagation? (Usually 5-60 minutes)',
          expectedTarget,
        }
      }
    }

    // Check if any record matches our target
    const matches = records.some(
      (r) =>
        r.toLowerCase() === expectedTarget.toLowerCase() ||
        // Allow target with trailing dot
        r.toLowerCase().replace(/\.$/, '') ===
          expectedTarget.toLowerCase().replace(/\.$/, '')
    )

    if (matches) {
      return { verified: true, records, expectedTarget }
    }

    return {
      verified: false,
      records,
      error: `DNS points to ${records.join(', ')} but should point to ${expectedTarget}. Update your CNAME record and try again.`,
      expectedTarget,
    }
  } catch (err) {
    return {
      verified: false,
      records: [],
      error: `DNS lookup failed: ${(err as Error).message}`,
      expectedTarget,
    }
  }
}

/**
 * Optional: TXT record verification for extra security.
 * This is what most SaaS platforms use to prove domain ownership.
 */
export async function verifyDomainTxt(domain: string, token: string): Promise<boolean> {
  const normalized = normalizeDomain(domain)
  const expectedTxtValue = `scanflow-verify=${token}`

  try {
    const txtRecords = await dns.resolveTxt(normalized)
    return txtRecords.some((record) =>
      record.join('').includes(expectedTxtValue)
    )
  } catch {
    return false
  }
}