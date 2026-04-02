import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface Props {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  increment: number;
  onIncrementChange: (v: number) => void;
  bars: number;
  onBarsChange: (v: number) => void;
  targetBpm: number;
  onTargetChange: (v: number) => void;
  currentBpm: number;
}

export function PracticeMode({
  enabled, onToggle,
  increment, onIncrementChange,
  bars, onBarsChange,
  targetBpm, onTargetChange,
  currentBpm,
}: Props) {
  return (
    <div className="rounded-xl border border-obsidian-700 overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => onToggle(!enabled)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors duration-150 ${
          enabled ? 'bg-amber-500/10' : 'bg-obsidian-900/50 hover:bg-obsidian-800/50'
        }`}
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className={enabled ? 'text-amber-400' : 'text-obsidian-500'} />
          <span className={`font-body text-sm ${enabled ? 'text-amber-400' : 'text-obsidian-400'}`}>
            Practice Mode
          </span>
        </div>
        {/* Toggle pill */}
        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
          enabled ? 'bg-amber-500' : 'bg-obsidian-700'
        }`}>
          <motion.div
            animate={{ x: enabled ? 16 : 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
          />
        </div>
      </button>

      {/* Options */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 grid grid-cols-3 gap-4 border-t border-obsidian-700/50">
              <div className="flex flex-col gap-1">
                <label className="font-body text-xs text-obsidian-500">+BPM every</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1} max={20}
                    value={increment}
                    onChange={e => onIncrementChange(Number(e.target.value))}
                    className="practice-input"
                  />
                  <span className="font-display text-xs text-obsidian-500">bpm</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-body text-xs text-obsidian-500">after N bars</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1} max={32}
                    value={bars}
                    onChange={e => onBarsChange(Number(e.target.value))}
                    className="practice-input"
                  />
                  <span className="font-display text-xs text-obsidian-500">bars</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-body text-xs text-obsidian-500">target</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={currentBpm} max={220}
                    value={targetBpm}
                    onChange={e => onTargetChange(Number(e.target.value))}
                    className="practice-input"
                  />
                  <span className="font-display text-xs text-obsidian-500">bpm</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
