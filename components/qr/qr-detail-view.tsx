'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { formatDistanceToNow } from 'date-fns'
import { downloadPng, downloadSvg, safeFilename } from '@/lib/qr-download'
import { updateQrCode, deleteQrCode, toggleQrCodeActive } from '@/app/actions/qr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Download,
  Copy,
  ExternalLink,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  BarChart3,
} from 'lucide-react'

interface QrDetailViewProps {
  qrCode: {
    id: string
    name: string
    slug: string
    destination_url: string
    foreground_color: string
    background_color: string
    logo_path: string | null
    is_active: boolean
    created_at: string
    scanCount: number
  }
  appUrl: string
}

export function QrDetailView({ qrCode, appUrl }: QrDetailViewProps) {
  const router = useRouter()
  const previewRef = useRef<SVGSVGElement>(null)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(qrCode.name)
  const [destinationUrl, setDestinationUrl] = useState(qrCode.destination_url)
  const [isSaving, startSave] = useTransition()
  const [isToggling, startToggle] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const shortUrl = `${appUrl}/r/${qrCode.slug}`
  const filename = safeFilename(qrCode.name)

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl)
    toast.success('Link copied to clipboard')
  }

  function handleDownloadPng() {
    if (!previewRef.current) return
    downloadPng(previewRef.current, filename, 1024)
      .then(() => toast.success('PNG downloaded'))
      .catch((err) => toast.error(err.message))
  }

  function handleDownloadSvg() {
    if (!previewRef.current) return
    try {
      downloadSvg(previewRef.current, filename)
      toast.success('SVG downloaded')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  function handleSave() {
    if (!name.trim() || !destinationUrl.trim()) {
      toast.error('Name and destination URL are required')
      return
    }

    startSave(async () => {
      const result = await updateQrCode(qrCode.id, {
        name: name.trim(),
        destination_url: destinationUrl.trim(),
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('QR code updated')
      setEditing(false)
      router.refresh()
    })
  }

  function handleCancelEdit() {
    setName(qrCode.name)
    setDestinationUrl(qrCode.destination_url)
    setEditing(false)
  }

  function handleToggle() {
    startToggle(async () => {
      const result = await toggleQrCodeActive(qrCode.id, !qrCode.is_active)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(qrCode.is_active ? 'QR code deactivated' : 'QR code activated')
      router.refresh()
    })
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteQrCode(qrCode.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('QR code deleted')
      router.push('/dashboard')
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" render={<Link href="/dashboard" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold truncate">{qrCode.name}</h1>
            <Badge variant={qrCode.is_active ? 'default' : 'secondary'}>
              {qrCode.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Created {formatDistanceToNow(new Date(qrCode.created_at), { addSuffix: true })}
          </p>
        </div>
        <Button variant="outline" render={<Link href={`/dashboard/${qrCode.id}/analytics`} />}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Left: QR + downloads */}
        <Card className="lg:sticky lg:top-24 lg:self-start">
          <CardHeader>
            <CardTitle className="text-lg">QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-4 rounded-lg bg-muted/30">
              <QRCodeSVG
                ref={previewRef}
                value={shortUrl}
                size={256}
                fgColor={qrCode.foreground_color}
                bgColor={qrCode.background_color}
                level="H"
                marginSize={4}
                imageSettings={
                  qrCode.logo_path
                    ? {
                        src: qrCode.logo_path,
                        height: 51,
                        width: 51,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPng}>
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadSvg}>
                <Download className="h-4 w-4 mr-2" />
                SVG
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Short link</Label>
              <div className="flex gap-2">
                <Input
                  value={shortUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <span className="text-sm text-muted-foreground">Total scans</span>
              <span className="text-lg font-bold">{qrCode.scanCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Right: Details + edit */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Details</CardTitle>
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-url">Destination URL</Label>
                    <Input
                      id="edit-url"
                      type="url"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Changes take effect immediately. The printed QR code stays
                      the same.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Save changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Name</p>
                      <p className="font-medium">{qrCode.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Slug</p>
                      <p className="font-mono text-sm">{qrCode.slug}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Destination URL
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={qrCode.destination_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate flex-1"
                      >
                        {qrCode.destination_url}
                      </a>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {qrCode.is_active ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {qrCode.is_active
                      ? 'Scans redirect to your destination.'
                      : 'Scans show a "not available" page.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggle}
                  disabled={isToggling}
                >
                  {isToggling && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {qrCode.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">
                Danger zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete this QR code</p>
                  <p className="text-xs text-muted-foreground">
                    This cannot be undone. All scan data will be lost.
                  </p>
                </div>
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger
                  render={
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  }
                />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete "{qrCode.name}"?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete the QR code and all its
                        scan data. Printed codes will stop working.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteOpen(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Yes, delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}