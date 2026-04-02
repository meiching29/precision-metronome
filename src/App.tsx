import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Hand, Settings, Info, X, SlidersHorizontal, Music, TrendingUp } from 'lucide-react';

import { useMetronome } from './hooks/useMetronome';
import { BpmControl } from './components/BpmControl';
import { BeatVisualizer } from './components/BeatVisualizer';
import { Pendulum } from './components/Pendulum';
import { TimeSignatureSelector } from './components/TimeSignatureSelector';
import { SoundSelector } from './components/SoundSelector';
import { VolumeControl } from './components/VolumeControl';
import { PracticeMode } from './components/PracticeMode';

export default function App() {
  const {
    config, isPlaying, activeBeat, isAccentBeat, beatTick,
    toggle, tap,
    setBpm, setTimeSignature, setSoundType, setVolume,
    setPracticeMode, setPracticeIncrement, setPracticeBars, setPracticeTargetBpm,
    timeSignatures,
  } = useMetronome();

  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [tapFlash, setTapFlash] = useState(false);

  const handleTap = () => {
    tap();
    setTapFlash(true);
    setTimeout(() => setTapFlash(false), 120);
  };

  const closeAll = () => { setShowInfo(false); setShowSettings(false); };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-100 flex items-center justify-center p-4 selection:bg-amber-500/20">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#2a2a1a_0%,_#141410_60%)]" />
      </div>

      <div className="relative z-10 flex items-start justify-center gap-3 w-full max-w-3xl">

        {/* ── Card principal ── */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div>
            <h1 className="font-display text-sm tracking-[0.3em] uppercase text-obsidian-400">Precision</h1>
            <h2 className="font-display text-lg tracking-[0.15em] text-obsidian-100">Metronome</h2>
          </div>

          <div className="rounded-2xl border border-obsidian-800 bg-obsidian-900/60 backdrop-blur-sm p-6 flex flex-col gap-5 shadow-2xl">

            {/* Pendulum recibe beatTick e isAccentBeat */}
            <Pendulum
              isPlaying={isPlaying}
              bpm={config.bpm}
              activeBeat={activeBeat}
              beatTick={beatTick}
              isAccentBeat={isAccentBeat}
            />

            <BeatVisualizer
              beats={config.timeSignature.beats}
              activeBeat={activeBeat}
              isAccentBeat={isAccentBeat}
              isPlaying={isPlaying}
            />

            <div className="h-px bg-obsidian-800" />
            <BpmControl bpm={config.bpm} onChange={setBpm} />
            <div className="h-px bg-obsidian-800" />

            <div className="flex gap-3">
              <motion.button
                onClick={handleTap}
                animate={{ backgroundColor: tapFlash ? 'rgba(245,158,11,0.15)' : 'transparent' }}
                transition={{ duration: 0.1 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-obsidian-700 hover:border-obsidian-500 text-obsidian-400 hover:text-obsidian-200 transition-colors duration-150"
              >
                <Hand size={15} />
                <span className="font-body text-sm">Tap</span>
              </motion.button>

              <motion.button
                onClick={toggle}
                whileTap={{ scale: 0.95 }}
                className={`flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl font-body text-sm font-medium transition-all duration-200 ${isPlaying
                  ? 'bg-obsidian-800 border border-obsidian-600 text-obsidian-200 hover:bg-obsidian-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-obsidian-950 shadow-lg shadow-amber-500/20'
                  }`}
              >
                {isPlaying
                  ? <><Pause size={16} /> Stop</>
                  : <><Play size={16} fill="currentColor" /> Start</>
                }
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Columna derecha: botones + panel ── */}
        <div className="relative flex flex-col items-start gap-2 pt-1">

          {/* Botón Info */}
          <button
            onClick={() => { setShowInfo(v => !v); setShowSettings(false); }}
            className={`icon-btn ${showInfo ? 'text-amber-400 border-amber-500/40' : ''}`}
            title="Info"
          >
            <Info size={15} />
          </button>

          {/* Botón Settings */}
          <button
            onClick={() => { setShowSettings(v => !v); setShowInfo(false); }}
            className={`icon-btn ${showSettings ? 'text-amber-400 border-amber-500/40' : ''}`}
            title="Configuración"
          >
            <Settings size={15} />
          </button>

          {/* Panel — sale a la DERECHA de los botones */}
          <AnimatePresence>
            {(showInfo || showSettings) && (
              <motion.div
                key={showInfo ? 'info' : 'settings'}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                className="absolute top-0 left-10 w-72 rounded-2xl border border-obsidian-800 bg-obsidian-900/98 backdrop-blur-sm shadow-2xl flex flex-col overflow-hidden z-30 sm:left-10 sm:top-0 max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:top-auto max-sm:bottom-4 max-sm:w-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-obsidian-800">
                  <span className="font-display text-xs tracking-[0.2em] uppercase text-obsidian-400">
                    {showInfo ? 'Info' : 'Configuración'}
                  </span>
                  <button
                    onClick={closeAll}
                    className="text-obsidian-500 hover:text-obsidian-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
                  {showInfo && (
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3 items-start">
                        <Play size={13} className="text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" />
                        <div>
                          <p className="font-body text-xs text-obsidian-200 font-medium mb-0.5">Start / Stop</p>
                          <p className="font-body text-xs text-obsidian-500 leading-relaxed">Inicia o detiene el metrónomo.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <Hand size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-body text-xs text-obsidian-200 font-medium mb-0.5">Tap Tempo</p>
                          <p className="font-body text-xs text-obsidian-500 leading-relaxed">Toca el botón Tap al ritmo de una canción para detectar el BPM automáticamente.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <SlidersHorizontal size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-body text-xs text-obsidian-200 font-medium mb-0.5">Ajustar BPM</p>
                          <p className="font-body text-xs text-obsidian-500 leading-relaxed">Mueve el slider o usa la rueda del mouse sobre el número para cambiar el tempo.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <Music size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-body text-xs text-obsidian-200 font-medium mb-0.5">Compás</p>
                          <p className="font-body text-xs text-obsidian-500 leading-relaxed">Elige el compás en Configuración. El primer golpe siempre suena acentuado.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <TrendingUp size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-body text-xs text-obsidian-200 font-medium mb-0.5">Practice Mode</p>
                          <p className="font-body text-xs text-obsidian-500 leading-relaxed">Sube el BPM automáticamente cada N compases. Ideal para estudiar pasajes difíciles progresivamente.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showSettings && (
                    <>
                      <TimeSignatureSelector
                        value={config.timeSignature}
                        options={timeSignatures}
                        onChange={setTimeSignature}
                      />
                      <div className="h-px bg-obsidian-800" />
                      <SoundSelector value={config.soundType} onChange={setSoundType} />
                      <div className="h-px bg-obsidian-800" />
                      <div className="flex flex-col gap-2">
                        <label className="font-body text-xs tracking-[0.2em] uppercase text-obsidian-500">
                          Volumen
                        </label>
                        <VolumeControl value={config.volume} onChange={setVolume} />
                      </div>
                      <div className="h-px bg-obsidian-800" />
                      <PracticeMode
                        enabled={config.practiceMode}
                        onToggle={setPracticeMode}
                        increment={config.practiceIncrement}
                        onIncrementChange={setPracticeIncrement}
                        bars={config.practiceBars}
                        onBarsChange={setPracticeBars}
                        targetBpm={config.practiceTargetBpm}
                        onTargetChange={setPracticeTargetBpm}
                        currentBpm={config.bpm}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}