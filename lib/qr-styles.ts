export interface QrStylePreset {
  id: 'default' | 'bold' | 'minimal' | 'rounded' | 'dots' | 'branded'
  name: string
  description: string
  foregroundColor: string
  backgroundColor: string
  margin: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  logoSizePercent?: number
}

export const QR_STYLE_PRESETS: QrStylePreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Classic black & white — maximum contrast',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    margin: 4,
    errorCorrection: 'M',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'High-contrast with dark navy',
    foregroundColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    margin: 4,
    errorCorrection: 'Q',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Light grey foreground — subtle look',
    foregroundColor: '#475569',
    backgroundColor: '#FFFFFF',
    margin: 6,
    errorCorrection: 'H',
  },
  {
    id: 'rounded',
    name: 'Rounded',
    description: 'Soft blue with rounded dots',
    foregroundColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    margin: 4,
    errorCorrection: 'Q',
  },
  {
    id: 'dots',
    name: 'Playful',
    description: 'Warm purple with dot pattern',
    foregroundColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
    margin: 5,
    errorCorrection: 'Q',
  },
  {
    id: 'branded',
    name: 'Branded',
    description: 'Designed for logo placement — highest recovery',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    margin: 4,
    errorCorrection: 'H',
    logoSizePercent: 20,
  },
]

export const ERROR_CORRECTION_LEVELS = [
  {
    value: 'L' as const,
    label: 'Low (7%)',
    description: 'Smallest QR code, minimal damage resistance',
  },
  {
    value: 'M' as const,
    label: 'Medium (15%)',
    description: 'Balanced — good for clean printing',
  },
  {
    value: 'Q' as const,
    label: 'Quartile (25%)',
    description: 'Good for logos and slight wear',
  },
  {
    value: 'H' as const,
    label: 'High (30%)',
    description: 'Best for logos — required for maximum recovery',
  },
]

export const DOWNLOAD_SIZES = [
  { value: 512, label: '512 × 512 px', sublabel: 'Small / digital' },
  { value: 1024, label: '1024 × 1024 px', sublabel: 'Standard (recommended)' },
  { value: 2048, label: '2048 × 2048 px', sublabel: 'Large / posters' },
  { value: 4096, label: '4096 × 4096 px', sublabel: 'Print / billboards' },
]