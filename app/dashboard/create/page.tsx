import { QrCode } from 'lucide-react'

export default function CreateQrPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center py-12">
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
          <QrCode className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Create QR Code</h1>
        <p className="text-muted-foreground">
          Coming on Day 4 — the form will be built here.
        </p>
      </div>
    </div>
  )
}