import React from 'react';
import { NavTab } from '../types';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenMatrix: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenMatrix }) => {
  return (
    <div className="flex flex-col w-full">
      {/* Immersive Cosmic Hero Section */}
      <section className="relative w-full -mt-16 pt-28 pb-20 md:pb-28 overflow-hidden rounded-b-3xl">
        {/* Earth Backdrop with Deep Contrast Gradient Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Cosmic orbital Earth backdrop"
            className="w-full h-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp5QOPlEeRtYwe6Wk95MD8yq0kft0jQWE9NTylINmpLt1GFZGnieFc2P69iekATXUrR94hXT4wkxrsKZuVYZMmfTXu-QFtsy56f5Tq01XYHb5pEpUeImWrDsGi2ovAh9oszBY7_74Shcaetl0xyKwuETTYVwQia8Ztn9ZdOPD1qI5xynQF2WNpj9KdyrzHnAQuEvxZ1Yl6S35jSe097O1mKafPjL1V_GZc-X21d3Oo43Td_iMew8remg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1323] via-[#0e1323]/80 to-[#0e1323]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1323] via-[#0e1323]/70 to-transparent" />
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-[140px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-start gap-space-lg">
          {/* Status Indicator Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-container-high/70 backdrop-blur-md border border-primary/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-md text-xs text-tertiary">
              Multimodal Generative Core Active
            </span>
          </div>

          {/* Main Headline & Subtext */}
          <div className="flex flex-col gap-space-md max-w-4xl">
            <h1 className="font-display-hero text-3xl sm:text-4xl md:text-[56px] text-on-surface tracking-tight leading-[1.1] font-bold">
              Rebuilding the universe’s lost data — one pixel, one signal, one word at a time.
            </h1>
            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              ASTRA restores damaged images, videos, audio and text, and shows you what it fixed.
            </p>
          </div>

          {/* Hero Call-To-Action Pair */}
          <div className="flex flex-wrap items-center gap-space-md pt-2">
            <button
              onClick={onOpenMatrix}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-surface-container-lowest font-semibold text-sm shadow-[0_0_28px_rgba(34,211,238,0.4)] hover:shadow-[0_0_38px_rgba(34,211,238,0.65)] hover:scale-[1.015] active:scale-[0.99] transition-all duration-200 cursor-pointer"
            >
              <span>Start Reconstructing</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container-high/60 backdrop-blur-xl text-on-surface text-sm font-semibold hover:bg-surface-container-highest transition-all duration-200 border border-primary/10 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">history</span>
              <span>View History</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3-Step Intuitive Workflow Flow */}
      <section className="w-full py-space-xl relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-full relative">
            {/* Glowing Connecting Path Line */}
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] -translate-y-1/2 h-[2px] bg-gradient-to-r from-primary/20 via-primary to-primary/20 pointer-events-none shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center gap-space-sm p-space-md rounded-2xl bg-surface-container-lowest/80 backdrop-blur-xl border border-primary/10 shadow-md transition-transform duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <span className="material-symbols-outlined text-[28px]">upload_file</span>
                </div>
                <span className="font-headline-sm text-lg text-on-surface font-semibold">1. Upload</span>
                <p className="font-body-sm text-xs text-on-surface-variant max-w-[200px]">
                  Provide damaged raw files, noisy feeds, or partial transcripts.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center gap-space-sm p-space-md rounded-2xl bg-surface-container-lowest/80 backdrop-blur-xl border border-primary/10 shadow-md transition-transform duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <span className="material-symbols-outlined text-[28px]">auto_fix_high</span>
                </div>
                <span className="font-headline-sm text-lg text-on-surface font-semibold">2. Reconstruct</span>
                <p className="font-body-sm text-xs text-on-surface-variant max-w-[200px]">
                  ASTRA predicts lost data patterns and fills missing information.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center gap-space-sm p-space-md rounded-2xl bg-surface-container-lowest/80 backdrop-blur-xl border border-primary/10 shadow-md transition-transform duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <span className="material-symbols-outlined text-[28px]">cloud_download</span>
                </div>
                <span className="font-headline-sm text-lg text-on-surface font-semibold">3. Download</span>
                <p className="font-body-sm text-xs text-on-surface-variant max-w-[200px]">
                  Export verified high-fidelity restorations and difference maps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Modality Cards (Image, Video, Audio, Text) */}
      <section className="w-full py-space-lg flex flex-col gap-space-lg">
        <div className="flex flex-col gap-1">
          <h2 className="font-headline-md text-2xl text-on-surface font-bold">Supported Media Types</h2>
          <p className="font-body-md text-sm text-on-surface-variant">
            Select a modality to begin targeted neural restoration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {/* 1. Image Restoration */}
          <button
            onClick={() => onNavigate('image')}
            className="group relative text-left flex flex-col justify-between overflow-hidden rounded-[24px] bg-surface-container/70 backdrop-blur-2xl p-space-lg border border-primary/15 shadow-lg hover:shadow-[0_12px_36px_-8px_rgba(34,211,238,0.25)] hover:border-primary/40 hover:bg-surface-container transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-surface-container-lowest mb-space-md">
              <img
                alt="A deep space nebula with cosmic starfields"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvz7OqxTQf7M9fChIT5Scbf13hDtVpLby9YsvqEk9qiqdF7WgsqZBAPONBEMuJ5zVoPZaxBPBhSrSyC16QXcF5-sZy3djsJkYFOMDF6AEvCkE_T7i19eeAFr87BcW7krJFQPhbkzbKaTetlK8zc-ODUfd5sIa8lhcMAqHNXg2Fu5FbL-I1zoxYXAi19sADAvlxLEFYsJMu25UPJcx1F8Vdd69ihyE7w_zL-K1AemchHwBgjwEkumITag"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
              <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md text-primary shadow-sm border border-primary/20">
                <span className="material-symbols-outlined text-[22px]">image</span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-lg text-on-surface group-hover:text-primary transition-colors font-semibold">
                  Image Restoration
                </h3>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant">
                Recover telemetry photos lost to cosmic ray interference.
              </p>
            </div>
          </button>

          {/* 2. Video Reconstruction */}
          <button
            onClick={() => onNavigate('video')}
            className="group relative text-left flex flex-col justify-between overflow-hidden rounded-[24px] bg-surface-container/70 backdrop-blur-2xl p-space-lg border border-primary/15 shadow-lg hover:shadow-[0_12px_36px_-8px_rgba(34,211,238,0.25)] hover:border-primary/40 hover:bg-surface-container transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-surface-container-lowest mb-space-md">
              <img
                alt="Saturn ring telemetry visual"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7PLyEbzIG1Gz40MHNjnIH0e2EnvSFjo2gHBW3Od8fg1tApuC6bjGI6ST4fP1dFDJoIMpqYG5-5INiJXu4-RUUseUdLKmLyWmf-nY3g7w3JtbTS2tD9HD8I5snOFh3lgZuV8d0MPE9o94aSxriZAPqm1xI-sm6v_XRl3oz3_noOrGRiam4PPl8QrakOgjboJUOhHh1DlbvcJrchnEiZsyEDh_48PVE1XL12UUcg7imcyJkuL65d0syMg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
              <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md text-primary shadow-sm border border-primary/20">
                <span className="material-symbols-outlined text-[22px]">videocam</span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-lg text-on-surface group-hover:text-primary transition-colors font-semibold">
                  Video Reconstruction
                </h3>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant">
                Restore dropped frames and sensor noise in orbital footage.
              </p>
            </div>
          </button>

          {/* 3. Audio Denoising */}
          <button
            onClick={() => onNavigate('audio')}
            className="group relative text-left flex flex-col justify-between overflow-hidden rounded-[24px] bg-surface-container/70 backdrop-blur-2xl p-space-lg border border-primary/15 shadow-lg hover:shadow-[0_12px_36px_-8px_rgba(34,211,238,0.25)] hover:border-primary/40 hover:bg-surface-container transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-surface-container-lowest flex items-center justify-center p-6 mb-space-md">
              {/* Ambient Radial Glow */}
              <div className="absolute w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              {/* Waveform Graphic */}
              <div className="relative w-full h-24 flex items-center justify-center gap-1.5 px-4">
                <span className="w-1.5 h-6 bg-outline-variant rounded-full" />
                <span className="w-1.5 h-12 bg-primary/40 rounded-full" />
                <span className="w-1.5 h-16 bg-primary/60 rounded-full" />
                <span className="w-1.5 h-8 bg-outline-variant rounded-full" />
                <span className="w-1.5 h-20 bg-primary rounded-full group-hover:h-24 transition-all duration-300" />
                <span className="w-1.5 h-14 bg-primary/80 rounded-full" />
                <span className="w-1.5 h-22 bg-primary-container rounded-full group-hover:h-24 transition-all duration-300" />
                <span className="w-1.5 h-10 bg-primary/50 rounded-full" />
                <span className="w-1.5 h-18 bg-primary rounded-full" />
                <span className="w-1.5 h-7 bg-outline-variant rounded-full" />
                <span className="w-1.5 h-14 bg-primary/70 rounded-full" />
                <span className="w-1.5 h-9 bg-outline-variant rounded-full" />
                <span className="w-1.5 h-16 bg-primary/60 rounded-full" />
                <span className="w-1.5 h-5 bg-outline-variant rounded-full" />
              </div>
              <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md text-primary shadow-sm border border-primary/20">
                <span className="material-symbols-outlined text-[22px]">graphic_eq</span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-lg text-on-surface group-hover:text-primary transition-colors font-semibold">
                  Audio Denoising
                </h3>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant">
                Clear deep-space radio transmission interference and static.
              </p>
            </div>
          </button>

          {/* 4. Text Fill-Mask */}
          <button
            onClick={() => onNavigate('text')}
            className="group relative text-left flex flex-col justify-between overflow-hidden rounded-[24px] bg-surface-container/70 backdrop-blur-2xl p-space-lg border border-primary/15 shadow-lg hover:shadow-[0_12px_36px_-8px_rgba(34,211,238,0.25)] hover:border-primary/40 hover:bg-surface-container transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-surface-container-lowest flex flex-col justify-center p-6 mb-space-md">
              <div className="flex flex-col gap-3 font-mono text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="text-outline">RAW:</span>
                  <span className="text-on-surface truncate">COSMIC_RAY_BURST [CORRUPTED] VELOCITY_VECTOR</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-high/60 border border-primary/20">
                  <span className="text-primary font-semibold">PREDICTED:</span>
                  <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-medium">
                    DETECTED AT 14.82 AU
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-outline">STATUS:</span>
                  <span className="text-tertiary">SIGNAL MASK RESOLVED (99.4%)</span>
                </div>
              </div>
              <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md text-primary shadow-sm border border-primary/20">
                <span className="material-symbols-outlined text-[22px]">short_text</span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-lg text-on-surface group-hover:text-primary transition-colors font-semibold">
                  Text Fill-Mask
                </h3>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant">
                Predict missing scientific logs and corrupted telemetry packets.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Minimalist Academic Credit Section */}
      <section className="w-full py-space-xl flex justify-center text-center">
        <div className="px-6 py-4 rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-primary/10 shadow-sm">
          <p className="font-label-md text-xs sm:text-sm text-outline">
            Channabasaveshwara Institute of Technology · Dept. of ISE · Final Year Project 2025–26
          </p>
        </div>
      </section>
    </div>
  );
};
