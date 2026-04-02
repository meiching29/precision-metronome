import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';

interface Props {
  isPlaying: boolean;
  bpm: number;
  activeBeat: number;
  beatTick: number;
  isAccentBeat: boolean;
}

export function Pendulum({ isPlaying, beatTick, isAccentBeat }: Props) {
  const scale = useMotionValue(1);
  const springScale = useSpring(scale, { stiffness: 300, damping: 15 });

  useEffect(() => {
    if (!isPlaying || beatTick === 0) return;

    animate(scale, isAccentBeat ? 1.5 : 1.28, {
      duration: 0.07,
      ease: 'easeOut',
      onComplete: () => {
        animate(scale, 1, { duration: 0.28, ease: 'easeOut' });
      },
    });
  }, [beatTick, isPlaying, isAccentBeat, scale]); // beatTick SIEMPRE cambia

  useEffect(() => {
    if (!isPlaying) {
      animate(scale, 1, { duration: 0.4, ease: 'easeOut' });
    }
  }, [isPlaying, scale]);

  return (
    <div className="flex justify-center items-center h-28 mb-2">
      <div className="relative flex items-center justify-center">
        <motion.div
          style={{ scale: springScale }}
          className="absolute w-16 h-16 rounded-full border border-amber-500/20"
        />
        <motion.div
          style={{ scale: springScale }}
          className="absolute w-12 h-12 rounded-full border border-amber-500/30"
        />
        <motion.div
          style={{ scale: springScale }}
          className={`relative w-8 h-8 rounded-full transition-colors duration-75 ${isPlaying ? 'bg-amber-500 shadow-lg shadow-amber-500/40' : 'bg-obsidian-700'
            }`}
        >
          <div className="absolute inset-1 rounded-full bg-amber-300/20" />
        </motion.div>
      </div>
    </div>
  );
}
