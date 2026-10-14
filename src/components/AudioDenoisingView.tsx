import React, { useState, useEffect, useRef } from 'react';
import { HistoryItem } from '../types';
import { playDamagedAudio, playCleanAudio, stopAllAudio, createDenoisedWavBlob } from '../utils/audioSynth';

interface AudioDenoisingViewProps {
  onShowToast: (text: string) => void;
  onAddHistory: (item: HistoryItem) => void;
}

export const AudioDenoisingView: React.FC<AudioDenoisingViewProps> = ({
  onShowToast,
  onAddHistory,
}) => {
  // State
  const [inspectMode, setInspectMode] = useState<'side-by-side' | 'corrupted-only' | 'cleaned-only'>('side-by-side');
  const [filterPreset, setFilterPreset] = useState<'aggressive' | 'balanced' | 'subtle'>('aggressive');
  const [harmonicPreservation, setHarmonicPreservation] = useState<boolean>(true);
  const [hifiGan, setHifiGan] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);

  // Audio Playback states
  const [isPlayingDamaged, setIsPlayingDamaged] = useState<boolean>(false);
  const [isPlayingClean, setIsPlayingClean] = useState<boolean>(false);
  const [damagedTime, setDamagedTime] = useState<number>(6.4);
  const [cleanTime, setCleanTime] = useState<number>(6.4);
  const totalAudioTime = 24.18;

  const timerRef = useRef<number | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleDamagedAudio = () => {
    if (isPlayingDamaged) {
      stopAllAudio();
      setIsPlayingDamaged(false);
    } else {
      setIsPlayingClean(false);
      setIsPlayingDamaged(true);
      playDamagedAudio();
      onShowToast('Auditioning raw solar flare plasma static');
    }
  };

  const toggleCleanAudio = () => {
    if (isPlayingClean) {
      stopAllAudio();
      setIsPlayingClean(false);
    } else {
      setIsPlayingDamaged(false);
      setIsPlayingClean(true);
      playCleanAudio();
      onShowToast('Auditioning reconstructed 1.420 GHz hydrogen tone');
    }
  };

  const handleDenoise = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProgress(15);

    let cur = 15;
    const interval = setInterval(() => {
      cur += Math.floor(Math.random() * 25) + 15;
      if (cur >= 100) {
        clearInterval(interval);
        setProgress(100);
        setIsProcessing(false);
        onShowToast('Spectral audio denoising complete: +42.8 dB gain restored');

        onAddHistory({
          id: `ASTRA-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
          filename: 'voyager_plasma_signal_ch2.wav',
          hashId: 'SHA-256: 3a9f...d482e',
          size: '8.2 MB',
          technique: 'STFT U-Net GAN Denoising',
          modality: 'audio',
          timestamp: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'Completed',
          metrics: '+42.8 dB Noise Reduced · Dropouts Infilled',
        });
      } else {
        setProgress(cur);
      }
    }, 180);
  };

  const handleDownloadWav = () => {
    const blob = createDenoisedWavBlob(4);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VOYAGER_PLASMA_CH2_DENOISED_24BIT.wav';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded VOYAGER_PLASMA_CH2_DENOISED_24BIT.wav');
  };

  const handleDownloadReport = () => {
    const report = {
      carrierId: 'voyager_plasma_signal_ch2.wav',
      dsnStation: 'Goldstone 8.4 GHz Receiver',
      samplingRate: '96 kHz / 24-bit PCM',
      snrInitialDb: -14.2,
      snrFinalDb: 28.6,
      snrDeltaDb: 42.8,
      pesqScore: 4.12,
      stoiScore: 0.94,
      sdrDb: 31.4,
      model: 'CosmoWave v2.4 U-Net (PyTorch/TRT)',
      latencyMs: 640,
      sha256: '3a9f1b7c...d482e',
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VOYAGER_SPECTRAL_DENOISING_REPORT.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded Audio Telemetry Diagnostic Report (JSON)');
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Screen Header & Telemetry Badges */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-4 pb-6">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-primary font-label-caps text-xs tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
              NEURAL SPECTRAL DENOISING
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-xs">
              <span className="material-symbols-outlined text-xs text-primary">satellite_alt</span>
              Deep-Space Plasma Radio Relays
            </span>
          </div>
          <h1 className="font-display-hero text-3xl md:text-5xl text-on-surface tracking-tight mt-1 font-bold">
            Audio{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary">
              Denoising
            </span>
          </h1>
          <p className="font-body-lg text-sm md:text-base text-on-surface-variant max-w-xl">
            Purge solar flare static, cosmic ray interference, and ionospheric plasma noise from deep-space radio transmissions using latent STFT-GAN architectures.
          </p>
        </div>

        {/* Real-time Stat Badges Deck */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 bg-surface-container-lowest/80 backdrop-blur-xl p-3 rounded-2xl border border-primary/15 shadow-xl">
          {/* SNR Delta */}
          <div className="flex flex-col px-3 py-2 rounded-xl bg-surface-container-low border border-surface-variant/30">
            <span className="text-[10px] text-outline tracking-wider uppercase font-semibold">SIGNAL-TO-NOISE RATIO</span>
            <div className="flex items-baseline gap-1.5 mt-0.5 font-mono">
              <span className="text-sm text-error font-semibold">-14.2</span>
              <span className="text-outline text-xs">→</span>
              <span className="text-sm text-primary font-bold">+28.6 dB</span>
            </div>
            <span className="text-[11px] text-primary-container font-medium mt-0.5">+42.8 dB Gain Restored</span>
          </div>

          {/* Latency */}
          <div className="flex flex-col px-3 py-2 rounded-xl bg-surface-container-low border border-surface-variant/30">
            <span className="text-[10px] text-outline tracking-wider uppercase font-semibold">LATENCY</span>
            <div className="flex items-baseline gap-1 mt-0.5 font-mono">
              <span className="text-sm text-on-surface font-bold">0.64</span>
              <span className="text-xs text-on-surface-variant">sec</span>
            </div>
            <span className="text-[11px] text-primary font-medium mt-0.5">18.2× Real-Time</span>
          </div>

          {/* Checkpoint */}
          <div className="flex flex-col px-3 py-2 rounded-xl bg-surface-container-low min-w-[150px] border border-surface-variant/30">
            <span className="text-[10px] text-outline tracking-wider uppercase font-semibold">MODEL CHECKPOINT</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="material-symbols-outlined text-sm text-primary">memory</span>
              <span className="text-xs text-on-surface font-semibold truncate">CosmoWave</span>
            </div>
            <span className="text-[11px] text-secondary font-medium mt-0.5">v2.4 U-Net (PyTorch/TRT)</span>
          </div>
        </div>
      </section>

      {/* Main Workspace (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Inputs & Synthesis Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* CARD 1: Damaged Audio Transmission */}
          <div className="bg-surface-container/60 backdrop-blur-2xl rounded-2xl p-5 border border-primary/15 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error">graphic_eq</span>
                <h2 className="text-sm text-on-surface font-semibold">Damaged Transmission</h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container/40 text-error text-[10px] tracking-wider uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-error" />
                HIGH-ENERGY PLASMA STATIC
              </span>
            </div>

            {/* Corrupted Audio File Info */}
            <div className="flex items-center justify-between p-3 bg-surface-container-lowest/90 rounded-xl mb-3 border border-surface-variant/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-error">
                  <span className="material-symbols-outlined text-[22px]">audio_file</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-on-surface truncate font-semibold font-mono">
                    voyager_plasma_signal_ch2.wav
                  </span>
                  <span className="text-[11px] text-on-surface-variant truncate">
                    8.2 MB • Raw DSN Goldstone 8.4 GHz Carrier
                  </span>
                </div>
              </div>
              <button
                onClick={() => onShowToast('Reset carrier track to Voyager 2 channel')}
                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg hover:bg-surface-container-high shrink-0 ml-2 cursor-pointer"
                title="Reset Audio Track"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>
            </div>

            {/* Mini Corrupted Waveform Preview */}
            <div className="relative w-full h-20 bg-surface-container-lowest rounded-xl p-2.5 flex items-center justify-between gap-0.5 overflow-hidden mb-3 border border-surface-variant/30">
              <div className="flex items-end justify-between w-full h-full gap-[2px]">
                {[20, 45, 92, 100, 80, 95, 35, 100, 88, 30, 98, 85, 50, 92, 100, 94, 65, 90, 40, 85, 98, 32, 89, 95, 45, 90, 100, 75, 94, 38, 96, 82, 22].map(
                  (h, idx) => (
                    <div
                      key={idx}
                      className="w-1 bg-error rounded-full transition-all duration-300"
                      style={{
                        height: `${h}%`,
                        opacity: h > 80 ? 1 : 0.5,
                      }}
                    />
                  )
                )}
              </div>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-surface-container-high/90 text-error font-mono text-[9px] tracking-wider border border-error/20">
                CORRUPTED BURST: +14.2 dB NOISE FLOOR
              </div>
            </div>

            {/* Signal Alert Message */}
            <div className="p-3 rounded-xl bg-error-container/20 flex items-start gap-2 border border-error/20">
              <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">warning</span>
              <p className="text-xs text-on-surface-variant leading-snug">
                <strong className="text-error font-medium">Severe Plasma Distortion Detected:</strong> 72% of packet carrier flooded with solar wind turbulence between 00:04.10 and 00:18.50. Carrier modulation unreadable without STFT synthesis.
              </p>
            </div>
          </div>



          {/* CARD 3: Denoising Matrix & Filter Parameters */}
          <div className="bg-surface-container/60 backdrop-blur-2xl rounded-2xl p-5 border border-primary/15 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                <h2 className="text-sm text-on-surface font-semibold">Denoising Matrix & Filters</h2>
              </div>
              <span className="font-mono text-xs text-primary uppercase tracking-wider">Inference Tuner</span>
            </div>

            {/* Noise Threshold Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-medium">Noise Threshold Severity Preset</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-container-lowest border border-surface-variant/40">
                {(
                  [
                    { id: 'aggressive', title: 'Aggressive', desc: '(Deep Space)' },
                    { id: 'balanced', title: 'Balanced', desc: '(Standard Orbit)' },
                    { id: 'subtle', title: 'Subtle', desc: '(Planetary Flyby)' },
                  ] as const
                ).map((preset) => {
                  const isSelected = filterPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setFilterPreset(preset.id)}
                      className={`px-2 py-2 rounded-lg text-xs transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(34,211,238,0.3)] font-semibold'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {preset.title}
                      <br />
                      <span className="text-[10px] opacity-80">{preset.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Harmonic Carrier Preservation Toggle */}
            <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-surface-variant/30">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface font-medium">Harmonic Carrier Preservation</span>
                <span className="text-[11px] text-outline">Protects weak sinusoidal telemetry pulses from attenuation</span>
              </div>
              <button
                onClick={() => setHarmonicPreservation(!harmonicPreservation)}
                className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ml-2 ${
                  harmonicPreservation ? 'bg-primary-container justify-end' : 'bg-surface-container-highest justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-on-primary-container shadow-md" />
              </button>
            </div>

            {/* HiFi-GAN Phase Synthesizer */}
            <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-surface-variant/30">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface font-medium">HiFi-GAN Phase Synthesizer</span>
                <span className="text-[11px] text-outline">Reconstructs STFT phase spectrogram artifacts</span>
              </div>
              <button
                onClick={() => setHifiGan(!hifiGan)}
                className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ml-2 ${
                  hifiGan ? 'bg-primary-container justify-end' : 'bg-surface-container-highest justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-on-primary-container shadow-md" />
              </button>
            </div>

            {/* Primary Execution CTA */}
            <button
              onClick={handleDenoise}
              disabled={isProcessing}
              className={`relative group w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary text-on-primary text-xs tracking-wide uppercase transition-all duration-300 shadow-[0_0_28px_rgba(34,211,238,0.35)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${
                isProcessing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span className={`material-symbols-outlined text-lg ${isProcessing ? 'animate-spin' : ''}`}>
                {isProcessing ? 'sync' : 'auto_fix_high'}
              </span>
              <span className="font-bold">
                {isProcessing ? 'Filtering Spectral Noise...' : '✦ Denoise Audio Transmission'}
              </span>
            </button>

            {/* Processing Status Bar */}
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-container" />
                  {isProcessing ? 'STFT Inversion Running...' : 'Reconstruction Completed'}
                </span>
                <span className="text-primary font-mono font-bold">{progress}% Complete</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-primary-container to-secondary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] text-outline truncate mt-0.5">
                Telemetry packet stream reconstructed • PESQ 4.12 • Spectral Flatness Restored
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Dual Audio Players & Spectral Inspection (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* CARD 1: Dual-Stream Acoustic Inspection & Players */}
          <div className="bg-surface-container/60 backdrop-blur-2xl rounded-2xl p-5 border border-primary/15 shadow-xl flex flex-col gap-4">
            {/* Stream Toggle Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base text-on-surface font-semibold">Dual-Stream Acoustic Inspection</h2>
                <p className="text-xs text-on-surface-variant">Real-time harmonic audition and waveform tracking</p>
              </div>
              {/* Toggle Filter Pills */}
              <div className="flex items-center p-1 rounded-xl bg-surface-container-lowest border border-surface-variant/40 shrink-0">
                {(
                  [
                    { id: 'side-by-side', label: 'Side-by-Side' },
                    { id: 'corrupted-only', label: 'Corrupted Only' },
                    { id: 'cleaned-only', label: 'Cleaned Signal' },
                  ] as const
                ).map((tab) => {
                  const isSelected = inspectMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setInspectMode(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface-container-high text-primary shadow-sm font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STREAM A: Corrupted Feed Player Container */}
            {(inspectMode === 'side-by-side' || inspectMode === 'corrupted-only') && (
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container-lowest/80 border border-error/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                    <span className="text-xs text-on-surface font-semibold">Damaged Feed (Raw Plasma Static)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-error-container/30 text-error font-mono text-[10px]">
                      SNR -14.2 dB
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[10px]">
                      Hiss & Static Active
                    </span>
                  </div>
                </div>

                {/* Custom Audio Player - Corrupted */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={toggleDamagedAudio}
                    className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-bright text-error flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md cursor-pointer"
                    title={isPlayingDamaged ? 'Pause static' : 'Play static'}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {isPlayingDamaged ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  {/* Interactive Waveform Scrub Bar */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = (e.clientX - rect.left) / rect.width;
                      setDamagedTime(pct * totalAudioTime);
                    }}
                    className="relative flex-1 h-12 bg-surface-container-low rounded-lg p-1.5 flex items-center justify-between gap-0.5 overflow-hidden group cursor-pointer"
                  >
                    <div className="flex items-end justify-between w-full h-full gap-1">
                      {[30, 75, 100, 85, 40, 95, 100, 50, 90, 100, 65, 92, 80, 35, 85, 100, 70, 96, 90, 30, 88, 100, 60, 95, 90].map(
                        (h, idx) => (
                          <div
                            key={idx}
                            className="w-1 bg-error transition-all"
                            style={{ height: `${h}%`, opacity: h > 80 ? 1 : 0.6 }}
                          />
                        )
                      )}
                    </div>
                    {/* Playhead */}
                    <div
                      className="absolute inset-y-0 w-0.5 bg-error shadow-[0_0_8px_rgba(255,180,171,0.8)]"
                      style={{ left: `${(damagedTime / totalAudioTime) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-on-surface-variant shrink-0 font-medium">
                    00:06.40 / 00:24.18
                  </span>
                </div>
              </div>
            )}

            {/* STREAM B: ASTRA Reconstructed Feed Container */}
            {(inspectMode === 'side-by-side' || inspectMode === 'cleaned-only') && (
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container-lowest/90 border border-primary/30 transition-all shadow-[inset_0_0_24px_rgba(34,211,238,0.05)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    <span className="text-xs text-on-surface font-semibold">
                      ASTRA Restored Stream (CosmoWave Synthesized)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-primary font-mono text-[10px]">
                      SNR +28.6 dB
                    </span>
                    <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container font-mono text-[10px]">
                      Clean Harmonic Locks
                    </span>
                  </div>
                </div>

                {/* Custom Audio Player - Cleaned */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={toggleCleanAudio}
                    className="w-10 h-10 rounded-full bg-primary-container hover:bg-primary text-on-primary-container flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-[0_0_16px_rgba(34,211,238,0.4)] cursor-pointer"
                    title={isPlayingClean ? 'Pause tone' : 'Play tone'}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {isPlayingClean ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  {/* Pristine Sinusoidal Bars */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = (e.clientX - rect.left) / rect.width;
                      setCleanTime(pct * totalAudioTime);
                    }}
                    className="relative flex-1 h-12 bg-surface-container-low rounded-lg p-1.5 flex items-center justify-between gap-0.5 overflow-hidden group cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full h-full gap-1">
                      {[15, 25, 55, 75, 90, 75, 55, 20, 10, 30, 65, 85, 95, 85, 65, 25, 10, 40, 70, 90, 70, 40, 15, 8, 20].map(
                        (h, idx) => (
                          <div
                            key={idx}
                            className="w-1 bg-primary-container rounded-full"
                            style={{
                              height: `${h}%`,
                              opacity: h > 60 ? 1 : 0.6,
                            }}
                          />
                        )
                      )}
                    </div>
                    {/* Playhead */}
                    <div
                      className="absolute inset-y-0 w-0.5 bg-primary-container shadow-[0_0_10px_rgba(34,211,238,1)]"
                      style={{ left: `${(cleanTime / totalAudioTime) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs text-on-surface font-medium">00:06.40 / 00:24.18</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-xs font-mono">
                      1.0x
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Spectrogram Inspection Card */}
            <div className="flex flex-col gap-2 p-3 bg-surface-container-lowest rounded-xl border border-surface-variant/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] text-outline tracking-wider flex items-center gap-1.5 uppercase font-semibold">
                  <span className="material-symbols-outlined text-sm text-primary">equalizer</span>
                  2D FREQUENCY WATERFALL & SPECTRAL DENSITY (0 Hz – 24 kHz)
                </span>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-error font-medium">Left: CME Noise Wall</span>
                  <span className="text-outline">|</span>
                  <span className="text-primary font-medium">Right: Denoised 1.420 GHz Hydrogen Line</span>
                </div>
              </div>

              {/* Spectrogram Graphic Representation */}
              <div className="relative w-full h-36 rounded-lg bg-surface-container-lowest overflow-hidden flex border border-surface-variant/40">
                {/* Left Half: Corrupted Noise Floor */}
                <div className="w-1/2 h-full relative overflow-hidden bg-gradient-to-t from-error/40 via-secondary-container/40 to-surface-container-lowest p-2 flex flex-col justify-between">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffb4ab_1px,transparent_1px)] [background-size:8px_8px]" />
                  <div className="relative z-10 flex justify-between font-mono text-[10px] text-error">
                    <span>24 kHz</span>
                    <span>BURST FLOOD</span>
                  </div>
                  <svg className="w-full h-20 opacity-80" preserveAspectRatio="none" viewBox="0 0 200 80">
                    <path
                      d="M0,40 Q10,10 20,60 T40,20 T60,75 T80,10 T100,65 T120,5 T140,70 T160,25 T180,80 T200,30"
                      fill="none"
                      stroke="#ffb4ab"
                      strokeDasharray="3,1"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0,60 Q15,70 30,30 T60,50 T90,20 T120,65 T150,15 T180,55 T200,45"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1"
                    />
                    <path
                      d="M0,20 Q25,80 50,15 T100,75 T150,30 T200,60"
                      fill="none"
                      opacity="0.6"
                      stroke="#c0c1ff"
                      strokeWidth="1"
                    />
                  </svg>
                  <div className="relative z-10 flex justify-between font-mono text-[10px] text-error/80">
                    <span>0 Hz</span>
                    <span>STATIC FLOOR: -14.2 dB</span>
                  </div>
                </div>

                {/* Center Separation Needle */}
                <div className="w-[2px] h-full bg-primary-container shadow-[0_0_12px_rgba(34,211,238,1)] z-20 relative flex items-center justify-center">
                  <span className="absolute -top-1 px-1 py-0.2 rounded bg-primary-container text-on-primary-container font-mono text-[9px] font-bold">
                    GATE
                  </span>
                </div>

                {/* Right Half: Restored Frequency Bands */}
                <div className="w-1/2 h-full relative overflow-hidden bg-surface-container-lowest p-2 flex flex-col justify-between">
                  <div className="relative z-10 flex justify-between font-mono text-[10px] text-outline">
                    <span>24 kHz</span>
                    <span className="text-primary font-semibold">ZERO RESIDUAL NOISE</span>
                  </div>
                  <svg className="w-full h-20" preserveAspectRatio="none" viewBox="0 0 200 80">
                    <line
                      filter="drop-shadow(0 0 4px #22d3ee)"
                      stroke="#22d3ee"
                      strokeWidth="2"
                      x1="0"
                      x2="200"
                      y1="25"
                      y2="25"
                    />
                    <line opacity="0.8" stroke="#8aebff" strokeWidth="1.5" x1="0" x2="200" y1="52" y2="52" />
                    <rect fill="#c0c1ff" height="3" rx="1.5" width="15" x="20" y="38" />
                    <rect fill="#c0c1ff" height="3" rx="1.5" width="15" x="50" y="38" />
                    <rect fill="#c0c1ff" height="3" rx="1.5" width="22" x="80" y="38" />
                    <rect fill="#c0c1ff" height="3" rx="1.5" width="15" x="120" y="38" />
                    <rect fill="#c0c1ff" height="3" rx="1.5" width="30" x="150" y="38" />
                  </svg>
                  <div className="relative z-10 flex justify-between font-mono text-[10px] text-outline">
                    <span>0 Hz</span>
                    <span className="text-primary font-medium">CARRIER LOCK: +28.6 dB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Actions & Hash */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadWav}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-semibold text-xs shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  <span>Download WAV (24-bit PCM)</span>
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">description</span>
                  <span>Download Report</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-outline font-mono text-[11px] truncate border border-surface-variant/30">
                <span className="material-symbols-outlined text-sm text-primary">verified</span>
                <span>SHA-256: 3a9f1b7c...d482e</span>
              </div>
            </div>
          </div>

          {/* CARD 2: Reconstruction Summary & Scientific Notes */}
          <div className="bg-surface-container/60 backdrop-blur-2xl rounded-2xl p-5 border border-primary/15 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">analytics</span>
                <h3 className="text-base text-on-surface font-semibold">Reconstruction Summary & Scientific Notes</h3>
              </div>
              <span className="font-mono text-xs text-outline uppercase">Telemetry Log</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-error text-[11px] font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">noise_control_off</span>
                  WHAT WAS DAMAGED
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  72% high-energy broadband static from coronal mass ejection (CME) shockwave masking transmitter tone.
                </p>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-primary text-[11px] font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">magic_button</span>
                  WHAT ASTRA FIXED
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  Extracted buried 1.420 GHz hydrogen line telemetry; suppressed incoherent solar noise floor by 42.8 dB.
                </p>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-secondary text-[11px] font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">speed</span>
                  PROCESSING TIME
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  0.64 seconds (18.2x real-time inference on TensorRT FP16 execution engines).
                </p>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-primary-container text-[11px] font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">info</span>
                  HONEST SCIENTIFIC NOTE
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  Harmonic frequencies above 18 kHz are mathematically synthesized using prior spectral models. Frequencies between 0.1–8 kHz reflect verified radio telemetry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metrics Quick-Strip */}
      <section className="mt-6 w-full p-4 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-xl border border-primary/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
            <span className="material-symbols-outlined text-xl">dataset</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-outline uppercase font-semibold">CORPUS BASELINE</span>
            <span className="text-xs text-on-surface truncate font-semibold">
              Voyager & Cassini Deep Space Network Archives (4.8k hrs)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-secondary">
            <span className="material-symbols-outlined text-xl">insights</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-outline uppercase font-semibold">SPECTRAL FIDELITY</span>
            <span className="text-xs text-on-surface truncate font-semibold font-mono">
              PESQ 4.12 • STOI 0.94 • SDR 31.4 dB
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary-container">
            <span className="material-symbols-outlined text-xl">hub</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-outline uppercase font-semibold">INFERENCE PIPELINE</span>
            <span className="text-xs text-on-surface truncate font-semibold">
              ASTRA U-Net STFT-GAN Spectral Denoiser
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
