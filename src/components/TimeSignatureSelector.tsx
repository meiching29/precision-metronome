import { TimeSignature } from '../types';

interface Props {
  value: TimeSignature;
  options: TimeSignature[];
  onChange: (ts: TimeSignature) => void;
  disabled?: boolean;
}

export function TimeSignatureSelector({ value, options, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-body text-xs tracking-[0.2em] uppercase text-obsidian-500">
        Time Signature
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(ts => (
          <button
            key={ts.label}
            onClick={() => onChange(ts)}
            disabled={disabled}
            className={`
              font-display text-sm px-3 py-1.5 rounded border transition-all duration-150
              ${value.label === ts.label
                ? 'bg-amber-500/10 border-amber-500/60 text-amber-400'
                : 'bg-obsidian-900 border-obsidian-700 text-obsidian-400 hover:border-obsidian-500 hover:text-obsidian-200'
              }
              disabled:opacity-40 disabled:cursor-not-allowed
            `}
          >
            {ts.label}
          </button>
        ))}
      </div>
    </div>
  );
}
