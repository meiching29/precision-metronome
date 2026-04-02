import { Volume1, Volume2, VolumeX } from 'lucide-react';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function VolumeControl({ value, onChange }: Props) {
  const Icon = value === 0 ? VolumeX : value < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-3">
      <Icon size={14} className="text-obsidian-500 flex-shrink-0" />
      <input
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 bpm-slider"
        style={{ '--track-color': '#6e6e5e' } as React.CSSProperties}
      />
      <span className="font-display text-xs text-obsidian-500 w-8 text-right">
        {Math.round(value * 100)}
      </span>
    </div>
  );
}
