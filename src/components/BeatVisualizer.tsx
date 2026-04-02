import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  beats: number;
  activeBeat: number;
  isAccentBeat: boolean;
  isPlaying: boolean;
}

export function BeatVisualizer({ beats, activeBeat, isAccentBeat, isPlaying }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {Array.from({ length: beats }).map((_, i) => {
        const isActive = activeBeat === i && isPlaying;
        const isAccent = i === 0;

        return (
          <motion.div
            key={i}
            className="relative flex flex-col items-center gap-2"
          >
            {/* Beat number */}
            <span className={`font-display text-xs tracking-widest transition-colors duration-150 ${
              isActive ? 'text-amber-400' : 'text-obsidian-600'
            }`}>
              {i + 1}
            </span>

            {/* Beat dot */}
            <motion.div
              animate={
                isActive
                  ? {
                      scale: [1, isAccentBeat && isAccent ? 1.6 : 1.35, 1],
                      backgroundColor: isAccent
                        ? ['#92400e', '#f59e0b', '#92400e']
                        : ['#3f3f35', '#d97706', '#3f3f35'],
                    }
                  : { scale: 1 }
              }
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`rounded-full transition-colors ${
                isAccent
                  ? 'w-5 h-5 border-2 border-amber-700/60'
                  : 'w-4 h-4 border border-obsidian-600'
              }`}
              style={{
                backgroundColor: isActive
                  ? isAccent ? '#f59e0b' : '#d97706'
                  : isAccent ? '#78350f' : '#2a2a22',
              }}
            />

            {/* Accent pulse ring */}
            <AnimatePresence>
              {isActive && isAccent && (
                <motion.div
                  key="ring"
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute bottom-0 w-5 h-5 rounded-full border border-amber-400"
                  style={{ top: '50%', transform: 'translateY(50%)' }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
