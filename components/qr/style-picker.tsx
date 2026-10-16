'use client'

import { QR_STYLE_PRESETS, type QrStylePreset } from '@/lib/qr-styles'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'

interface StylePickerProps {
  value: string
  onChange: (preset: QrStylePreset) => void
}

export function StylePicker({ value, onChange }: StylePickerProps) {
  return (
    <div className="space-y-3">
      <Label>Quick styles</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {QR_STYLE_PRESETS.map((preset) => {
          const isSelected = value === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset)}
              className={cn(
                'relative flex flex-col items-start gap-1.5 p-3 rounded-lg border text-left transition-all hover:border-primary',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border'
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
              <div
                className="h-8 w-8 rounded-md border-2"
                style={{
                  backgroundColor: preset.backgroundColor,
                  borderColor: preset.foregroundColor,
                }}
              >
                <div
                  className="h-full w-full rounded-sm"
                  style={{
                    background: `radial-gradient(circle at 25% 25%, ${preset.foregroundColor} 30%, transparent 30%), radial-gradient(circle at 75% 75%, ${preset.foregroundColor} 30%, transparent 30%)`,
                  }}
                />
              </div>
              <div className="text-xs">
                <p className="font-medium">{preset.name}</p>
                <p className="text-muted-foreground line-clamp-1">
                  {preset.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}