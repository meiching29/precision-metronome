import { useState, useRef, useEffect } from 'react';
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

import { audioEngine, AudioEngine } from './utils/audio-engine';

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
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((showInfo || showSettings) && window.innerWidth < 640) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showInfo, showSettings]);

  const handleTap = () => {
    tap();
    setTapFlash(true);
    setTimeout(() => setTapFlash(false), 120);
  };

  const closeAll = () => { setShowInfo(false); setShowSettings(false); };

  const handleToggle = async () => {
    try {
      const ctx = new AudioContext();
      await ctx.resume();
      await ctx.close();
    } catch { }
    toggle();
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-100 flex items-center justify-center p-4 selection:bg-amber-500/20">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#2a2a1a_0%,_#141410_60%)]" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 w-full max-w-3xl">

        {/* ── Card principal ── */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="flex justify-between items-start w-full px-1">
            <div>
              <h1 className="font-display text-sm tracking-[0.3em] uppercase text-obsidian-400">Precision</h1>
              <h2 className="font-display text-lg tracking-[0.15em] text-obsidian-100">Metronome</h2>
            </div>
            {/* Mobile Buttons */}
            <div className="flex sm:hidden gap-2">
              <button
                onClick={() => { setShowInfo(v => !v); setShowSettings(false); }}
                className={`icon-btn ${showInfo ? 'text-amber-400 border-amber-500/40' : ''}`}
                title="Info"
              >
                <Info size={15} />
              </button>
              <button
                onClick={() => { setShowSettings(v => !v); setShowInfo(false); }}
                className={`icon-btn ${showSettings ? 'text-amber-400 border-amber-500/40' : ''}`}
                title="Settings"
              >
                <Settings size={15} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-obsidian-800 bg-obsidian-900/60 backdrop-blur-sm p-6 flex flex-col gap-5 shadow-2xl">
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

            <div className="flex max-sm:flex-col gap-3">
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
                onClick={handleToggle}
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
        <div className="relative flex flex-col items-start gap-2 sm:pt-1 w-full sm:w-auto">

          {/* Botones Desktop */}
          <div className="hidden sm:flex flex-col gap-2">
            <button
              onClick={() => { setShowInfo(v => !v); setShowSettings(false); }}
              className={`icon-btn ${showInfo ? 'text-amber-400 border-amber-500/40' : ''}`}
              title="Info"
            >
              <Info size={15} />
            </button>
            <button
              onClick={() => { setShowSettings(v => !v); setShowInfo(false); }}
              className={`icon-btn ${showSettings ? 'text-amber-400 border-amber-500/40' : ''}`}
              title="Settings"
            >
              <Settings size={15} />
            </button>
          </div>

          {/* Panel */}
          <AnimatePresence>
            {(showInfo || showSettings) && (
              <motion.div
                ref={panelRef}
                key={showInfo ? 'info' : 'settings'}
                initial={{ opacity: 0, x: 0, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 0, y: 10 }}
                transition={{ duration: 0.18 }}
                className="relative w-full sm:absolute sm:top-0 sm:left-[3.5rem] sm:w-72 rounded-2xl border border-obsidian-800 bg-obsidian-900/98 backdrop-blur-sm shadow-2xl flex flex-col overflow-hidden z-30"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-obsidian-800">
                  <span className="font-display text-xs tracking-[0.2em] uppercase text-obsidian-400">
                    {showInfo ? 'Info' : 'Settings'}
                  </span>
                  <button
                    onClick={closeAll}
                    className="text-obsidian-500 hover:text-obsidian-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[80vh] sm:max-h-[85vh]">
                  {showInfo && (
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3 items-start">
                        <Play size={13} className="text-amber-400 mt-1 flex-shrink-0" fill="currentColor" />
                        <div>
                          <p className="font-body text-xs text-obsidian-200 font-medium mb-1">Start / Stop</p>
                          <p className="font-body text-xs text-obsidian-500 leading-relaxed">Starts or stops the metronome.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <Hand size={13} className="text-amber-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-body text-xs text-obsidian-200 font-medium mb-1">Tap Tempo</p>
                          <p className="font-body text-xs text-obsidian-500 leading-relaxed">Tap the button to the rhythm of a song to automatically detect the BPM.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <SlidersHorizontal size={13} className="text-amber-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-body text-xs text-obsidian-200 font-medium mb-1">Adjust BPM</p>
                          <p className="font-body text-xs text-obsidian-500 leading-relaxed">Move the slider or use the mouse wheel over the number to change the tempo.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <Music size={13} className="text-amber-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-body text-xs text-obsidian-200 font-medium mb-1">Time Signature</p>
                          <p className="font-body text-xs text-obsidian-500 leading-relaxed">Choose the time signature in Settings. The first beat is always accented.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <TrendingUp size={13} className="text-amber-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-body text-xs text-obsidian-200 font-medium mb-1">Practice Mode</p>
                          <p className="font-body text-xs text-obsidian-500 leading-relaxed">Automatically increases the BPM every N bars. Ideal for progressively practicing difficult passages.</p>
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
                          Volume
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