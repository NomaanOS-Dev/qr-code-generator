'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  id?: string
  presets?: string[]
}

const DEFAULT_PRESETS = [
  '#000000',
  '#FFFFFF',
  '#2563EB',
  '#DC2626',
  '#059669',
  '#D97706',
  '#7C3AED',
  '#DB2777',
]

export function ColorPicker({
  label,
  value,
  onChange,
  id,
  presets = DEFAULT_PRESETS,
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="flex gap-2 items-center">
        {/* Native color input */}
        <div className="relative">
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div
            className="h-9 w-12 rounded-md border cursor-pointer"
            style={{ backgroundColor: value }}
          />
        </div>

        {/* Hex text input */}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono uppercase"
          maxLength={7}
        />
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              'h-6 w-6 rounded-full border-2 transition-all',
              value.toLowerCase() === preset.toLowerCase()
                ? 'border-primary ring-2 ring-primary/20 scale-110'
                : 'border-muted hover:scale-105'
            )}
            style={{ backgroundColor: preset }}
            aria-label={`Set color to ${preset}`}
          />
        ))}
      </div>
    </div>
  )
}