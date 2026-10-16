'use client'

import { useState, useTransition, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createQrCode } from '@/app/actions/qr'
import { QrPreview } from './qr-preview'
import { ColorPicker } from './color-picker'
import { LogoUpload } from './logo-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2, Download, Save, Link2, Palette, Image as ImageIcon } from 'lucide-react'
import { downloadPng, downloadSvg, safeFilename } from '@/lib/qr-download'
import { createClient } from '@/lib/supabase/client'

interface CreateQrFormProps {
  userPlan?: string
}

export function CreateQrForm({ userPlan = 'free' }: CreateQrFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [name, setName] = useState('')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('content')

  // For downloads and after-save reuse
  const previewRef = useRef<SVGSVGElement>(null)

  // Compute the redirect URL that will be encoded
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const [previewSlug] = useState(() =>
    Math.random().toString(36).slice(2, 10).padEnd(8, '0')
  )
  const previewUrl = `${appUrl}/r/${previewSlug}`

  // Live preview value
  const previewValue = useMemo(() => {
    return destinationUrl.trim() ? previewUrl : ''
  }, [destinationUrl, previewUrl])

  function handleDownloadPng() {
    if (!previewRef.current) return
    if (!destinationUrl.trim()) {
      toast.error('Enter a destination URL first')
      return
    }
    downloadPng(previewRef.current, safeFilename(name || 'qr-code'))
      .then(() => toast.success('PNG downloaded'))
      .catch((err) => toast.error(err.message))
  }

  function handleDownloadSvg() {
    if (!previewRef.current) return
    if (!destinationUrl.trim()) {
      toast.error('Enter a destination URL first')
      return
    }
    try {
      downloadSvg(previewRef.current, safeFilename(name || 'qr-code'))
      toast.success('SVG downloaded')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter a name')
      setActiveTab('content')
      return
    }

    if (!destinationUrl.trim()) {
      toast.error('Please enter a destination URL')
      setActiveTab('content')
      return
    }

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('destination_url', destinationUrl.trim())
    formData.append('foreground_color', foregroundColor)
    formData.append('background_color', backgroundColor)
    if (logoUrl) formData.append('logo_path', logoUrl)

    startTransition(async () => {
      const result = await createQrCode(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('QR code created')
      router.push(`/dashboard/${result.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* LEFT: Form fields */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="h-4 w-4" />
                QR Code Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Summer Menu, Holiday Campaign"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Only you see this — helps organize your codes.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination_url">
                  Destination URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="destination_url"
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://your-restaurant.com/menu"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Where your QR code sends people. You can change this later.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <ColorPicker
                  id="foreground_color"
                  label="Foreground color"
                  value={foregroundColor}
                  onChange={setForegroundColor}
                />
                <ColorPicker
                  id="background_color"
                  label="Background color"
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                />
              </div>

              <LogoUpload value={logoUrl} onChange={setLogoUrl} />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Live preview + actions */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center py-4">
                <QrPreview
                  ref={previewRef}
                  value={previewValue}
                  foregroundColor={foregroundColor}
                  backgroundColor={backgroundColor}
                  logoUrl={logoUrl}
                  size={256}
                />
              </div>

              {previewValue && (
                <div className="rounded-md bg-muted p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Encoded URL
                  </p>
                  <p className="text-xs font-mono break-all">
                    {previewUrl}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPng}
                  disabled={!previewValue}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PNG
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSvg}
                  disabled={!previewValue}
                >
                  <Download className="h-4 w-4 mr-2" />
                  SVG
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create QR Code
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You're on the <span className="font-medium">{userPlan}</span> plan
          </p>
        </div>
      </div>
    </form>
  )
}