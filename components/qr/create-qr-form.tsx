'use client'

import { useState, useTransition, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createQrCode } from '@/app/actions/qr'
import { QrPreview } from './qr-preview'
import { ColorPicker } from './color-picker'
import { LogoUpload } from './logo-upload'
import { StylePicker } from './style-picker'
import { DownloadMenu } from './download-menu'
import { UpgradePrompt } from '@/components/billing/upgrade-prompt'
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
  Lock,
} from 'lucide-react'
import { safeFilename } from '@/lib/qr-download'
import {
  ERROR_CORRECTION_LEVELS,
  type QrStylePreset,
} from '@/lib/qr-styles'
import type { Plan } from '@/lib/plans'
import { PLAN_LIMITS } from '@/lib/plans'

interface CreateQrFormProps {
  userPlan?: Plan
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

  const planLimits = PLAN_LIMITS[userPlan]
  const canUploadLogo = planLimits.logoUpload

  const [name, setName] = useState(preset?.name ?? '')
  const [destinationUrl, setDestinationUrl] = useState(preset?.destination ?? '')

  const [touched, setTouched] = useState({ name: false, url: false })

  const [style, setStyle] = useState<string>('default')
  const [foregroundColor, setForegroundColor] = useState(preset?.fg ?? '#000000')
  const [backgroundColor, setBackgroundColor] = useState(preset?.bg ?? '#FFFFFF')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoSizePercent, setLogoSizePercent] = useState(20)
  const [margin, setMargin] = useState(4)
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H')

  const previewRef = useRef<SVGSVGElement>(null)

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

  // ─────────────────────────────────────────────────────────────
  // Field-level validation
  // ─────────────────────────────────────────────────────────────
  const nameError = useMemo<string | null>(() => {
    if (!touched.name) return null
    return name.trim().length < 2
      ? 'Name must be at least 2 characters'
      : null
  }, [name, touched.name])

  const urlError = useMemo<string | null>(() => {
    if (!touched.url) return null

    const trimmed = destinationUrl.trim()
    if (!trimmed) return 'Destination URL is required'

    try {
      const u = new URL(trimmed)
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return 'URL must start with http:// or https://'
      }
    } catch {
      return 'Please enter a valid URL'
    }

    return null
  }, [destinationUrl, touched.url])

  function handleStyleChange(presetStyle: QrStylePreset) {
    setStyle(presetStyle.id)
    setForegroundColor(presetStyle.foregroundColor)
    setBackgroundColor(presetStyle.backgroundColor)
    setMargin(presetStyle.margin)
    setErrorCorrection(presetStyle.errorCorrection)
    if (presetStyle.logoSizePercent !== undefined) {
      setLogoSizePercent(presetStyle.logoSizePercent)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Mark both fields as touched so errors surface on submit
    setTouched({ name: true, url: true })

    if (name.trim().length < 2) {
      toast.error('Please enter a name (at least 2 characters)')
      return
    }
    if (!destinationUrl.trim()) {
      toast.error('Please enter a destination URL')
      return
    }
    try {
      const u = new URL(destinationUrl.trim())
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        toast.error('URL must start with http:// or https://')
        return
      }
    } catch {
      toast.error('Please enter a valid URL')
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
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6">
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
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="e.g., Summer Menu, Holiday Campaign"
                  maxLength={100}
                  required
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? 'name-error' : undefined}
                  className={nameError ? 'border-destructive' : ''}
                />
                {nameError && (
                  <p id="name-error" className="text-xs text-destructive">
                    {nameError}
                  </p>
                )}
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
                  onBlur={() => setTouched((t) => ({ ...t, url: true }))}
                  placeholder="https://your-restaurant.com/menu"
                  required
                  aria-invalid={Boolean(urlError)}
                  aria-describedby={urlError ? 'url-error' : undefined}
                  className={urlError ? 'border-destructive' : ''}
                />
                {urlError ? (
                  <p id="url-error" className="text-xs text-destructive">
                    {urlError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Where your QR code sends people. You can change this later.
                  </p>
                )}
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

                  {canUploadLogo ? (
                    <LogoUpload
                      value={logoUrl}
                      onChange={setLogoUrl}
                      sizePercent={logoSizePercent}
                      onSizeChange={setLogoSizePercent}
                      showSizeSlider
                    />
                  ) : (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" />
                        Logo (Starter+)
                      </Label>
                      <UpgradePrompt
                        currentPlan={userPlan}
                        requiredPlan="starter"
                        feature="Logo upload"
                        variant="gate"
                      />
                    </div>
                  )}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="margin">Quiet zone margin: {margin}</Label>
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
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

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
            You&apos;re on the <span className="font-medium">{userPlan}</span> plan
          </p>
        </div>
      </div>
    </form>
  )
}