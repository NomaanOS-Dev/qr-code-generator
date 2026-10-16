import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ratelimit, getClientIp } from '@/lib/ratelimit'
import { UAParser } from 'ua-parser-js'

// Force dynamic rendering — never cache redirect responses
// export const dynamic = 'force-dynamic'
// export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now()

  try {
    // 1. Extract slug
    const { slug } = await params

    if (!slug || !/^[A-Za-z0-9_-]{4,32}$/.test(slug)) {
      return redirectToNotFound(request)
    }

    // 2. Rate limiting (100 req/min per IP)
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

    // 3. Look up QR code in DB (uses anon client — RLS allows public SELECT of active codes via service role fallback below)
    const supabase = await createClient()

    // We need to bypass RLS for this lookup because the visitor isn't authenticated.
    // Use admin client for the read, but ONLY select public-safe fields.
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()

    const { data: qrCode, error: lookupError } = await admin
      .from('qr_codes')
      .select('id, destination_url, is_active, user_id')
      .eq('slug', slug)
      .maybeSingle()

    if (lookupError) {
      console.error('[redirect] DB error:', lookupError)
      return redirectToNotFound(request)
    }

    if (!qrCode) {
      return redirectToNotFound(request)
    }

    if (!qrCode.is_active) {
      return redirectToNotFound(request)
    }

    // 4. Record scan (fire-and-forget — do NOT await, do NOT block redirect)
    recordScan(admin, qrCode.id, request).catch((err) => {
      console.error('[redirect] scan log error:', err)
    })

    // 5. Redirect with proper headers
    return NextResponse.redirect(qrCode.destination_url, {
      status: 302, // Temporary — destinations must remain editable
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

/**
 * Log a scan event without blocking the redirect.
 * Uses fire-and-forget pattern.
 */
async function recordScan(
  admin: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  qrCodeId: string,
  request: NextRequest
) {
  const userAgent = request.headers.get('user-agent') || ''
  const parser = new UAParser(userAgent)

  const deviceType =
    parser.getDevice().type || // 'mobile', 'tablet', 'smarttv', etc.
    (parser.getOS().name ? 'desktop' : 'unknown')

  // Vercel provides these headers automatically
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

/**
 * Redirect to the "not found" page instead of showing a raw 404.
 */
function redirectToNotFound(request: NextRequest) {
  const url = new URL('/r/not-found', request.url)
  return NextResponse.redirect(url, 302)
}