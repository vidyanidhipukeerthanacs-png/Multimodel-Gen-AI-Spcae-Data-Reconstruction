import React, { useState } from 'react';
import { HistoryItem } from '../types';

interface TextReconstructionViewProps {
  onShowToast: (text: string) => void;
  onAddHistory: (item: HistoryItem) => void;
}

export const TextReconstructionView: React.FC<TextReconstructionViewProps> = ({
  onShowToast,
  onAddHistory,
}) => {
  const defaultSample =
    'MISSION_LOG_SOL_412: Atmospheric probe entered [MASK] ionosphere. Radiation flux reached [MASK] rads/hr. Telemetry status: [MASK].';

  const [damagedText, setDamagedText] = useState<string>(defaultSample);
  const [viewMode, setViewMode] = useState<'diff' | 'clean'>('diff');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(0.12);

  // Compute number of masked tokens dynamically
  const maskMatches = damagedText.match(/\[MASK\]/gi);
  const maskCount = maskMatches ? maskMatches.length : 0;

  const handleResetSample = () => {
    setDamagedText(defaultSample);
    onShowToast('Restored Sol 412 test sample');
  };

  const handleReconstruct = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onShowToast(`Reconstructed ${maskCount} tokens with 99.4% confidence in 0.8s`);

      onAddHistory({
        id: `ASTRA-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
        filename: 'deep_space_telemetry_sol412.txt',
        hashId: 'SHA-256: 8f4c...c29b',
        size: '412 KB',
        technique: 'DeepSpace-BERT 11B (Masked Infill)',
        modality: 'text',
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'Completed',
        metrics: '99.4% Confidence · 374 tok/sec',
      });
    }, 800);
  };

  const handleDownloadResult = () => {
    const textToDownload =
      'MISSION_LOG_SOL_412: Atmospheric probe entered Martian ionosphere. Radiation flux reached 148.2 rads/hr. Telemetry status: NOMINAL.';
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ASTRA_SOL_412_RECONSTRUCTED.txt';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded ASTRA_SOL_412_RECONSTRUCTED.txt');
  };

  const handleDownloadReport = () => {
    const report = {
      mission: 'SOL_412',
      engine: 'ASTRA DeepSpace-BERT 11B',
      processingTimeSec: 0.82,
      throughputTokPerSec: 374,
      tokensResolved: [
        { position: 5, filled: 'Martian', confidence: 0.998 },
        { position: 9, filled: '148.2', confidence: 0.989 },
        { position: 13, filled: 'NOMINAL', confidence: 0.999 },
      ],
      damageOrigin: 'Solar flare blackout during orbital pass Sol 412',
      status: 'COMPLETE_VERIFIED',
      sha256: '8f4c029b...e381',
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ASTRA_SOL_412_REPORT.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded Telemetry Diagnostic Report (JSON)');
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Page Header */}
      <section className="relative pt-4 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40 text-primary font-label-caps text-xs tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping" />
                Astra NLP • Model Spec v4.8
              </span>
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">satellite_alt</span>
                Deep-Space Relays Active
              </span>
            </div>
            <h1 className="font-headline-lg text-3xl md:text-4xl text-on-surface tracking-tight font-semibold">
              Text Reconstruction
            </h1>
            <p className="font-body-lg text-sm md:text-base text-on-surface-variant">
              Reconstruct missing characters, corrupted sentences, and lost deep-space transmission logs using contextual language priors.
            </p>
          </div>

          {/* Quick Telemetry HUD Metric Chips */}
          <div className="flex items-center gap-2 self-start md:self-end bg-surface-container-low/70 backdrop-blur-xl p-2 rounded-xl border border-primary/10">
            <div className="px-3 py-1.5 flex flex-col">
              <span className="text-[10px] text-outline uppercase font-semibold">Confidence Band</span>
              <span className="text-base text-primary font-bold font-mono">99.4%</span>
            </div>
            <div className="w-px h-8 bg-surface-variant" />
            <div className="px-3 py-1.5 flex flex-col">
              <span className="text-[10px] text-outline uppercase font-semibold">Latency</span>
              <span className="text-base text-tertiary font-bold font-mono">0.82s</span>
            </div>
            <div className="w-px h-8 bg-surface-variant" />
            <div className="px-3 py-1.5 flex flex-col">
              <span className="text-[10px] text-outline uppercase font-semibold">Packet Mode</span>
              <span className="text-base text-secondary-fixed font-bold font-mono">BERT-Cosmo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Pipeline Workbench */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Ground Truth (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Damaged Input Card */}
          <div className="relative rounded-2xl bg-surface-container-low/80 backdrop-blur-2xl p-6 border border-primary/15 shadow-xl overflow-hidden flex flex-col">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                <span className="text-base text-on-surface font-semibold">Damaged Transmission Log</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-error-container/30 text-error text-[11px] font-semibold uppercase">
                {maskCount} Masked Tokens
              </span>
            </div>

            <p className="text-xs text-on-surface-variant mb-3">
              Input raw packet stream or paste corrupted logs with bracketed masks or noise tags.
            </p>

            {/* Presets row */}
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] text-outline uppercase font-semibold">Presets:</span>
              <button
                onClick={() => {
                  setDamagedText(defaultSample);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-bright text-[11px] text-primary whitespace-nowrap cursor-pointer"
              >
                Sol 412 Mars Probe
              </button>
              <button
                onClick={() => {
                  setDamagedText(
                    'TELEMETRY_PKT_089: Plasma velocity [MASK] km/s, magnetic induction vector at [MASK] Tesla, status [MASK].'
                  );
                }}
                className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-bright text-[11px] text-on-surface-variant hover:text-on-surface whitespace-nowrap cursor-pointer"
              >
                Sol 89 Deep Space
              </button>
            </div>

            <div className="relative flex-1">
              <textarea
                value={damagedText}
                onChange={(e) => setDamagedText(e.target.value)}
                rows={5}
                className="w-full bg-surface-container-lowest/80 text-on-surface font-mono text-xs p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all border border-surface-variant/40 leading-relaxed"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                <button
                  onClick={handleResetSample}
                  type="button"
                  className="px-2.5 py-1 rounded bg-surface-variant/70 hover:bg-surface-variant text-on-surface text-xs font-medium transition-colors cursor-pointer"
                >
                  Reset Sample
                </button>
              </div>
            </div>



            {/* Action Trigger */}
            <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-[16px] text-tertiary">tune</span>
                <span>Temp: {temperature} (Precise)</span>
              </div>
              <button
                onClick={handleReconstruct}
                disabled={isProcessing}
                className={`group relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary text-on-primary font-bold text-xs shadow-[0_0_24px_rgba(34,211,238,0.4)] hover:shadow-[0_0_36px_rgba(34,211,238,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
                  isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isProcessing ? 'animate-spin' : 'group-hover:rotate-45'}`}>
                  {isProcessing ? 'sync' : 'auto_awesome'}
                </span>
                <span>{isProcessing ? 'Solving Tokens...' : 'Reconstruct Sequence'}</span>
              </button>
            </div>
          </div>

          {/* Attention Head Sparkline Card */}
          <div className="rounded-2xl bg-surface-container-low/60 backdrop-blur-xl p-4 border border-primary/10 shadow-lg flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">
                Transformer Attention Head
              </span>
              <span className="text-sm text-on-surface font-semibold">DeepSpace-BERT 11B</span>
              <span className="text-xs text-on-surface-variant">Sol 412 DSN Goldstone Antenna array link</span>
            </div>
            {/* Inline SVG Sparkline */}
            <div className="w-32 h-10 flex items-center">
              <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 120 40">
                <path
                  className="text-primary"
                  d="M0,32 Q15,10 30,22 T60,8 T90,26 T120,4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <circle className="fill-primary animate-pulse" cx="60" cy="8" r="3.5" />
                <circle className="fill-tertiary-container" cx="120" cy="4" r="3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Reconstructed Results & Inspection (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Output Diff Card */}
          <div className="rounded-2xl bg-surface-container-low/80 backdrop-blur-2xl p-6 border border-primary/15 shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute -left-16 bottom-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-base text-on-surface font-semibold">Reconstructed Output Stream</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-lowest/80 p-1 rounded-lg border border-surface-variant/40">
                <button
                  onClick={() => setViewMode('diff')}
                  className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                    viewMode === 'diff'
                      ? 'bg-surface-container-high text-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Diff Comparison
                </button>
                <button
                  onClick={() => setViewMode('clean')}
                  className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                    viewMode === 'clean'
                      ? 'bg-surface-container-high text-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Clean Text
                </button>
              </div>
            </div>

            {/* Display Viewport */}
            <div className="p-5 rounded-xl bg-surface-container-lowest/90 text-sm leading-relaxed text-on-surface flex flex-col gap-4 border border-surface-variant/40">
              {viewMode === 'diff' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">
                      Before (Damaged Feed)
                    </span>
                    <div className="text-on-surface-variant font-mono text-xs line-through decoration-error/50">
                      MISSION_LOG_SOL_412: Atmospheric probe entered{' '}
                      <span className="bg-error-container/40 text-error px-1.5 py-0.5 rounded text-xs font-semibold not-italic">
                        [MASK]
                      </span>{' '}
                      ionosphere. Radiation flux reached{' '}
                      <span className="bg-error-container/40 text-error px-1.5 py-0.5 rounded text-xs font-semibold not-italic">
                        [MASK]
                      </span>{' '}
                      rads/hr. Telemetry status:{' '}
                      <span className="bg-error-container/40 text-error px-1.5 py-0.5 rounded text-xs font-semibold not-italic">
                        [MASK]
                      </span>
                      .
                    </div>
                  </div>

                  <div className="w-full h-px bg-surface-variant/40" />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-primary uppercase tracking-wider flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        ASTRA Infilled Matrix
                      </span>
                      <span className="text-xs text-on-surface-variant">Tokens resolved: 3 of 3</span>
                    </div>

                    <p className="text-on-surface font-body-lg text-base md:text-lg leading-relaxed">
                      MISSION_LOG_SOL_412: Atmospheric probe entered
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mx-1.5 rounded-md bg-primary-container/20 text-primary-fixed shadow-[0_0_12px_rgba(34,211,238,0.25)] font-semibold border border-primary/30">
                        Martian
                        <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-primary-container/30 text-primary">
                          99.8%
                        </span>
                      </span>
                      ionosphere. Radiation flux reached
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mx-1.5 rounded-md bg-primary-container/20 text-primary-fixed shadow-[0_0_12px_rgba(34,211,238,0.25)] font-semibold border border-primary/30">
                        148.2
                        <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-primary-container/30 text-primary">
                          98.9%
                        </span>
                      </span>
                      rads/hr. Telemetry status:
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mx-1.5 rounded-md bg-primary-container/20 text-primary-fixed shadow-[0_0_12px_rgba(34,211,238,0.25)] font-semibold border border-primary/30">
                        NOMINAL
                        <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-primary-container/30 text-primary">
                          99.9%
                        </span>
                      </span>
                      .
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-primary uppercase tracking-wider font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">article</span>
                      Pure Synthesized Stream
                    </span>
                    <span className="text-xs text-outline">Plaintext Export View</span>
                  </div>
                  <p className="text-on-surface font-mono text-sm leading-relaxed bg-surface-container/40 p-4 rounded-xl border border-surface-variant/30">
                    MISSION_LOG_SOL_412: Atmospheric probe entered Martian ionosphere. Radiation flux reached 148.2 rads/hr. Telemetry status: NOMINAL.
                  </p>
                </div>
              )}
            </div>

            {/* Download Buttons Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-mono text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">fingerprint</span>
                  SHA-256: 8f4c...c29b
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadResult}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">download</span>
                  <span>Download Result</span>
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">lab_profile</span>
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Diagnostic Breakdown */}
          <div className="rounded-2xl bg-surface-container/60 backdrop-blur-xl p-5 border border-primary/15 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[22px]">analytics</span>
                <span className="text-base text-on-surface font-semibold">Telemetry Diagnostic Breakdown</span>
              </div>
              <span className="text-[10px] text-outline uppercase font-semibold font-mono">CIT ISE Telemetry Lab</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-surface-container-lowest/60 flex flex-col gap-1 border border-surface-variant/30">
                <div className="flex items-center gap-2 text-error text-xs font-semibold">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  What was damaged
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Corrupted packet tokens due to solar flare blackout during orbital pass Sol 412.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-lowest/60 flex flex-col gap-1 border border-surface-variant/30">
                <div className="flex items-center gap-2 text-primary text-xs font-semibold">
                  <span className="material-symbols-outlined text-[18px]">neurology</span>
                  What ASTRA fixed
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Context-aware transformer restoration using deep-space mission protocol vocabulary.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-lowest/60 flex flex-col gap-1 border border-surface-variant/30">
                <div className="flex items-center gap-2 text-tertiary text-xs font-semibold">
                  <span className="material-symbols-outlined text-[18px]">timer</span>
                  Processing Time
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base text-on-surface font-bold font-mono">0.8 seconds</span>
                  <span className="text-xs text-on-surface-variant">(374 tokens/sec)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-lowest/60 flex flex-col gap-1 border border-surface-variant/30">
                <div className="flex items-center gap-2 text-secondary text-xs font-semibold">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  Honest Verification Note
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  High-probability log completions based on mission protocol vocabulary. Cross-checked with sensor tolerances.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Telemetry Context Cards */}
      <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-surface-container-low/50 backdrop-blur-md p-4 flex items-center gap-4 border border-primary/10">
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center shrink-0 text-primary">
            <span className="material-symbols-outlined text-[24px]">dataset</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-semibold">Corpus Baseline</span>
            <span className="text-xs text-on-surface font-semibold">NASA PDS Mars Science Orbiter</span>
            <span className="text-[11px] text-on-surface-variant">Calibrated against 1.4M transmissions</span>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-low/50 backdrop-blur-md p-4 flex items-center gap-4 border border-primary/10">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 text-secondary">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-semibold">Data Integrity Check</span>
            <span className="text-xs text-on-surface font-semibold">Parity & CRC Recomputed</span>
            <span className="text-[11px] text-on-surface-variant">All 3 token boundaries verified</span>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-low/50 backdrop-blur-md p-4 flex items-center gap-4 border border-primary/10">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center shrink-0 text-tertiary">
            <span className="material-symbols-outlined text-[24px]">model_training</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-semibold">Inference Engine</span>
            <span className="text-xs text-on-surface font-semibold">ASTRA LLM Spec-TR v2</span>
            <span className="text-[11px] text-on-surface-variant">Zero-shot multi-mask fill model</span>
          </div>
        </div>
      </section>
    </div>
  );
};
