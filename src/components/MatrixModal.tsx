import React from 'react';
import { NavTab } from '../types';

interface MatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onShowToast: (text: string) => void;
}

export const MatrixModal: React.FC<MatrixModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const handleExport = () => {
    const csvContent = `Modality,Architecture,Target,Metrics,Latency,Scientific Constraint
Image Restoration,ASTRA Diffusion v4.2,Planetary flyby CCD sensor bleed,"98.5% Area Restored",1.4s / 4K Frame,"Stochastic generative prior, not topographic survey ground truth."
Video Synthesis,RIFE-Cosmo v3.2,Descent feeds occultation capture,"60 FPS Restored",26.6ms / Frame,"Preserves macro orbital physics; micro-debris <5ms smoothed out."
Audio Denoising,CosmoWave v2.4 U-Net,Plasma radio carrier feeds,"+42.8 dB Gain Restored",0.64s (18.2x RT),"Harmonics >18kHz synthesized; 0.1-8kHz verified telemetry."
Text Fill-Mask,DeepSpace-BERT 11B,Corrupted mission logs,"99.4% Confidence, 374 tok/s",0.82s / Sequence,"Completions based on protocol vocabulary cross-checked with sensor tolerances."`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ASTRA_CROSS_MODALITY_RECONSTRUCTION_MATRIX.csv';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported Cross-Modality Reconstruction Matrix (.CSV)');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-container-lowest/85 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Modal Frame */}
      <div className="relative w-full max-w-7xl mx-auto rounded-[24px] bg-surface-container-low/95 backdrop-blur-3xl border border-primary/20 shadow-[0_24px_80px_rgba(8,13,29,0.85),0_0_48px_rgba(34,211,238,0.12)] overflow-hidden transition-all duration-300 my-auto">
        {/* Top-Lit Ambient Gradient Shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/20 blur-[100px] pointer-events-none" />

        {/* Modal Header */}
        <header className="p-6 md:p-8 pb-4 flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/30 text-primary font-label-caps text-xs tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                Multimodal Evaluation Protocol
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs">
                v4.2-STABLE
              </span>
            </div>
            <h2 className="font-headline-lg text-2xl md:text-3xl text-on-surface tracking-tight mt-1 font-bold">
              Cross-Modality Reconstruction Matrix
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Comparative evaluation of latent generative priors, spectral algorithms, computational throughput, and fidelity thresholds across deep space telemetry formats.
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3 self-start shrink-0">
            <button
              onClick={handleExport}
              className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high/60 hover:bg-surface-container-highest text-on-surface text-xs font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary group-hover:scale-110 transition-transform">
                download
              </span>
              <span>Export Matrix (.CSV)</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close matrix view"
              className="w-10 h-10 rounded-xl bg-surface-container-high/60 hover:bg-error-container hover:text-on-error-container text-on-surface-variant flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </header>

        {/* Modal Content: 4-Modality Comparative Grid */}
        <div className="p-6 md:p-8 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* MODALITY 1: Image Restoration */}
            <article className="flex flex-col justify-between rounded-2xl bg-surface-container/60 hover:bg-surface-container-high/70 p-5 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(34,211,238,0.1)] border border-surface-variant/30 group">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors duration-200">
                    <span className="material-symbols-outlined text-[22px]">filter_vintage</span>
                  </div>
                  <span className="font-label-caps text-[10px] text-primary px-2.5 py-0.5 rounded-full bg-surface-container-lowest">
                    MODALITY 01
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-base text-on-surface font-semibold">Image Restoration</h3>
                  <p className="text-xs text-on-surface-variant">Diffusion & Inpainting Latents</p>
                </div>

                {/* Mini Preview */}
                <div className="relative w-full h-24 rounded-lg overflow-hidden bg-surface-container-lowest">
                  <img
                    alt="Image Telemetry"
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-opacity"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8j6RrVCSxJbjbHiUBAq19_hOpOxmyoChQCJ-6dEKVtDtWyRhPbs6iE_PljGzP7ngq424xwH53YdBZ3FB7CLNrfc-GlP6uDDp89XGuLhvyiRR5Gv9LxYxDaP9KvCAvsGA6GE4aO4pK-1t6tTBwTpUDU1yUzKXUGflXaIgJvcSlDXZeFElCMnHPkxZyCUVyMsdLWa5TY12rpn1uwMD2zPuF2msalhvoHyJt7UJCRrJNiUbOQY2vUeHKng"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                    <span className="font-mono text-[9px] text-on-surface">CASSINI • FITS COMPLIANT</span>
                  </div>
                </div>

                {/* Key Specs */}
                <div className="flex flex-col gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Target Telemetry</span>
                    <span className="text-on-surface truncate block">Planetary flyby, CCD sensor bleed</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Damaged Phenomenon</span>
                    <span className="text-on-surface-variant line-clamp-2">Cosmic ray dropout, radiation hot-pixels</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Core Architecture</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-primary font-semibold">ASTRA Diffusion v4.2</span>
                      <span className="text-[9px] text-outline px-1.5 py-0.2 rounded bg-surface-container-highest">UNet</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-lowest/80 flex flex-col gap-0.5">
                    <span className="text-[10px] text-outline uppercase">Primary Metric</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-primary">98.5%</span>
                      <span className="text-xs text-on-surface font-mono">Area Restored</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-outline">Latency:</span>
                    <span className="text-on-surface font-mono">1.4s / 4K Frame</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-high/40 flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-tertiary">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      <span className="text-[10px] font-semibold uppercase">Scientific Constraint</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-snug">
                      Sub-pixel crater detail is generative prior, not topographic survey ground truth.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('image');
                  }}
                  className="inline-flex items-center justify-between w-full p-2.5 rounded-xl text-primary font-semibold text-xs bg-surface-container-highest/40 hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer"
                >
                  <span>Inspect Image Engine</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </article>

            {/* MODALITY 2: Video Synthesis */}
            <article className="flex flex-col justify-between rounded-2xl bg-surface-container/60 hover:bg-surface-container-high/70 p-5 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(34,211,238,0.1)] border border-surface-variant/30 group">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors duration-200">
                    <span className="material-symbols-outlined text-[22px]">motion_photos_on</span>
                  </div>
                  <span className="font-label-caps text-[10px] text-secondary px-2.5 py-0.5 rounded-full bg-surface-container-lowest">
                    MODALITY 02
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-base text-on-surface font-semibold">Video Synthesis</h3>
                  <p className="text-xs text-on-surface-variant">Kinematic Flow Interpolation</p>
                </div>

                {/* Mini Preview */}
                <div className="relative w-full h-24 rounded-lg overflow-hidden bg-surface-container-lowest">
                  <img
                    alt="Video Telemetry"
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-opacity"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjeIwm7GBjBFtCXg3ORJPRvpyUbM8_h4usUXox3eo6nNoywSEy0008y1YqDMK1rdZmiXDJsw7gCTdfg2A2fPhPYBQZfiZVl5aWUJ_4zeRuRlM-FhUjTNM8bUczDo1FcynKk_w_R1uhfzKLK1V9bLJLI8ToTMN-UoFD7Dd3znVGZb--QSo0VnKschGfJU1BX7z6t91sc1M1LDxhdb7XMMpcWX4oIOqUzKs7xfjQnnPvQtR0mWL4GKIHiA"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="font-mono text-[9px] text-on-surface">ARTEMIS • 60 FPS SYNC</span>
                  </div>
                </div>

                {/* Key Specs */}
                <div className="flex flex-col gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Target Telemetry</span>
                    <span className="text-on-surface truncate block">Descent feeds, occultation capture</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Damaged Phenomenon</span>
                    <span className="text-on-surface-variant line-clamp-2">Buffer underruns, packet drop keyframes</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Core Architecture</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-secondary font-semibold">RIFE-Cosmo v3.2</span>
                      <span className="text-[9px] text-outline px-1.5 py-0.2 rounded bg-surface-container-highest">Flow</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-lowest/80 flex flex-col gap-0.5">
                    <span className="text-[10px] text-outline uppercase">Primary Metric</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-secondary">94.2</span>
                      <span className="text-xs text-on-surface font-mono">VMAF / FMI 98.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-outline">Latency:</span>
                    <span className="text-on-surface font-mono">26.6ms / Frame</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-high/40 flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-tertiary">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      <span className="text-[10px] font-semibold uppercase">Scientific Constraint</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-snug">
                      Preserves macro orbital physics; micro-debris &lt;5ms intervals smoothed out.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('video');
                  }}
                  className="inline-flex items-center justify-between w-full p-2.5 rounded-xl text-secondary font-semibold text-xs bg-surface-container-highest/40 hover:bg-secondary-container hover:text-on-secondary-container transition-all cursor-pointer"
                >
                  <span>Inspect Video Engine</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </article>

            {/* MODALITY 3: Audio Spectral Denoising */}
            <article className="flex flex-col justify-between rounded-2xl bg-surface-container/60 hover:bg-surface-container-high/70 p-5 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(34,211,238,0.1)] border border-surface-variant/30 group">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors duration-200">
                    <span className="material-symbols-outlined text-[22px]">graphic_eq</span>
                  </div>
                  <span className="font-label-caps text-[10px] text-tertiary px-2.5 py-0.5 rounded-full bg-surface-container-lowest">
                    MODALITY 03
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-base text-on-surface font-semibold">Audio Denoising</h3>
                  <p className="text-xs text-on-surface-variant">Neural Latent STFT-GAN</p>
                </div>

                {/* Mini Preview */}
                <div className="relative w-full h-24 rounded-lg overflow-hidden bg-surface-container-lowest flex items-center justify-center p-3">
                  <div className="flex items-center gap-1 w-full justify-center">
                    <span className="w-1 h-8 bg-primary/40 rounded-full" />
                    <span className="w-1 h-14 bg-primary rounded-full" />
                    <span className="w-1 h-20 bg-primary-container rounded-full" />
                    <span className="w-1 h-10 bg-primary/60 rounded-full" />
                    <span className="w-1 h-16 bg-primary rounded-full" />
                    <span className="w-1 h-6 bg-primary/30 rounded-full" />
                  </div>
                  <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-mono text-[9px] text-on-surface">VOYAGER • 1.420 GHz LOCK</span>
                  </div>
                </div>

                {/* Key Specs */}
                <div className="flex flex-col gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Target Telemetry</span>
                    <span className="text-on-surface truncate block">Deep-space plasma radio relays</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Damaged Phenomenon</span>
                    <span className="text-on-surface-variant line-clamp-2">High-energy CME solar flare static</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Core Architecture</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-tertiary font-semibold">CosmoWave v2.4</span>
                      <span className="text-[9px] text-outline px-1.5 py-0.2 rounded bg-surface-container-highest">U-Net</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-lowest/80 flex flex-col gap-0.5">
                    <span className="text-[10px] text-outline uppercase">Primary Metric</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-tertiary">+42.8 dB</span>
                      <span className="text-xs text-on-surface font-mono">PESQ 4.12</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-outline">Latency:</span>
                    <span className="text-on-surface font-mono">0.64s (18.2x RT)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-high/40 flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-tertiary">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      <span className="text-[10px] font-semibold uppercase">Scientific Constraint</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-snug">
                      Harmonics &gt;18kHz synthesized; 0.1–8 kHz reflects verified telemetry.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('audio');
                  }}
                  className="inline-flex items-center justify-between w-full p-2.5 rounded-xl text-tertiary font-semibold text-xs bg-surface-container-highest/40 hover:bg-tertiary-container hover:text-on-tertiary-container transition-all cursor-pointer"
                >
                  <span>Inspect Audio Engine</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </article>

            {/* MODALITY 4: Text Fill-Mask */}
            <article className="flex flex-col justify-between rounded-2xl bg-surface-container/60 hover:bg-surface-container-high/70 p-5 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(34,211,238,0.1)] border border-surface-variant/30 group">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors duration-200">
                    <span className="material-symbols-outlined text-[22px]">short_text</span>
                  </div>
                  <span className="font-label-caps text-[10px] text-primary px-2.5 py-0.5 rounded-full bg-surface-container-lowest">
                    MODALITY 04
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-base text-on-surface font-semibold">Text Fill-Mask</h3>
                  <p className="text-xs text-on-surface-variant">Contextual Language Prior</p>
                </div>

                {/* Mini Preview */}
                <div className="relative w-full h-24 rounded-lg overflow-hidden bg-surface-container-lowest flex flex-col justify-center p-3 font-mono text-[10px]">
                  <div className="text-outline truncate">RAW: PROBE [MASK] IONOSPHERE</div>
                  <div className="text-primary font-bold mt-1">PRED: MARTIAN (99.8%)</div>
                  <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-mono text-[9px] text-on-surface">NASA PDS • BERT-COSMO</span>
                  </div>
                </div>

                {/* Key Specs */}
                <div className="flex flex-col gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Target Telemetry</span>
                    <span className="text-on-surface truncate block">Corrupted mission logs, packet streams</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Damaged Phenomenon</span>
                    <span className="text-on-surface-variant line-clamp-2">Solar flare bit-flips, bracketed masks</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Core Architecture</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-primary font-semibold">DeepSpace-BERT 11B</span>
                      <span className="text-[9px] text-outline px-1.5 py-0.2 rounded bg-surface-container-highest">NLP</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-lowest/80 flex flex-col gap-0.5">
                    <span className="text-[10px] text-outline uppercase">Primary Metric</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-primary">99.4%</span>
                      <span className="text-xs text-on-surface font-mono">374 tok/sec</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-outline">Latency:</span>
                    <span className="text-on-surface font-mono">0.82s / Sequence</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-high/40 flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-tertiary">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      <span className="text-[10px] font-semibold uppercase">Scientific Constraint</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-snug">
                      Completions based on protocol vocabulary cross-checked with sensor tolerances.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('text');
                  }}
                  className="inline-flex items-center justify-between w-full p-2.5 rounded-xl text-primary font-semibold text-xs bg-surface-container-highest/40 hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer"
                >
                  <span>Inspect Text Engine</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};
