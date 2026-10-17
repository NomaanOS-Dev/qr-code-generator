import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { safeFilename } from './qr-download'

interface QrForZip {
  id: string
  name: string
  slug: string
  foreground_color: string | null
  background_color: string | null
  logo_path: string | null
  margin: number | null
  error_correction: string | null
  logo_size_percent: number | null
}

/**
 * Convert SVG string to PNG blob using canvas.
 */
async function svgStringToPngBlob(
  svgString: string,
  size: number,
  backgroundColor: string
): Promise<Blob> {
  const svgBlob = new Blob(
    ['<?xml version="1.0" standalone="no"?>\r\n', svgString],
    { type: 'image/svg+xml;charset=utf-8' }
  )
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.crossOrigin = 'anonymous'

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load SVG'))
    img.src = url
  })

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    URL.revokeObjectURL(url)
    throw new Error('Canvas not supported')
  }

  // Paint background (respect the QR's own background color)
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, size, size)
  ctx.drawImage(img, 0, 0, size, size)

  URL.revokeObjectURL(url)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png', 1.0)
  )
  if (!blob) throw new Error('Failed to create PNG')
  return blob
}

/**
 * Generate SVG string for a QR code without a DOM element.
 */
function generateSvgString(
  qr: QrForZip,
  appUrl: string,
  size: number
): string {
  const shortUrl = `${appUrl}/r/${qr.slug}`
  const fgColor = qr.foreground_color ?? '#000000'
  const bgColor = qr.background_color ?? '#FFFFFF'
  const errorLevel = (qr.error_correction ?? 'H') as 'L' | 'M' | 'Q' | 'H'
  const marginSize = qr.margin ?? 4
  const logoSizePercent = qr.logo_size_percent ?? 20
  const logoPixels = Math.round((size * logoSizePercent) / 100)

  const element = createElement(QRCodeSVG, {
    value: shortUrl,
    size,
    fgColor,
    bgColor,
    level: errorLevel,
    marginSize,
    imageSettings: qr.logo_path
      ? {
          src: qr.logo_path,
          height: logoPixels,
          width: logoPixels,
          excavate: true,
        }
      : undefined,
  })

  return renderToStaticMarkup(element)
}

/**
 * Build a ZIP of PNG (1024px) + SVG for each QR code.
 */
export async function downloadQrBatchAsZip(
  qrCodes: QrForZip[],
  appUrl: string
): Promise<void> {
  const zip = new JSZip()

  for (const qr of qrCodes) {
    const baseName = safeFilename(qr.name || qr.slug)
    const size = 1024
    const bgColor = qr.background_color ?? '#FFFFFF'

    // SVG
    const svgString = generateSvgString(qr, appUrl, size)
    zip.file(`${baseName}.svg`, svgString)

    // PNG
    try {
      const pngBlob = await svgStringToPngBlob(svgString, size, bgColor)
      zip.file(`${baseName}.png`, pngBlob)
    } catch (err) {
      console.error(`Failed to render PNG for ${qr.name}:`, err)
      // Continue with other QRs — one failure shouldn't kill the batch
    }
  }

  // README
  const readme = [
    'ScanFlow — Bulk QR Code Download',
    '================================',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Total QR codes: ${qrCodes.length}`,
    '',
    'Each QR code has:',
    '  - PNG (1024×1024) for digital use',
    '  - SVG (vector) for print at any size',
    '',
    'Tips:',
    '  - Test before printing at scale.',
    '  - Minimum 2cm × 2cm for reliable scanning.',
    '  - Keep good contrast between foreground and background.',
    '',
  ].join('\n')

  zip.file('README.txt', readme)

  const blob = await zip.generateAsync({ type: 'blob' })
  const filename = `scanflow-qr-codes-${new Date()
    .toISOString()
    .slice(0, 10)}.zip`
  saveAs(blob, filename)
}