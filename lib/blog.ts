export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  content: string
  tags: string[]
}

export const POSTS: BlogPost[] = [
  {
    slug: 'how-to-make-qr-code-restaurant-menu',
    title: 'How to make a QR code for a restaurant menu (2025 guide)',
    description:
      'Step-by-step guide to creating a QR code menu for your restaurant — and why dynamic codes beat static ones.',
    date: '2025-01-10',
    author: 'ScanFlow Team',
    tags: ['restaurants', 'menu', 'how-to'],
    content: `Restaurants print hundreds of menus every year. Seasonal changes, price updates, new dishes — each change means a full reprint. That costs money, wastes paper, and takes days.

A QR code menu solves this — but only if it's a **dynamic** QR code. Static QR codes lock the URL to the printed image, so changing the menu means reprinting. Dynamic QR codes let you change the destination anytime, without touching the printed code.

## Why restaurants switched to QR menus

The shift happened in three phases:

- **2020** — Contactless dining forced quick adoption. Most restaurants used static codes, which became a nightmare when menus changed.
- **2022** — Diners returned to in-person, but QR menus stayed popular — especially for beverages, late-night menus, and quick-service restaurants.
- **2025** — Dynamic QR codes are the default. Chains like cafes and QSRs rotate seasonal menus monthly without reprinting.

## Static vs dynamic QR codes

A **static QR code** encodes the final URL directly. Once printed, you cannot change it.

A **dynamic QR code** points to a short URL you control (like scanflow.app/r/abc123). The QR pattern never changes — but the destination does. You update the destination in a dashboard and every printed copy instantly points to the new menu.

For restaurants, dynamic codes are almost always the right choice because:

- Menus change seasonally or weekly
- Prices get updated without reprints
- You can A/B test different landing pages
- You get scan analytics (which dishes get viewed, when, on what devices)

## Step-by-step: creating a restaurant menu QR code

- **Step 1 — Choose a dynamic QR code service.** Sign up at scanflow.app. The free plan gives you 2 dynamic codes — enough to test.
- **Step 2 — Create the QR code.** Enter your menu URL (e.g., https://yourrestaurant.com/menu.pdf or a Notion page), name it "Summer Menu," and pick colors matching your brand.
- **Step 3 — Add your logo.** Upload a square logo (under 1 MB). Keep it under 20% of the QR size so it stays scannable.
- **Step 4 — Download and print.** Download PNG (for digital use) or SVG (for print at any size). Test with your phone before printing 500 copies.
- **Step 5 — Place on tables.** Standard size: 3cm × 3cm minimum for table tents. Larger for posters and window displays.
- **Step 6 — Update anytime.** When the menu changes, update the destination URL in your dashboard. No reprint needed.

## Best practices for restaurant QR menus

- **Test on multiple phones** before printing — iOS and Android camera apps sometimes handle QR codes differently.
- **Keep contrast high** — dark foreground, light background. Avoid low-contrast color pairs.
- **Preserve the quiet zone** — don't crop the white border around the QR code.
- **Print on matte, not glossy** — reflections break scanning.
- **Include a fallback** — print the short URL under the QR code for people who can't scan.
- **Don't rotate menus without updating the code** — if you change the printed URL but not the menu, diners see the wrong page.

## Common mistakes to avoid

- **Using a static QR code for a changing menu.** The #1 mistake. You'll reprint constantly.
- **Printing at low resolution.** Zoom in on your print file — if the pixels blur, print at higher DPI.
- **Placing QR codes on textured surfaces.** Fabric, wood grain, and shiny surfaces break scanning.
- **Forgetting a "menu" label.** Diners won't know what the code does. Add "Scan for menu" above it.
- **Ignoring analytics.** If 80% of your scans come from iPhones between 7-9 PM, that's your peak window — schedule updates accordingly.

## How much does this cost?

A dynamic QR code service like ScanFlow starts free. The Starter plan (₹749/month) covers 10 QR codes, logo upload, and 30-day analytics — enough for most single-location restaurants.

For chains with multiple locations, the Pro plan (₹1,499/month) adds custom domains, team member accounts, and 12-month analytics.

The math is simple: one menu reprint at 500 copies costs ₹3,000-5,000. A single month of ScanFlow pays for itself after one avoided reprint.`,
  },
  {
    slug: 'dynamic-vs-static-qr-codes',
    title: 'Dynamic vs static QR codes: which is better for business?',
    description:
      'A plain-English comparison of dynamic and static QR codes with real business use cases.',
    date: '2025-01-12',
    author: 'ScanFlow Team',
    tags: ['comparison', 'business'],
    content: `Every business that prints a QR code faces the same choice: static or dynamic?

The answer depends on what you're using it for. Here's a clear breakdown of when each makes sense.

## What is a static QR code?

A static QR code encodes the final destination URL inside the QR pattern itself. The image is fixed — you cannot change where it points.

**Pros:**
- Free to generate anywhere (no subscription needed)
- No tracking, no analytics, no server dependency
- Works forever, even if the QR service shuts down

**Cons:**
- Cannot be changed after printing
- No scan analytics
- No branding (usually just black and white)
- If the destination changes, you must reprint

## What is a dynamic QR code?

A dynamic QR code encodes a short URL that you control (like scanflow.app/r/abc123). The QR pattern is fixed, but the destination redirects — you can change it anytime from a dashboard.

**Pros:**
- Change destination anytime without reprinting
- Scan analytics (time, device, country)
- Brand customization (colors, logos)
- Organize many codes with folders or clients
- Team access — multiple people manage codes

**Cons:**
- Requires a subscription
- Depends on the service provider staying online
- Requires internet access for the redirect to work

## Side-by-side comparison

| Feature | Static | Dynamic |
|---|---|---|
| Cost | Free | ₹749+/month |
| Change destination | ❌ | ✅ |
| Scan analytics | ❌ | ✅ |
| Logo & colors | Limited | ✅ |
| Team collaboration | ❌ | ✅ |
| Works offline | ✅ (image works) | ✅ (needs internet for redirect) |
| Depends on provider | ❌ | ✅ |
| Best for | Permanent links | Business use cases |

## When to use static QR codes

- **Permanent URLs** that will never change (e.g., Wikipedia pages, government forms)
- **Physical products** with fixed landing pages
- **Personal use** — sharing Wi-Fi, contact info, social profiles
- **One-time event promotions** with a fixed landing page

## When to use dynamic QR codes

- **Restaurant menus** — change seasonally without reprinting
- **Marketing campaigns** — test different landing pages for the same flyer
- **Product packaging** — update product info or warranty pages
- **Business cards** — update your contact info without reprinting
- **Event materials** — update the schedule on the same printed code
- **Agencies** — manage QR codes for multiple clients from one dashboard

## Real business scenarios

**Scenario 1 — Restaurant chain**
A café prints 500 table tents with a menu QR. Every season, they'd reprint 500 tents using static codes. With dynamic codes, they update the menu URL in the dashboard. Cost savings after 2 seasonal changes: ₹8,000+. **Verdict: dynamic.**

**Scenario 2 — Permanent link**
A government office prints QR codes linking to their tax filing portal. The URL hasn't changed in 10 years. **Verdict: static.**

**Scenario 3 — Marketing agency**
An agency runs QR campaigns for 20 clients. Each campaign needs different landing pages and analytics. **Verdict: dynamic.**

**Scenario 4 — Wi-Fi sharing**
A café wants customers to connect to Wi-Fi. The password rarely changes. Static works fine — but dynamic lets them rotate the password without reprinting the QR. **Verdict: static (unless password changes).**

## The cost math

Static QR codes appear "free" — but they're not.

If you reprint 500 flyers at ₹5 each every time the URL changes:
- 2 changes/year × ₹2,500 = ₹5,000/year
- 4 changes/year × ₹2,500 = ₹10,000/year

A dynamic QR subscription at ₹749/month = ₹8,988/year — and covers 10 QR codes, so the per-code cost is under ₹900/year.

For any business that changes destinations more than once a year, dynamic wins on cost alone.

## The hidden gotcha: provider dependency

A dynamic QR code only works while your provider stays online. If ScanFlow shuts down, your printed QR codes break.

This is a real concern. Mitigate it by:

- Choosing a provider with uptime guarantees
- Keeping a printed backup URL (the short URL under the QR)
- Exporting analytics regularly

Every dynamic QR provider has this risk. It's the trade-off for editability.

## Our recommendation

- **Business use** → dynamic
- **Personal use** → static
- **Permanent content** → static
- **Anything you'll update** → dynamic

The cost of reprinting once is usually more than a year of a dynamic QR subscription. For most businesses, dynamic is the obvious choice.`,
  },
  {
    slug: 'qr-code-analytics-metrics',
    title: 'QR code analytics: 8 metrics that actually matter',
    description:
      'The scan metrics worth tracking — and the vanity metrics to ignore.',
    date: '2025-01-14',
    author: 'ScanFlow Team',
    tags: ['analytics', 'metrics'],
    content: `If you're using dynamic QR codes, you have access to analytics. But most dashboards show dozens of metrics — and most are noise.

Here are the 8 metrics that actually change your decisions, and how to use each one.

## 1. Total scans

The baseline number: how many times your QR code was scanned.

**What it tells you:** Overall popularity. A sudden spike or drop usually indicates something changed — either the placement, or the destination.

**How to use it:** Compare week-over-week. If scans drop 30% overnight, check that the destination URL still works and that the code hasn't been moved or removed.

## 2. Scans over time

Daily or weekly scan trends.

**What it tells you:** When people actually scan. Restaurants see peaks at lunch and dinner. Retail stores see peaks on weekends.

**How to use it:** Schedule menu updates or promotions right before your peak scanning window. If you update at midnight and peak is 7 PM, users see stale content all day.

## 3. Unique vs total scans

Total scans counts every scan. Unique visitors approximate how many different people scanned.

**What it tells you:** If total is 1,000 but unique is 100, you have 10x repeat scammers or bots. If they're close, your QR is being scanned by genuinely new visitors.

**How to use it:** A high repeat ratio is fine for menus (same diner scans daily). A high repeat ratio on a marketing flyer suggests fake traffic — investigate before drawing conclusions.

## 4. Device breakdown

Mobile vs desktop vs tablet.

**What it tells you:** For most QR codes, expect 85%+ mobile. If you see high desktop scans, either people are scanning screenshots or bots are hitting you.

**How to use it:** Ensure your landing page is mobile-first. A QR code that opens a desktop-only page frustrates 85% of scanners.

## 5. Country/region breakdown

Where scans come from (based on IP geolocation).

**What it tells you:** A restaurant in Mumbai expects most scans from India. If 60% come from the US, something is wrong — probably bots or a misconfigured campaign.

**How to use it:** Spot anomalies. If your local business gets international scans, investigate and consider blocking traffic from unexpected regions.

## 6. Referrer domain

Where the scan originated (which app the user was in when they scanned).

**What it tells you:** Some scans have no referrer (user opened phone camera directly). Some show Instagram, WhatsApp, or Google. This tells you which platforms your audience uses.

**How to use it:** Double down on high-referrer platforms. If 40% of scans come from Instagram, that's where your audience is — optimize the QR experience for Instagram users.

## 7. Peak scan times

The hours of the day when scans spike.

**What it tells you:** Business-specific patterns. Restaurants peak at meal times. B2B services peak during business hours. Events peak at registration.

**How to use it:** Time your updates, maintenance, and promotions to avoid peaks. Never deploy a menu change at 7 PM if that's when 40% of scans happen.

## 8. Abandonment rate (indirect)

Percentage of scans that don't complete the destination's goal (e.g., menu view, form fill).

**Why it matters:** It's not a ScanFlow metric directly, but it's the most important number. If 100 people scan and 80 leave immediately, the QR isn't the problem — the destination is.

**How to measure it:** Add analytics to your landing page (Google Analytics, Plausible, or similar). Compare "scans" from ScanFlow to "sessions" on the landing page. The gap is your abandonment rate.

## Vanity metrics to ignore

- **Cumulative scans** — only useful for vanity. Focus on trends.
- **"Ranks" between your own codes** — internal competition is meaningless if both codes are underperforming.
- **Raw response times** — interesting for engineers, irrelevant for marketers.
- **Bounce rate alone** — without context, it's just a number.

## Building a monthly analytics routine

- **Week 1:** Review total scans + trend. Note any anomalies.
- **Week 2:** Check device + country breakdown. Flag anything weird.
- **Week 3:** Analyze peak scan times. Adjust posting/printing schedule.
- **Week 4:** Compare month-over-month. Decide on optimizations.

## The one metric that matters most

If you only track one metric, track **scan-to-goal completion**. It combines "did people scan?" and "did the destination work?" into one number.

A 40% scan-to-goal rate is great. A 10% rate means either your QR is poorly placed or your landing page is broken. Fix the landing page first — the QR is doing its job if people scan it.`,
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug)
}

export function getSortedPosts(): BlogPost[] {
  return [...POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}