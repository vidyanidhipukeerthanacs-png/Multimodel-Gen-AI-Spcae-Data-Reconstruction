import React, { useState } from 'react';

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <>
      <footer className="relative z-10 w-full bg-surface-container-lowest/90 backdrop-blur-xl mt-space-xl py-space-lg border-t border-surface-variant/30 shadow-[0_-1px_12px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <p className="font-body-sm text-sm text-on-surface-variant">
              ASTRA — Channabasaveshwara Institute of Technology, Dept. of ISE, 2025–26
            </p>
            <p className="font-label-md text-xs text-outline">
              Multimodal Generative AI for Deep Space Telemetry & Spectral Reconstruction
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              onClick={() => setActiveModal('docs')}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              Documentation
            </button>
            <button
              onClick={() => setActiveModal('paper')}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              Research Paper
            </button>
            <button
              onClick={() => setActiveModal('status')}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              API Status
            </button>
            <button
              onClick={() => setActiveModal('portal')}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              CIT ISE Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Footer Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-surface-container border border-primary/20 p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {activeModal === 'docs' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined">menu_book</span>
                  <h3 className="text-lg">ASTRA Architecture Documentation</h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  ASTRA combines four deep learning architectures for space telemetry restoration:
                </p>
                <ul className="text-xs text-on-surface space-y-1.5 list-disc list-inside">
                  <li><strong>Image:</strong> Latent diffusion prior for CCD radiation streak inpainting and 16-bit FITS reconstruction.</li>
                  <li><strong>Video:</strong> RIFE-Cosmo bidirectional optical flow for 12 fps to 60 fps frame synthesis.</li>
                  <li><strong>Audio:</strong> STFT U-Net GAN for coronal mass ejection static filtering and 1.420 GHz carrier recovery.</li>
                  <li><strong>Text:</strong> DeepSpace-BERT 11B masked language modeling for deep space telemetry packet inpainting.</li>
                </ul>
              </div>
            )}

            {activeModal === 'paper' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-secondary font-bold">
                  <span className="material-symbols-outlined">article</span>
                  <h3 className="text-lg">Final Year Research Paper 2025–26</h3>
                </div>
                <p className="text-xs font-semibold text-on-surface">
                  "Generative Inpainting and Spectral Denoisers for Corrupted Deep Space Telemetry Across Heterogeneous Planetary Modalities"
                </p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Authored by Dept. of Information Science & Engineering, Channabasaveshwara Institute of Technology. Demonstrates average +42.8 dB SNR gains in radio transmissions and 38.4 dB PSNR in planetary CCD reconstruction under cosmic radiation impingement.
                </p>
              </div>
            )}

            {activeModal === 'status' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined">network_check</span>
                  <h3 className="text-lg">Telemetry & API Gateway Status</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-surface-container-low">
                    <span>Goldstone DSN Antenna Relay:</span>
                    <span className="text-primary font-semibold">● ONLINE (28ms)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-surface-container-low">
                    <span>Inference Node V100-ASTRA:</span>
                    <span className="text-primary font-semibold">● READY (18.2x RT)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-surface-container-low">
                    <span>Telemetry Archive Node:</span>
                    <span className="text-primary font-semibold">● SQLite Local Active</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'portal' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-tertiary font-bold">
                  <span className="material-symbols-outlined">school</span>
                  <h3 className="text-lg">Channabasaveshwara Institute of Technology</h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Department of Information Science and Engineering (ISE).
                  Final Year Engineering Capstone Project 2025–2026.
                  Affiliated with VTU, Belagavi. Focus on High Performance Computing & Multimodal AI.
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-surface-variant/40 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
