import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Utensils,
  Calendar,
  Building2,
  ShoppingBag,
  Wifi,
  Mail,
  ArrowRight,
} from 'lucide-react'

export const metadata = {
  title: 'Templates — ScanFlow',
}

const TEMPLATES = [
  {
    id: 'restaurant-menu',
    name: 'Restaurant Menu',
    description:
      'Perfect for menus that change seasonally. Update dishes without reprinting.',
    icon: Utensils,
    destination: 'https://your-restaurant.com/menu',
    colors: { fg: '#7C2D12', bg: '#FEF3C7' },
    tag: 'Popular',
  },
  {
    id: 'event-schedule',
    name: 'Event Schedule',
    description:
      'Share your event agenda. Update sessions or speakers on the fly.',
    icon: Calendar,
    destination: 'https://your-event.com/schedule',
    colors: { fg: '#1E40AF', bg: '#DBEAFE' },
  },
  {
    id: 'business-card',
    name: 'Digital Business Card',
    description:
      'Link to your contact info, LinkedIn, and portfolio from one QR code.',
    icon: Building2,
    destination: 'https://your-site.com/contact',
    colors: { fg: '#1F2937', bg: '#F9FAFB' },
  },
  {
    id: 'product-info',
    name: 'Product Information',
    description:
      'Point to product specs, reviews, or warranty registration.',
    icon: ShoppingBag,
    destination: 'https://your-shop.com/product',
    colors: { fg: '#065F46', bg: '#D1FAE5' },
  },
  {
    id: 'wifi-access',
    name: 'Guest Wi-Fi',
    description:
      'Share your Wi-Fi credentials with one scan. Update the password anytime.',
    icon: Wifi,
    destination: 'https://your-site.com/wifi',
    colors: { fg: '#5B21B6', bg: '#EDE9FE' },
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Grow your mailing list from any printed material.',
    icon: Mail,
    destination: 'https://your-site.com/subscribe',
    colors: { fg: '#BE185D', bg: '#FCE7F3' },
    tag: 'New',
  },
]

export default function TemplatesPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Templates</h1>
        <p className="text-muted-foreground mt-1">
          Start with a preset designed for common use cases. You can customize
          everything after.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => {
          const Icon = template.icon
          return (
            <Card
              key={template.id}
              className="overflow-hidden hover:shadow-md transition-shadow group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: template.colors.bg,
                      color: template.colors.fg,
                    }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {template.tag && (
                    <Badge variant="secondary">{template.tag}</Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  asChild
                >
                  <Link
                    href={`/dashboard/create?template=${template.id}`}
                    className="flex items-center justify-center gap-2"
                  >
                    Use this template
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="border rounded-lg p-6 bg-muted/30 text-center">
        <h3 className="font-semibold mb-1">Don't see what you need?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create a custom QR code from scratch — full control over colors,
          logos, and destination.
        </p>
        <Button asChild>
          <Link href="/dashboard/create">Create custom QR code</Link>
        </Button>
      </div>
    </div>
  )
}