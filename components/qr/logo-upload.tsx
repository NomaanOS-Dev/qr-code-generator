'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import {
  Upload,
  X,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react'

interface LogoUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  sizePercent?: number
  onSizeChange?: (percent: number) => void
  showSizeSlider?: boolean
}

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']

export function LogoUpload({
  value,
  onChange,
  sizePercent = 20,
  onSizeChange,
  showSizeSlider = true,
}: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, WEBP, or SVG file')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File must be under 1 MB')
      return
    }

    setUploading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in')
      setUploading(false)
      return
    }

    // Delete previous logo if replacing
    if (value) {
      const oldPath = value.split('/qr-logos/')[1]
      if (oldPath) {
        await supabase.storage.from('qr-logos').remove([oldPath])
      }
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('qr-logos')
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      toast.error(uploadError.message)
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('qr-logos').getPublicUrl(filePath)

    onChange(publicUrl)
    toast.success('Logo uploaded')
    setUploading(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  async function handleRemove() {
    if (!value) return

    const supabase = createClient()
    const path = value.split('/qr-logos/')[1]
    if (path) {
      await supabase.storage.from('qr-logos').remove([path])
    }

    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
    toast.success('Logo removed')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Logo (optional)</Label>
        {value && showSizeSlider && onSizeChange && (
          <span className="text-xs text-muted-foreground tabular-nums">
            Size: {sizePercent}%
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {value ? (
        <div className="space-y-4">
          {/* Preview card */}
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Logo"
              className="h-16 w-16 object-contain rounded-md border bg-white p-1"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Logo uploaded</p>
              <p className="text-xs text-muted-foreground truncate">
                {value.split('/').pop()}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                title="Replace logo"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={uploading}
                title="Remove logo"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Size slider */}
          {showSizeSlider && onSizeChange && (
            <div className="space-y-2">
              <Slider
                value={[sizePercent]}
                min={10}
                max={30}
                step={1}
                onValueChange={(v) => onSizeChange(v[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10% (safe)</span>
                <span>20% (balanced)</span>
                <span>30% (bold)</span>
              </div>
            </div>
          )}

          <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              💡 Tip: Test your QR code on a phone before printing. Keep the
              logo under 20% for the most reliable scanning.
            </p>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP, or SVG · Max 1 MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}