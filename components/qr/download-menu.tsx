'use client'

import { RefObject, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, Image, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  downloadPng,
  downloadSvg,
  safeFilename,
  svgToPngDataUrl,
} from '@/lib/qr-download'
import { DOWNLOAD_SIZES } from '@/lib/qr-styles'
import { generateQrPdf } from '@/lib/qr-pdf'

interface DownloadMenuProps {
  svgRef: RefObject<SVGSVGElement | null>
  filename: string
  qrName?: string
  shortUrl?: string
  destinationUrl?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showPdf?: boolean
}

export function DownloadMenu({
  svgRef,
  filename,
  qrName,
  shortUrl,
  destinationUrl,
  variant = 'outline',
  size = 'sm',
  className,
  showPdf = true,
}: DownloadMenuProps) {
  const [busy, setBusy] = useState<string | null>(null)

  async function handlePng(pixels: number) {
    if (!svgRef.current) return
    setBusy(`png-${pixels}`)
    try {
      await downloadPng(svgRef.current, filename, pixels)
      toast.success(`PNG (${pixels}px) downloaded`)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  function handleSvg() {
    if (!svgRef.current) return
    try {
      downloadSvg(svgRef.current, filename)
      toast.success('SVG downloaded')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handlePdf() {
    if (!svgRef.current) return
    if (!qrName || !shortUrl || !destinationUrl) {
      toast.error('Missing QR details for PDF')
      return
    }
    setBusy('pdf')
    try {
      const dataUrl = await svgToPngDataUrl(svgRef.current, 2048)
      const blob = await generateQrPdf({
        name: qrName,
        shortUrl,
        destinationUrl,
        svgDataUrl: dataUrl,
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('PDF downloaded')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <DropdownMenu>
      {/* FIXED: Changed asChild to render */}
      <DropdownMenuTrigger 
        render={
          <Button variant={variant} size={size} className={className}>
            {busy ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          PNG (raster)
        </DropdownMenuLabel>
        {DOWNLOAD_SIZES.map((sizeOpt) => (
          <DropdownMenuItem
            key={sizeOpt.value}
            onClick={() => handlePng(sizeOpt.value)}
            disabled={busy !== null}
          >
            <Image className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <p className="text-sm">{sizeOpt.label}</p>
              <p className="text-xs text-muted-foreground">
                {sizeOpt.sublabel}
              </p>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Vector
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleSvg} disabled={busy !== null}>
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex-1">
            <p className="text-sm">SVG</p>
            <p className="text-xs text-muted-foreground">
              Infinitely scalable
            </p>
          </div>
        </DropdownMenuItem>

        {showPdf && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Print-ready
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handlePdf} disabled={busy !== null}>
              <FileText className="h-4 w-4 mr-2" />
              <div className="flex-1">
                <p className="text-sm">PDF with instructions</p>
                <p className="text-xs text-muted-foreground">
                  A4 · Ready to print
                </p>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}