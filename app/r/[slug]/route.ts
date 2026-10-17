import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ratelimit, getClientIp } from '@/lib/ratelimit'
import { UAParser } from 'ua-parser-js'

// export const dynamic = 'force-dynamic'
// export const runtime = 'nodejs'

/**
 * GET /r/[slug]
 *
 * Handles both:
 *   - Main domain: scanflow.app/r/abc123
 *   - Custom domain: go.myrestaurant.com/r/abc123
 *
 * Looks up the QR code by slug. If the incoming host is a verified custom
 * domain, validates that the QR's workspace owns that domain.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now()

  try {
    const { slug } = await params

    if (!slug || !/^[A-Za-z0-9_-]{4,32}$/.test(slug)) {
      return redirectToNotFound(request)
    }

    // 1. Rate limiting per IP
    const ip = getClientIp(request)
    const { success, limit, remaining, reset } = await ratelimit.limit(ip)

    if (!success) {
      return new NextResponse('Too many requests. Please try again shortly.', {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
        },
      })
    }

    // 2. Detect custom domain from Host header
    const host =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      ''
    const hostname = host.split(':')[0].toLowerCase()

    const appHost = new URL(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    ).hostname.toLowerCase()
    const isCustomDomain = hostname !== appHost && hostname !== 'localhost'

    const admin = createAdminClient()

    // 3. Look up QR code
    const { data: qrCode, error: lookupError } = await admin
      .from('qr_codes')
      .select(
        'id, destination_url, is_active, user_id, workspace_id, custom_domain_id'
      )
      .eq('slug', slug)
      .maybeSingle()

    if (lookupError) {
      console.error('[redirect] DB error:', lookupError)
      return redirectToNotFound(request)
    }

    if (!qrCode || !qrCode.is_active) {
      return redirectToNotFound(request)
    }

    // 4. If custom domain, verify the domain is registered for this QR
    if (isCustomDomain) {
      const { data: domainRow } = await admin
        .from('custom_domains')
        .select('id, workspace_id, status, domain')
        .eq('domain', hostname)
        .maybeSingle()

      if (!domainRow) {
        console.warn(`[redirect] unknown custom domain: ${hostname}`)
        return redirectToNotFound(request)
      }

      if (domainRow.status !== 'verified') {
        console.warn(
          `[redirect] domain not verified: ${hostname} (${domainRow.status})`
        )
        return redirectToNotFound(request)
      }

      // Domain must belong to the QR's workspace
      if (domainRow.workspace_id !== qrCode.workspace_id) {
        console.warn(
          `[redirect] domain/workspace mismatch: ${hostname} vs ${qrCode.workspace_id}`
        )
        return redirectToNotFound(request)
      }

      // If QR has a specific custom_domain_id, enforce it
      if (
        qrCode.custom_domain_id &&
        qrCode.custom_domain_id !== domainRow.id
      ) {
        console.warn(
          `[redirect] QR locked to different domain: ${qrCode.custom_domain_id}`
        )
        return redirectToNotFound(request)
      }
    }

    // 5. Log scan (fire-and-forget)
    recordScan(admin, qrCode.id, request, isCustomDomain, hostname).catch(
      (err) => {
        console.error('[redirect] scan log error:', err)
      }
    )

    // 6. Redirect
    return NextResponse.redirect(qrCode.destination_url, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    })
  } catch (error) {
    console.error('[redirect] fatal error:', error)
    return redirectToNotFound(request)
  }
}

async function recordScan(
  admin: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  qrCodeId: string,
  request: NextRequest,
  isCustomDomain: boolean,
  hostname: string
) {
  const userAgent = request.headers.get('user-agent') || ''
  const parser = new UAParser(userAgent)
  const deviceType =
    parser.getDevice().type ||
    (parser.getOS().name ? 'desktop' : 'unknown')

  const countryCode =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    null

  const referrer = request.headers.get('referer')
  let referrerDomain: string | null = null
  if (referrer) {
    try {
      referrerDomain = new URL(referrer).hostname
    } catch {
      referrerDomain = null
    }
  }

  await admin.from('qr_scans').insert({
    qr_code_id: qrCodeId,
    device_type: deviceType,
    country_code: countryCode,
    referrer_domain: referrerDomain,
  })
}

function redirectToNotFound(request: NextRequest) {
  const url = new URL('/r/not-found', request.url)
  return NextResponse.redirect(url, 302)
}