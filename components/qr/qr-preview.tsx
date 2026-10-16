'use client'

import { QRCodeSVG } from 'qrcode.react'
import { forwardRef } from 'react'

interface QrPreviewProps {
  value: string
  foregroundColor: string
  backgroundColor: string
  logoUrl?: string | null
  size?: number
  marginSize?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  logoSizePercent?: number
}

export const QrPreview = forwardRef<SVGSVGElement, QrPreviewProps>(
  function QrPreview(
    {
      value,
      foregroundColor,
      backgroundColor,
      logoUrl,
      size = 256,
      marginSize = 4,
      errorCorrectionLevel = 'H',
      logoSizePercent = 20,
    },
    ref
  ) {
    if (!value) {
      return (
        <div
          className="flex items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground"
          style={{ width: size, height: size }}
        >
          Enter a URL to see preview
        </div>
      )
    }

    const logoPixels = Math.round((size * logoSizePercent) / 100)

    return (
      <div
        className="relative inline-block rounded-lg overflow-hidden"
        style={{
          width: size,
          height: size,
          backgroundColor,
        }}
      >
        <QRCodeSVG
          ref={ref}
          value={value}
          size={size}
          fgColor={foregroundColor}
          bgColor={backgroundColor}
          level={errorCorrectionLevel}
          marginSize={marginSize}
          imageSettings={
            logoUrl
              ? {
                  src: logoUrl,
                  height: logoPixels,
                  width: logoPixels,
                  excavate: true,
                }
              : undefined
          }
          className="w-full h-full"
        />
      </div>
    )
  }
)