import { useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  bpm: number;
  onChange: (bpm: number) => void;
  disabled?: boolean;
}

function tempoLabel(bpm: number): string {
  if (bpm < 60) return 'Largo';
  if (bpm < 66) return 'Larghetto';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 120) return 'Moderato';
  if (bpm < 156) return 'Allegro';
  if (bpm < 176) return 'Vivace';
  if (bpm < 200) return 'Presto';
  return 'Prestissimo';
}

export function BpmControl({ bpm, onChange, disabled }: Props) {
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    onChange(bpm + (e.deltaY < 0 ? 1 : -1));
  }, [bpm, onChange]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* BPM display */}
      <div className="relative select-none cursor-ns-resize" onWheel={onWheel} title="Scroll para ajustar BPM">
        <motion.div
          key={bpm}
          initial={{ y: -4, opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.12 }}
          className="flex items-end gap-2"
        >
          <span className="font-display text-[6rem] leading-none font-medium tracking-tighter text-amber-400">
            {bpm}
          </span>
          <span className="font-display text-xl text-obsidian-400 mb-4 tracking-widest uppercase">
            bpm
          </span>
        </motion.div>
      </div>

      {/* Tempo name */}
      <motion.span
        key={tempoLabel(bpm)}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-body text-sm tracking-[0.25em] uppercase text-obsidian-400"
      >
        {tempoLabel(bpm)}
      </motion.span>

      {/* Slider */}
      <div className="w-full flex items-center gap-3 mt-1">
        <span className="font-display text-xs text-obsidian-500">40</span>
        <input
          type="range"
          min={40}
          max={220}
          value={bpm}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 bpm-slider"
        />
        <span className="font-display text-xs text-obsidian-500">220</span>
      </div>
    </div>
  );
}