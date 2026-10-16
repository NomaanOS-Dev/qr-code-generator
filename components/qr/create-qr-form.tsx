'use client'

import { useState, useTransition, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createQrCode } from '@/app/actions/qr'
import { QrPreview } from './qr-preview'
import { ColorPicker } from './color-picker'
import { LogoUpload } from './logo-upload'
import { StylePicker } from './style-picker'
import { DownloadMenu } from './download-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Loader2,
  Save,
  Link2,
  Palette,
  Settings2,
  Sparkles,
} from 'lucide-react'
import { safeFilename } from '@/lib/qr-download'
import {
  ERROR_CORRECTION_LEVELS,
  type QrStylePreset,
} from '@/lib/qr-styles'

interface CreateQrFormProps {
  userPlan?: string
  preset?: {
    name: string
    destination: string
    fg: string
    bg: string
  }
}

export function CreateQrForm({ userPlan = 'free', preset }: CreateQrFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Content
  const [name, setName] = useState(preset?.name ?? '')
  const [destinationUrl, setDestinationUrl] = useState(preset?.destination ?? '')

  // Appearance
  const [style, setStyle] = useState<string>('default')
  const [foregroundColor, setForegroundColor] = useState(preset?.fg ?? '#000000')
  const [backgroundColor, setBackgroundColor] = useState(preset?.bg ?? '#FFFFFF')

  // Logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoSizePercent, setLogoSizePercent] = useState(20)

  // Advanced
  const [margin, setMargin] = useState(4)
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H')

  const previewRef = useRef<SVGSVGElement>(null)

  // Apply preset on mount
  useEffect(() => {
    if (preset) {
      setName(preset.name)
      setDestinationUrl(preset.destination)
      setForegroundColor(preset.fg)
      setBackgroundColor(preset.bg)
    }
  }, [preset])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const [previewSlug] = useState(() =>
    Math.random().toString(36).slice(2, 10).padEnd(8, '0')
  )
  const previewUrl = `${appUrl}/r/${previewSlug}`

  const previewValue = useMemo(() => {
    return destinationUrl.trim() ? previewUrl : ''
  }, [destinationUrl, previewUrl])

  // Handle style change — updates colors + advanced
  function handleStyleChange(preset: QrStylePreset) {
    setStyle(preset.id)
    setForegroundColor(preset.foregroundColor)
    setBackgroundColor(preset.backgroundColor)
    setMargin(preset.margin)
    setErrorCorrection(preset.errorCorrection)
    if (preset.logoSizePercent !== undefined) {
      setLogoSizePercent(preset.logoSizePercent)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter a name')
      return
    }
    if (!destinationUrl.trim()) {
      toast.error('Please enter a destination URL')
      return
    }

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('destination_url', destinationUrl.trim())
    formData.append('foreground_color', foregroundColor)
    formData.append('background_color', backgroundColor)
    formData.append('margin', String(margin))
    formData.append('error_correction', errorCorrection)
    formData.append('logo_size_percent', String(logoSizePercent))
    formData.append('style', style)
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
        <div className="space-y-6">
          {/* Content card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="h-4 w-4" />
                Content
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

          {/* Appearance card with tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="presets" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="presets">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Presets
                  </TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="advanced">
                    <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                    Advanced
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="presets" className="mt-4">
                  <StylePicker value={style} onChange={handleStyleChange} />
                </TabsContent>

                <TabsContent value="colors" className="mt-4 space-y-6">
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

                  <LogoUpload
                    value={logoUrl}
                    onChange={setLogoUrl}
                    sizePercent={logoSizePercent}
                    onSizeChange={setLogoSizePercent}
                    showSizeSlider
                  />
                </TabsContent>

                <TabsContent value="advanced" className="mt-4 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="error-correction">
                      Error correction level
                    </Label>
                    <Select
                      value={errorCorrection}
                      onValueChange={(v) =>
                        setErrorCorrection(v as 'L' | 'M' | 'Q' | 'H')
                      }
                    >
                      <SelectTrigger id="error-correction">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ERROR_CORRECTION_LEVELS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex flex-col">
                              <span>{opt.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {opt.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Higher correction = more resilient but denser QR code.
                      Use High (H) if you have a logo.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="margin">
                      Quiet zone margin: {margin}
                    </Label>
                    <input
                      id="margin"
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Space around the QR code. 4 is standard. Increase for
                      scan reliability when placing on busy backgrounds.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right column — preview */}
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
                  marginSize={margin}
                  errorCorrectionLevel={errorCorrection}
                  logoSizePercent={logoSizePercent}
                />
              </div>

              {previewValue && (
                <div className="rounded-md bg-muted p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Encoded URL
                  </p>
                  <p className="text-xs font-mono break-all">{previewUrl}</p>
                </div>
              )}

              <DownloadMenu
                svgRef={previewRef}
                filename={safeFilename(name || 'qr-code')}
                qrName={name || 'Untitled QR Code'}
                shortUrl={previewUrl}
                destinationUrl={destinationUrl || 'https://example.com'}
                variant="outline"
                size="default"
                className="w-full"
                showPdf={Boolean(previewValue)}
              />
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