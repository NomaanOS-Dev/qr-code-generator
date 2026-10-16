// import { createClient } from '@/lib/supabase/server';
// import { NextResponse } from 'next/server';
// import { UAParser } from 'ua-parser-js'; // npm install ua-parser-js

// export async function GET(
//   request: Request,
//   { params }: { params: { slug: string } }
// ) {
//   const supabase = createClient();
//   const { slug } = params;

//   // 1. Find the QR code
//   const { data: qrCode, error } = await supabase
//     .from('qr_codes')
//     .select('*')
//     .eq('slug', slug)
//     .single();

//   if (error || !qrCode || !qrCode.is_active) {
//     return NextResponse.json({ error: 'QR code not found or inactive' }, { status: 404 });
//   }

//   // 2. Record scan (Fire and forget - don't await to keep redirect fast)
//   const userAgent = request.headers.get('user-agent') || '';
//   const parser = new UAParser(userAgent);
//   const deviceType = parser.getDevice().type || 'desktop';
//   const referrer = request.headers.get('referer') || null;
//   const country = request.headers.get('x-vercel-ip-country') || null; // Vercel provides this

//   // Use a separate non-blocking call or a queue in production
//   supabase.from('qr_scans').insert({
//     qr_code_id: qrCode.id,
//     device_type: deviceType,
//     referrer_domain: referrer,
//     country_code: country,
//   }).then(); 

//   // 3. Redirect (302 for dynamic, 301 for static)
//   return NextResponse.redirect(qrCode.destination_url, 302);
// }