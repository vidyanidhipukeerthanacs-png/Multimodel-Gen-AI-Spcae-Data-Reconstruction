import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HistoryItem } from '../types';

interface VideoReconstructionViewProps {
  onShowToast: (text: string) => void;
  onAddHistory: (item: HistoryItem) => void;
}

export const VideoReconstructionView: React.FC<VideoReconstructionViewProps> = ({
  onShowToast,
  onAddHistory,
}) => {
  // State
  const [splitPos, setSplitPos] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'split' | 'interpolated' | 'damaged'>('split');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(2.14); // seconds
  const [totalTime] = useState<number>(4.2);
  const [speed, setSpeed] = useState<number>(1.0);
  const [targetMultiplier, setTargetMultiplier] = useState<'2x' | '4x' | '5x'>('5x');
  const [smoothing, setSmoothing] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);
  const [selectedFrame, setSelectedFrame] = useState<number>(16);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const playTimerRef = useRef<number | null>(null);

  // Playback timer loop
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalTime) {
            return 0;
          }
          return Math.min(totalTime, prev + 0.04 * speed);
        });
      }, 40);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, speed, totalTime]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clampedPct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(clampedPct);
    if (viewMode !== 'split') {
      setViewMode('split');
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const setViewModeHelper = (mode: 'split' | 'interpolated' | 'damaged') => {
    setViewMode(mode);
    if (mode === 'interpolated') {
      setSplitPos(0);
    } else if (mode === 'damaged') {
      setSplitPos(100);
    } else {
      setSplitPos(50);
    }
  };

  const handleReconstruct = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProgress(10);

    let cur = 10;
    const interval = setInterval(() => {
      cur += Math.floor(Math.random() * 22) + 14;
      if (cur >= 100) {
        clearInterval(interval);
        setProgress(100);
        setIsProcessing(false);
        setViewModeHelper('split');
        onShowToast('Video frame interpolation complete: 60 FPS restored');

        // Add to history
        onAddHistory({
          id: `ASTRA-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
          filename: 'artemis_lunar_descent_cam1.mp4',
          hashId: 'SHA-256: 7d2e...b91a',
          size: '118.4 MB',
          technique: 'Temporal Super-Resolution (RIFE-Cosmo v3.2)',
          modality: 'video',
          timestamp: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'Completed',
          metrics: '60 FPS Restored · 18 Frames Infilled',
          previewUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAjeIwm7GBjBFtCXg3ORJPRvpyUbM8_h4usUXox3eo6nNoywSEy0008y1YqDMK1rdZmiXDJsw7gCTdfg2A2fPhPYBQZfiZVl5aWUJ_4zeRuRlM-FhUjTNM8bUczDo1FcynKk_w_R1uhfzKLK1V9bLJLI8ToTMN-UoFD7Dd3znVGZb--QSo0VnKschGfJU1BX7z6t91sc1M1LDxhdb7XMMpcWX4oIOqUzKs7xfjQnnPvQtR0mWL4GKIHiA',
        });
      } else {
        setProgress(cur);
      }
    }, 200);
  }, [isProcessing, onShowToast, onAddHistory]);

  const handleDownloadMp4 = () => {
    const a = document.createElement('a');
    a.href =
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAjeIwm7GBjBFtCXg3ORJPRvpyUbM8_h4usUXox3eo6nNoywSEy0008y1YqDMK1rdZmiXDJsw7gCTdfg2A2fPhPYBQZfiZVl5aWUJ_4zeRuRlM-FhUjTNM8bUczDo1FcynKk_w_R1uhfzKLK1V9bLJLI8ToTMN-UoFD7Dd3znVGZb--QSo0VnKschGfJU1BX7z6t91sc1M1LDxhdb7XMMpcWX4oIOqUzKs7xfjQnnPvQtR0mWL4GKIHiA';
    a.download = 'ARTEMIS_LUNAR_DESCENT_60FPS.mp4';
    a.target = '_blank';
    a.click();
    onShowToast('Downloading ARTEMIS_LUNAR_DESCENT_60FPS.mp4');
  };

  const handleDownloadReport = () => {
    const report = {
      streamId: 'artemis_lunar_descent_cam1.mp4',
      originalFps: 12,
      interpolatedFps: 60,
      multiplier: targetMultiplier,
      droppedFramesDetected: 18,
      synthesizedFrames: 48,
      vmafScore: 94.2,
      ssimScore: 0.981,
      model: 'RIFE-Cosmo v3.2 TensorRT',
      processingTimeSec: 1.8,
      sha256: '7d2e8fa4c1...b91a',
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ARTEMIS_DESCENT_INTERPOLATION_REPORT.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded Video Interpolation Report (JSON)');
  };

  const videoImgUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAjeIwm7GBjBFtCXg3ORJPRvpyUbM8_h4usUXox3eo6nNoywSEy0008y1YqDMK1rdZmiXDJsw7gCTdfg2A2fPhPYBQZfiZVl5aWUJ_4zeRuRlM-FhUjTNM8bUczDo1FcynKk_w_R1uhfzKLK1V9bLJLI8ToTMN-UoFD7Dd3znVGZb--QSo0VnKschGfJU1BX7z6t91sc1M1LDxhdb7XMMpcWX4oIOqUzKs7xfjQnnPvQtR0mWL4GKIHiA';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Page Header & Telemetry Badges */}
      <div className="relative w-full mb-6 pt-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div className="flex flex-col gap-1 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 w-fit backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-label-caps text-xs text-primary tracking-widest uppercase">
                Neural Frame Interpolation
              </span>
            </div>
            <h1 className="font-headline-lg text-3xl md:text-4xl text-on-surface tracking-tight mt-1 font-semibold">
              Video Reconstruction
            </h1>
            <p className="font-body-md text-sm md:text-base text-on-surface-variant leading-relaxed">
              Synthesize missing frames, resolve transmission packet drops, and restore fluid orbital motion from deep-space video feeds.
            </p>
          </div>

          {/* Telemetry Strip */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface-container/60 backdrop-blur-xl border border-primary/10">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-high/80">
              <span className="material-symbols-outlined text-primary text-[18px]">motion_blur</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">FRAME RATE</span>
                <span className="text-xs text-on-surface font-semibold font-mono">
                  12 fps → 60 fps <span className="text-primary font-normal">(5x Interp)</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-high/80">
              <span className="material-symbols-outlined text-secondary text-[18px]">neurology</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">MODEL</span>
                <span className="text-xs text-on-surface font-semibold">RIFE-Cosmo v3.2</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-high/80">
              <span className="material-symbols-outlined text-tertiary-container text-[18px]">speed</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">LATENCY</span>
                <span className="text-xs text-primary font-semibold font-mono">1.8s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Inputs & Processing Matrix (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* CARD 1: Damaged Input Video Stream */}
          <div className="rounded-[24px] bg-surface-container-low/70 backdrop-blur-2xl p-5 border border-primary/15 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">videocam</span>
                <h2 className="text-sm text-on-surface font-semibold">Damaged Video Stream</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-error-container/40 text-error text-[11px] font-semibold flex items-center gap-1.5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                Dropped Frames & Noise
              </span>
            </div>

            {/* Video Thumbnail Preview */}
            <div className="relative group rounded-2xl overflow-hidden aspect-video bg-surface-container-lowest border border-surface-variant/40">
              <img
                alt="Damaged Video Stream"
                className="w-full h-full object-cover filter contrast-125"
                src={videoImgUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/20 to-transparent" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(14,19,35,0)_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_4px] opacity-40 pointer-events-none" />

              {/* Play trigger HUD */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 rounded-full bg-surface-container/85 backdrop-blur-md flex items-center justify-center text-primary shadow-[0_0_24px_rgba(34,211,238,0.4)] transition-transform group-hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[32px] ml-1">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
              </div>

              {/* Bottom Video Metadata Ribbon */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-surface text-xs">
                <span className="px-2 py-0.5 rounded-md bg-surface-container-lowest/80 backdrop-blur-md font-mono text-primary">
                  {formatTime(currentTime)} / 30 frames
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-container-lowest/80 backdrop-blur-md text-on-surface-variant font-mono">
                  12 FPS
                </span>
              </div>
            </div>

            {/* Stream Meta & File Control */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-xs text-on-surface font-semibold truncate font-mono">
                  artemis_lunar_descent_cam1.mp4
                </span>
                <span className="text-[11px] text-outline">118.4 MB • Raw Telemetry H.265</span>
              </div>
              <button
                onClick={() => onShowToast('Reset to default orbital capture')}
                className="px-3 py-1.5 rounded-xl bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-all text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Reset
              </button>
            </div>

            {/* Diagnostic Telemetry Callout */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-error-container/20 text-on-surface border border-error/20">
              <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">warning</span>
              <div className="flex flex-col">
                <span className="text-xs text-error font-semibold">Missing Frames Detected</span>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
                  18 dropped frames identified in temporal block 00:01.80 – 00:03.30 due to lunar occultation buffer underrun.
                </p>
              </div>
            </div>
          </div>



          {/* CARD 3: Interpolation & Synthesis Settings */}
          <div className="rounded-[24px] bg-surface-container-low/70 backdrop-blur-2xl p-5 border border-primary/15 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">auto_fix_high</span>
                <h3 className="text-sm text-on-surface font-semibold">Synthesis Matrix</h3>
              </div>
              <span className="font-mono text-[11px] text-primary">GPU INSTANCE: V100-ASTRA</span>
            </div>

            {/* Multiplier Options */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider">
                Target Multiplier
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-surface-container-lowest/60 border border-surface-variant/40">
                {(['2x', '4x', '5x'] as const).map((m) => {
                  const labelMap = { '2x': '2x (24 fps)', '4x': '4x (48 fps)', '5x': '5x (60 fps)' };
                  const isSelected = targetMultiplier === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setTargetMultiplier(m)}
                      className={`py-2 rounded-lg text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface-container-high text-primary font-semibold shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {labelMap[m]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Motion Vector Smoothing Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-surface-variant/30">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface font-medium">Motion Vector Smoothing</span>
                <span className="text-[11px] text-outline">Dampens jitter in orbital micro-rotations</span>
              </div>
              <button
                onClick={() => setSmoothing(!smoothing)}
                className={`w-12 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                  smoothing ? 'bg-primary-container justify-end' : 'bg-surface-container-highest justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-on-primary-container shadow-md" />
              </button>
            </div>

            {/* Reconstruct Video CTA */}
            <button
              onClick={handleReconstruct}
              disabled={isProcessing}
              className={`relative group w-full py-3.5 px-4 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-sm font-bold transition-all duration-300 shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:shadow-[0_0_36px_rgba(34,211,238,0.65)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${
                isProcessing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isProcessing ? 'animate-spin' : ''}`}>
                {isProcessing ? 'sync' : 'auto_videocam'}
              </span>
              <span>{isProcessing ? 'Interpolating Frames...' : '✦ Reconstruct Video'}</span>
            </button>

            {/* Status & Verification Badge */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                  {isProcessing ? 'Interpolating...' : 'Reconstruction complete'}
                </span>
                <span className="font-mono text-outline">{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-container via-primary to-secondary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                  VMAF 94.2 • Fluid Motion Restored
                </span>
                <span className="font-mono text-xs text-outline">SSIM 0.981</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Dual-Spectrum Viewer & Timeline (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* CARD 4: Interactive Video Player Viewport */}
          <div className="rounded-[24px] bg-surface-container-low/70 backdrop-blur-2xl p-5 border border-primary/15 shadow-xl flex flex-col gap-4">
            {/* Viewport Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">compare</span>
                <h2 className="text-base text-on-surface font-semibold">Dual-Spectrum Inspection</h2>
              </div>
              {/* View Selector Switch */}
              <div className="flex items-center p-1 rounded-xl bg-surface-container-lowest/80 border border-surface-variant/40 shrink-0">
                <button
                  onClick={() => setViewModeHelper('split')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setViewModeHelper('interpolated')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'interpolated'
                      ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Interpolated (60fps)
                </button>
                <button
                  onClick={() => setViewModeHelper('damaged')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'damaged'
                      ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Damaged (12fps)
                </button>
              </div>
            </div>

            {/* Interactive Visual Comparison Frame */}
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative w-full aspect-video rounded-2xl overflow-hidden bg-surface-container-lowest select-none group cursor-ew-resize border border-primary/20 touch-none shadow-inner"
            >
              {/* Layer 1: Interpolated 60 FPS (Full Base Background) */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  alt="Interpolated 60fps Feed"
                  className="w-full h-full object-cover filter brightness-105 pointer-events-none"
                  src={videoImgUrl}
                />
                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-lg bg-surface-container-lowest/85 backdrop-blur-md shadow-lg flex items-center gap-2 border border-primary/20 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-[10px] text-primary uppercase tracking-wider">
                    ASTRA INTERPOLATED (60 FPS - SYNTHESIZED)
                  </span>
                </div>
              </div>

              {/* Layer 2: Damaged 12 FPS (Clipped Overlay with Glitch Effect) */}
              <div
                className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden transition-none"
                style={{ width: `${splitPos}%` }}
              >
                <div className="relative w-full h-full">
                  <img
                    alt="Damaged 12fps Feed"
                    className="absolute inset-y-0 left-0 max-w-none h-full object-cover filter contrast-150 saturate-50 hue-rotate-15"
                    style={{
                      width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                    }}
                    src={videoImgUrl}
                  />
                  {/* Scanlines & Static Band */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(14,19,35,0.85)_50%)] bg-[length:100%_6px] opacity-60" />
                  <div className="absolute inset-x-0 top-1/3 h-12 bg-primary/10 backdrop-blur-[2px] opacity-30" />
                </div>

                <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-lg bg-surface-container-lowest/85 backdrop-blur-md shadow-lg flex items-center gap-2 border border-error/20 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  <span className="font-mono text-[10px] text-error uppercase tracking-wider">
                    DAMAGED STREAM (12 FPS - DROPPED)
                  </span>
                </div>
              </div>

              {/* Draggable Interactive Divider */}
              <div
                className="absolute top-0 bottom-0 z-20 w-[3px] bg-primary flex items-center justify-center cursor-ew-resize -translate-x-1/2 shadow-[0_0_12px_rgba(34,211,238,1)]"
                style={{ left: `${splitPos}%` }}
              >
                <div className="w-9 h-9 rounded-full bg-surface-container border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)] text-primary">
                  <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                </div>
              </div>
            </div>

            {/* Video Playback & Scrub Bar Component */}
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-surface-container-lowest/60 border border-surface-variant/30">
              {/* Scrub Rail */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  setCurrentTime(pct * totalTime);
                }}
                className="relative w-full h-2 rounded-full bg-surface-container-highest cursor-pointer group"
              >
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                  style={{ width: `${(currentTime / totalTime) * 100}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-[0_0_12px_rgba(34,211,238,0.8)] scale-75 group-hover:scale-100 transition-transform"
                  style={{ left: `${(currentTime / totalTime) * 100}%` }}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-on-surface-variant pt-1 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 0.5))}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">skip_previous</span>
                  </button>
                  <button
                    onClick={() => setCurrentTime(Math.min(totalTime, currentTime + 0.5))}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">skip_next</span>
                  </button>
                  <span className="font-mono text-xs text-on-surface ml-2">
                    {formatTime(currentTime)} <span className="text-outline">/ {formatTime(totalTime)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const nextSpeed = speed === 1.0 ? 2.0 : speed === 2.0 ? 0.5 : 1.0;
                      setSpeed(nextSpeed);
                    }}
                    className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-xs hover:bg-surface-bright cursor-pointer"
                  >
                    {speed}x
                  </button>
                  <button
                    onClick={() => onShowToast('Aspect ratio locked to 16:9 Orbital')}
                    className="hover:text-primary transition-colors cursor-pointer p-1"
                  >
                    <span className="material-symbols-outlined text-[20px]">aspect_ratio</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!document.fullscreenElement) {
                        containerRef.current?.requestFullscreen?.();
                      } else {
                        document.exitFullscreen?.();
                      }
                    }}
                    className="hover:text-primary transition-colors cursor-pointer p-1"
                  >
                    <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SUB-COMPONENT: Frame Strip Interpolation Preview (Filmstrip) */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">burst_mode</span>
                  <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                    Frame Strip Interpolation Preview (Temporal Sequence 14–18)
                  </span>
                </div>
                <span className="font-mono text-xs text-primary font-semibold">Δt = 16.6 ms</span>
              </div>

              {/* Micro Filmstrip Grid */}
              <div className="grid grid-cols-5 gap-2.5 pt-1">
                {[
                  { id: 14, label: 'Frame 14', type: 'K-14', badge: 'Original Keyframe', isInfilled: false },
                  { id: 15, label: 'Frame 15', type: 'SYN-15', badge: 'Synthesized (ASTRA)', isInfilled: true },
                  { id: 16, label: 'Frame 16', type: 'SYN-16', badge: 'Synthesized (ASTRA)', isInfilled: true },
                  { id: 17, label: 'Frame 17', type: 'SYN-17', badge: 'Synthesized (ASTRA)', isInfilled: true },
                  { id: 18, label: 'Frame 18', type: 'K-18', badge: 'Original Keyframe', isInfilled: false },
                ].map((frame) => {
                  const isSelected = selectedFrame === frame.id;
                  return (
                    <button
                      key={frame.id}
                      onClick={() => {
                        setSelectedFrame(frame.id);
                        onShowToast(`Inspecting ${frame.label} (${frame.type})`);
                      }}
                      className={`text-left flex flex-col gap-1.5 p-1.5 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-primary/10 border-primary shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                          : 'bg-surface-container-lowest/80 border-surface-variant/30 hover:bg-surface-container-high/40'
                      }`}
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-container-highest">
                        <img
                          alt={frame.label}
                          className={`w-full h-full object-cover ${frame.isInfilled ? 'filter brightness-105' : 'filter contrast-90'}`}
                          src={videoImgUrl}
                        />
                        <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-surface-container-lowest/85 font-mono text-[9px] text-primary font-semibold">
                          {frame.type}
                        </div>
                        {frame.isInfilled && (
                          <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-primary-container text-on-primary-container font-mono text-[8px] font-bold">
                            ✦ Infilled
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col px-0.5">
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {frame.label}
                        </span>
                        <span className="text-[10px] text-outline truncate">{frame.badge}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Buttons & Verification Hash */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDownloadMp4}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:shadow-[0_0_28px_rgba(34,211,238,0.55)] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Download Reconstructed MP4</span>
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="px-4 py-2.5 rounded-xl bg-surface-container-high/70 hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  <span>Download Report</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-outline text-[11px] font-mono self-start sm:self-center">
                <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                <span>SHA-256: 7d2e8fa4c1...b91a</span>
              </div>
            </div>
          </div>

          {/* CARD 5: Reconstruction Summary & Model Notes */}
          <div className="rounded-[24px] bg-surface-container-low/70 backdrop-blur-2xl p-5 border border-primary/15 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">analytics</span>
                <h3 className="text-base text-on-surface font-semibold">Reconstruction Summary & Model Notes</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-secondary text-[11px] font-semibold">
                Mission Log Cit-ISE-2026
              </span>
            </div>

            {/* 4-Box Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Box 1 */}
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest/70 flex flex-col gap-1 border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-error">
                  <span className="material-symbols-outlined text-[18px]">report_problem</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">What Was Damaged</span>
                </div>
                <p className="text-xs text-on-surface leading-snug">
                  18 dropped frames (60% packet drop during lunar occultation window).
                </p>
              </div>

              {/* Box 2 */}
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest/70 flex flex-col gap-1 border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-[18px]">magic_button</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">What ASTRA Fixed</span>
                </div>
                <p className="text-xs text-on-surface leading-snug">
                  Synthesized 48 intermediate frames using bi-directional optical flow & cosmic prior.
                </p>
              </div>

              {/* Box 3 */}
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest/70 flex flex-col gap-1 border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-tertiary-container">
                  <span className="material-symbols-outlined text-[18px]">timer</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">Processing Time</span>
                </div>
                <p className="text-xs text-on-surface leading-snug">
                  1.8 seconds <span className="text-outline font-normal">(26.6 ms per frame on TensorRT)</span>.
                </p>
              </div>

              {/* Box 4 */}
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest/70 flex flex-col gap-1 border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">biotech</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">Honest Scientific Note</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Synthesized frames preserve orbital trajectory and photometric continuity, but sub-pixel transient debris may be smoothed. Not intended for astronomical occultation timing under 5ms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
