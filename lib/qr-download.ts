/**
 * Download an SVG element as an SVG file.
 */
export function downloadSvg(svgElement: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)

  const blob = new Blob(
    ['<?xml version="1.0" standalone="no"?>\r\n', svgString],
    { type: 'image/svg+xml;charset=utf-8' }
  )

  triggerDownload(blob, `${filename}.svg`)
}

/**
 * Convert SVG element to a PNG data URL.
 */
export async function svgToPngDataUrl(
  svgElement: SVGSVGElement,
  size: number = 1024
): Promise<string> {
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)

  const svgBlob = new Blob([svgString], {
    type: 'image/svg+xml;charset=utf-8',
  })
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

  // White background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, size, size)
  ctx.drawImage(img, 0, 0, size, size)

  URL.revokeObjectURL(url)

  return canvas.toDataURL('image/png')
}

/**
 * Download an SVG element as a PNG file at the given size.
 */
export async function downloadPng(
  svgElement: SVGSVGElement,
  filename: string,
  size: number = 1024
) {
  const dataUrl = await svgToPngDataUrl(svgElement, size)

  // Convert data URL to blob
  const res = await fetch(dataUrl)
  const blob = await res.blob()

  triggerDownload(blob, `${filename}.png`)
}

/**
 * Internal helper — triggers a browser download of a blob.
 */
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Sanitize a name for use as a filename.
 */
export function safeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}