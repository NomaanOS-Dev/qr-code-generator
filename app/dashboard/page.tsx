import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, QrCode } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My QR Codes</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your dynamic QR codes in one place
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="h-4 w-4 mr-2" />
            Create QR
          </Link>
        </Button>
      </div>

      {!qrCodes || qrCodes.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No QR codes yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first dynamic QR code to get started.
          </p>
          <Button asChild>
            <Link href="/dashboard/create">
              <Plus className="h-4 w-4 mr-2" />
              Create your first QR code
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qr) => (
            <div key={qr.id} className="border rounded-lg p-4 bg-background">
              <h3 className="font-semibold">{qr.name}</h3>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {qr.destination_url}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}