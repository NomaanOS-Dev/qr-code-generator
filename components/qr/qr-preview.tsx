'use client'

import { QRCodeSVG } from 'qrcode.react'
import { forwardRef } from 'react'

interface QrPreviewProps {
  value: string
  foregroundColor: string
  backgroundColor: string
  logoUrl?: string | null
  size?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

export const QrPreview = forwardRef<SVGSVGElement, QrPreviewProps>(
  function QrPreview(
    {
      value,
      foregroundColor,
      backgroundColor,
      logoUrl,
      size = 256,
      errorCorrectionLevel = 'H', // High error correction — needed for logos
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
          marginSize={4}
          imageSettings={
            logoUrl
              ? {
                  src: logoUrl,
                  height: size * 0.2, // 20% of QR size
                  width: size * 0.2,
                  excavate: true, // Clear the modules behind the logo
                }
              : undefined
          }
          className="w-full h-full"
        />
      </div>
    )
  }
)