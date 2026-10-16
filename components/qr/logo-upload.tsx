'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

interface LogoUploadProps {
  value: string | null
  onChange: (url: string | null) => void
}

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']

export function LogoUpload({ value, onChange }: LogoUploadProps) {
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

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('qr-logos')
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year
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

    // Extract path from URL and delete from storage
    const supabase = createClient()
    const path = value.split('/qr-logos/')[1]
    if (path) {
      await supabase.storage.from('qr-logos').remove([path])
    }

    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <Label>Logo (optional)</Label>

      {value ? (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Logo"
            className="h-12 w-12 object-contain rounded border bg-white"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Logo uploaded</p>
            <p className="text-xs text-muted-foreground truncate">{value}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />
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