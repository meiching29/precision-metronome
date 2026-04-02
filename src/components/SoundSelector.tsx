import { SoundType } from '../types';

interface Props {
  value: SoundType;
  onChange: (s: SoundType) => void;
}

const SOUNDS: { id: SoundType; label: string; icon: string }[] = [
  { id: 'click',     label: 'Click',     icon: '◎' },
  { id: 'woodblock', label: 'Wood',      icon: '⬡' },
  { id: 'hihat',     label: 'Hi-Hat',    icon: '✦' },
];

export function SoundSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-body text-xs tracking-[0.2em] uppercase text-obsidian-500">
        Sound
      </label>
      <div className="flex gap-2">
        {SOUNDS.map(s => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`
              flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded border transition-all duration-150
              ${value === s.id
                ? 'bg-amber-500/10 border-amber-500/60 text-amber-400'
                : 'bg-obsidian-900 border-obsidian-700 text-obsidian-400 hover:border-obsidian-500 hover:text-obsidian-200'
              }
            `}
          >
            <span className="text-base">{s.icon}</span>
            <span className="font-body text-xs">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
