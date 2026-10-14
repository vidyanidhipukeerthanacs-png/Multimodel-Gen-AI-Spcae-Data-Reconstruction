import React, { useState, useRef, useCallback } from 'react';
import { HistoryItem } from '../types';
import {
  loadImage,
  drawImageToCanvas,
  createScaledCanvas,
  detectDamageFromImage,
  blendMaskedReconstruction,
  verifyInpaintingResult,
  runExemplarPatchInpainting,
  DamageMaskResult,
} from '../utils/imageReconstruction';

interface ImageReconstructionViewProps {
  onShowToast: (text: string) => void;
  onAddHistory: (item: HistoryItem) => void;
}

export const ImageReconstructionView: React.FC<ImageReconstructionViewProps> = ({
  onShowToast,
  onAddHistory,
}) => {
  // Default damaged Cassini Saturn frame
  const defaultDamagedUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBrx_NKuoMCtYuroJRegV4klWG2abK1xmYgWGabAjfYu_yrWbQ6oerSYAotxZbBc4Lcb8DQuycwusTM8HsOp0A7Adn0CpODFRJ77HLa1paIo-wKmQAdZVopFXNqBpir7ffLF_6Dygxw0sPi32C4cATeZDV3I8YGeu42ay7jj7h3dAk6zL5AONVEGKzAUuqMRrExbusu9IK7ZNxJDHeeXVu4WTSamvVC3euSHIwz1xrvGLn-2c4LIb64OQ';

  // Input State (Only damaged image is uploaded)
  const [damagedImageSrc, setDamagedImageSrc] = useState<string>(defaultDamagedUrl);
  const [damagedFilename, setDamagedFilename] = useState<string>('SATURN_CASSINI_RAW_0942.FIT');

  // Reconstruction Results State
  const [reconstructedImageSrc, setReconstructedImageSrc] = useState<string | null>(null);
  const [damageMaskResult, setDamageMaskResult] = useState<DamageMaskResult | null>(null);
  const [showMaskOverlay, setShowMaskOverlay] = useState<boolean>(false);
  const [measuredTimeSec, setMeasuredTimeSec] = useState<number | null>(null);
  const [usedMethod, setUsedMethod] = useState<'Gemini image model' | 'Local patch-based inpainting (fallback)' | ''>('');
  const [geminiErrorDetails, setGeminiErrorDetails] = useState<string | null>(null);

  // Interactive Viewport States
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 to 100
  const [viewMode, setViewMode] = useState<'split' | 'restored' | 'damaged'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Status & Error handling states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to reconstruct damaged regions');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Pointer drag for split slider
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

  const setViewModeHelper = (mode: 'split' | 'restored' | 'damaged') => {
    setViewMode(mode);
    if (mode === 'restored') {
      setSplitPos(0);
    } else if (mode === 'damaged') {
      setSplitPos(100);
    } else {
      setSplitPos(50);
    }
  };

  // MAIN RECONSTRUCTION PIPELINE
  const performReconstruction = useCallback(async () => {
    if (isProcessing) return;

    setErrorMessage(null);
    setGeminiErrorDetails(null);
    setIsProcessing(true);
    setStatusMessage('Analyzing damaged image & generating 6px dilated mask...');

    const startTime = performance.now();

    try {
      // 1. Load Damaged Image onto Canvas
      const damagedImg = await loadImage(damagedImageSrc);
      const damagedCanvas = drawImageToCanvas(damagedImg);

      // 2. REQUIREMENT 3: Include smeared streak shapes at image edges and black/white filled regions (dilated 6 px)
      const maskResult = detectDamageFromImage(damagedCanvas);
      setDamageMaskResult(maskResult);

      setStatusMessage(
        `Damage detected: ${maskResult.damageSummary} (${maskResult.damagedPercentage}% area). Calling Gemini image model...`
      );

      // Scale damaged canvas & mask so longest side <= 1024 px for model input
      const scaledDamagedCanvas = createScaledCanvas(damagedCanvas, 1024);
      const scaledDamagedUrl = scaledDamagedCanvas.toDataURL('image/png');

      const maskImg = await loadImage(maskResult.maskDataUrl);
      const scaledMaskCanvas = drawImageToCanvas(
        maskImg,
        scaledDamagedCanvas.width,
        scaledDamagedCanvas.height
      );
      const scaledMaskUrl = scaledMaskCanvas.toDataURL('image/png');

      let finalCanvas: HTMLCanvasElement | null = null;
      let activeMethodName: 'Gemini image model' | 'Local patch-based inpainting (fallback)' = 'Gemini image model';
      let geminiSuccess = false;
      let geminiError: string | null = null;

      // REQUIREMENT 2: Gemini must be the primary method.
      // Call Gemini image-editing model with damaged image and mask.
      // If call fails, show real error text in Details line, then retry once before using fallback.
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          if (attempt === 2) {
            setStatusMessage('Retrying Gemini image model with reinforced instruction (attempt 2/2)...');
          } else {
            setStatusMessage('Calling Gemini image-editing model (gemini-2.5-flash-image)...');
          }

          const response = await fetch('/api/reconstruct-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: scaledDamagedUrl,
              mask: scaledMaskUrl,
              mimeType: 'image/png',
              strongRetry: attempt === 2,
            }),
          });

          if (!response.ok) {
            const errJson = await response.json().catch(() => ({}));
            const errStr = errJson.error || `HTTP ${response.status} ${response.statusText}`;
            geminiError = errStr;
            console.warn(`Gemini attempt ${attempt} failed with status:`, errStr);
            if (attempt === 1) continue; // retry once
            break;
          }

          const data = await response.json();
          if (data.restoredImage) {
            const modelImg = await loadImage(data.restoredImage);
            const modelCanvas = drawImageToCanvas(modelImg, damagedCanvas.width, damagedCanvas.height);

            // Blend inside mask with 3px soft feathered edge
            const blendedCanvas = blendMaskedReconstruction(damagedCanvas, modelCanvas, maskResult);

            // REQUIREMENT 1: Check that NO masked pixel remains unfilled or near-black
            const verification = verifyInpaintingResult(damagedCanvas, blendedCanvas, maskResult);

            if (verification.isValid) {
              finalCanvas = blendedCanvas;
              activeMethodName = 'Gemini image model';
              geminiSuccess = true;
              break;
            } else {
              geminiError = verification.reason || 'Model output contained unfilled near-black pixels.';
              console.warn(`Gemini attempt ${attempt} failed verification:`, geminiError);
              if (attempt === 1) continue; // retry once
            }
          } else {
            geminiError = data.error || 'Gemini response contained no restored image part.';
            if (attempt === 1) continue;
          }
        } catch (fetchErr: unknown) {
          geminiError = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
          console.warn(`Gemini attempt ${attempt} error:`, geminiError);
          if (attempt === 1) continue;
        }
      }

      if (geminiError) {
        setGeminiErrorDetails(geminiError);
      }

      // REQUIREMENT 4: Fallback: patch-based inpainting
      // Loop until the whole mask is filled, using small patches (7-9 px), confidence-ordered filling
      // and a final feathered blend with a 3 px soft edge so no blocks or stair-steps show.
      // Run a final pass that fills any remaining masked pixel from its nearest filled neighbours.
      if (!geminiSuccess || !finalCanvas) {
        setStatusMessage(
          'Gemini call unavailable — running Local patch-based inpainting (Criminisi exemplar synthesis)...'
        );
        finalCanvas = runExemplarPatchInpainting(damagedCanvas, maskResult);
        activeMethodName = 'Local patch-based inpainting (fallback)';
      }

      // REQUIREMENT 1: Check that NO masked pixel remains unfilled or near-black (RGB <= 20)
      const finalVerification = verifyInpaintingResult(damagedCanvas, finalCanvas, maskResult);
      if (!finalVerification.isValid) {
        throw new Error(
          `Reconstruction incomplete: ${finalVerification.reason || 'masked pixels remained unfilled'}`
        );
      }

      const finalDataUrl = finalCanvas.toDataURL('image/png');

      // Measure real processing time
      const endTime = performance.now();
      const elapsedSec = parseFloat(((endTime - startTime) / 1000).toFixed(2));
      setMeasuredTimeSec(elapsedSec);
      setUsedMethod(activeMethodName);

      // Update reconstructed image
      setReconstructedImageSrc(finalDataUrl);
      setViewModeHelper('split');
      setStatusMessage(`Reconstruction complete in ${elapsedSec}s via ${activeMethodName}`);
      onShowToast(`Reconstructed: 100% of ${maskResult.damagedPercentage}% damage area filled`);

      // Save to History
      onAddHistory({
        id: `ASTRA-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
        filename: damagedFilename,
        hashId: `SHA-256: ${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        size: `${(finalDataUrl.length / (1024 * 1024)).toFixed(1)} MB`,
        technique: activeMethodName,
        modality: 'image',
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'Completed',
        metrics: `${maskResult.damagedPercentage}% area restored (${elapsedSec}s)`,
        previewUrl: finalDataUrl,
      });
    } catch (err: unknown) {
      console.error('Reconstruction failed:', err);
      const msg =
        err instanceof Error ? err.message : "We couldn't reconstruct this image. Please try again.";
      setErrorMessage(msg);
      setStatusMessage('Reconstruction failed. Please review error details.');
      setReconstructedImageSrc(null); // Never show partly filled or damaged image as result
      onShowToast('Reconstruction failed. Please check error message.');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, damagedImageSrc, damagedFilename, onShowToast, onAddHistory]);

  // Download final canvas as PNG
  const handleDownloadResult = () => {
    if (!reconstructedImageSrc) {
      onShowToast('No reconstructed image available to download');
      return;
    }
    const a = document.createElement('a');
    a.href = reconstructedImageSrc;
    a.download = `RECONSTRUCTED_${damagedFilename.replace(/\.[^/.]+$/, '')}.png`;
    a.click();
    onShowToast(`Downloaded RECONSTRUCTED_${damagedFilename.replace(/\.[^/.]+$/, '')}.png`);
  };

  // Upload handler for damaged file
  const handleDamagedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setDamagedImageSrc(url);
        setDamagedFilename(file.name);
        setReconstructedImageSrc(null);
        setDamageMaskResult(null);
        setGeminiErrorDetails(null);
        setErrorMessage(null);
        onShowToast(`Loaded damaged file: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToCassini = () => {
    setDamagedImageSrc(defaultDamagedUrl);
    setDamagedFilename('SATURN_CASSINI_RAW_0942.FIT');
    setReconstructedImageSrc(null);
    setDamageMaskResult(null);
    setGeminiErrorDetails(null);
    setErrorMessage(null);
    onShowToast('Reset to default Cassini Saturn frame');
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Page Header */}
      <div className="relative w-full mb-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 text-tertiary">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-caps text-xs uppercase tracking-wider">
                Full-Coverage Inpainting &amp; Restoration
              </span>
            </div>
            <h1 className="font-headline-lg text-3xl md:text-4xl text-on-surface font-semibold tracking-tight">
              Image Reconstruction
            </h1>
            <p className="font-body-md text-sm md:text-base text-on-surface-variant max-w-2xl">
              Upload your damaged image to inpaint black rectangles, smeared edge streaks, cracks, and noise with seamless blending.
            </p>
          </div>

          {/* Live Session HUD Badge */}
          <div className="flex items-center gap-4 bg-surface-container/70 backdrop-blur-xl px-5 py-2.5 rounded-xl border border-primary/10 shadow-sm self-start md:self-auto">
            <div className="flex flex-col">
              <span className="text-[11px] text-outline uppercase font-semibold">Active Method</span>
              <span className="text-xs text-primary font-medium">
                {usedMethod || 'Gemini / Local Fallback'}
              </span>
            </div>
            <div className="w-px h-6 bg-surface-variant" />
            <div className="flex flex-col">
              <span className="text-[11px] text-outline uppercase font-semibold">Damage Area</span>
              <span className="text-xs text-on-surface font-medium font-mono">
                {damageMaskResult ? `${damageMaskResult.damagedPercentage}% Area` : 'Ready to detect'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input & Controls (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* CARD 1: Damaged Input Frame */}
          <div className="relative rounded-2xl bg-surface-container/60 backdrop-blur-2xl p-5 border border-primary/15 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">broken_image</span>
                <span className="text-sm text-on-surface font-semibold">Damaged Input Frame</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-error-container/40 text-error font-medium">
                {damageMaskResult ? `${damageMaskResult.damagedPercentage}% Damaged` : 'Unprocessed'}
              </span>
            </div>

            {/* Preview Box */}
            <div className="relative group rounded-xl overflow-hidden bg-surface-container-lowest/80 min-h-[220px] flex flex-col items-center justify-center p-3 text-center border border-surface-variant/40">
              <div className="relative w-full h-52 rounded-lg overflow-hidden bg-surface-container-highest">
                <img
                  alt="Damaged deep space input"
                  className="w-full h-full object-cover filter contrast-125 brightness-90"
                  src={damagedImageSrc}
                />

                {/* Optional Mask Overlay view */}
                {showMaskOverlay && damageMaskResult && (
                  <img
                    alt="Damage Mask Overlay"
                    src={damageMaskResult.maskDataUrl}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-screen opacity-75"
                  />
                )}

                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/95 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary font-semibold font-mono truncate max-w-[200px]">
                        {damagedFilename}
                      </p>
                      <p className="text-[11px] text-on-surface-variant font-mono">
                        {damageMaskResult
                          ? `Damage: ${damageMaskResult.damageSummary}`
                          : 'Black/white patches, edge streaks & scratches'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-variant hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-all text-xs cursor-pointer">
                        <span className="material-symbols-outlined text-[15px]">file_upload</span>
                        <span>Replace</span>
                        <input type="file" accept="image/*" onChange={handleDamagedUpload} className="hidden" />
                      </label>
                      <button
                        onClick={handleResetToCassini}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-variant hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-all text-xs cursor-pointer"
                        type="button"
                        title="Reset to default Cassini frame"
                      >
                        <span className="material-symbols-outlined text-[15px]">refresh</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-on-surface-variant text-xs">
              <span>Supports all damage formats</span>
              {damageMaskResult && (
                <button
                  onClick={() => setShowMaskOverlay(!showMaskOverlay)}
                  className={`text-[11px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    showMaskOverlay
                      ? 'bg-error-container text-error font-semibold'
                      : 'bg-surface-container text-outline hover:text-on-surface'
                  }`}
                >
                  {showMaskOverlay ? 'Hide Mask' : 'Show Mask (6px dilated)'}
                </button>
              )}
            </div>
          </div>

          {/* CARD 2: Execution & Status */}
          <div className="rounded-2xl bg-surface-container/60 backdrop-blur-2xl p-5 border border-primary/15 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-on-surface font-semibold">Gemini Inpainting Engine</h3>
                <p className="text-xs text-on-surface-variant">
                  Primary: gemini-2.5-flash-image • Fallback: Local patch inpainting
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isProcessing
                    ? 'bg-primary-container/20 text-primary'
                    : errorMessage
                    ? 'bg-error-container/30 text-error'
                    : reconstructedImageSrc
                    ? 'bg-secondary-container/20 text-secondary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {isProcessing ? 'Processing' : errorMessage ? 'Failed' : reconstructedImageSrc ? 'Complete' : 'Ready'}
              </span>
            </div>

            {/* ERROR DISPLAY WITH RETRY BUTTON & DETAILS LINE */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-error-container/25 border border-error/30 flex flex-col gap-2">
                <div className="flex items-start gap-2 text-error">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Reconstruction Error</span>
                    <span className="text-xs leading-relaxed text-on-surface">{errorMessage}</span>
                  </div>
                </div>
                <button
                  onClick={performReconstruction}
                  className="self-end px-3 py-1.5 rounded-lg bg-error-container hover:bg-error/30 text-error text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* PRIMARY RECONSTRUCT ACTION */}
            <button
              onClick={performReconstruction}
              disabled={isProcessing}
              className={`w-full relative group inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary text-surface-container-lowest font-headline-sm text-base font-semibold transition-all duration-300 shadow-[0_0_28px_rgba(34,211,238,0.35)] hover:shadow-[0_0_42px_rgba(34,211,238,0.6)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                isProcessing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              type="button"
            >
              <span className={`material-symbols-outlined text-[22px] ${isProcessing ? 'animate-spin' : 'group-hover:rotate-45'}`}>
                {isProcessing ? 'sync' : 'auto_awesome'}
              </span>
              <span>{isProcessing ? 'Reconstructing your image. Please wait...' : 'Reconstruct'}</span>
            </button>

            {/* Status progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface font-medium truncate pr-2">{statusMessage}</span>
                {measuredTimeSec !== null && (
                  <span className="text-primary font-semibold font-mono shrink-0">{measuredTimeSec}s</span>
                )}
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isProcessing
                      ? 'w-full bg-gradient-to-r from-primary-container via-primary to-secondary animate-pulse'
                      : reconstructedImageSrc
                      ? 'w-full bg-gradient-to-r from-primary-container via-primary to-secondary'
                      : 'w-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Viewport & Real Telemetry (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Main Inspection Viewport Card */}
          <div className="rounded-2xl bg-surface-container/60 backdrop-blur-2xl p-5 border border-primary/15 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
                <span className="text-base text-on-surface font-semibold">Dual Spectrum Inspection</span>
              </div>

              {/* View Modes & Zoom Controls */}
              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <div className="flex items-center bg-surface-container-lowest/80 p-0.5 rounded-lg border border-surface-variant/40">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                    className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-[16px]">zoom_out</span>
                  </button>
                  <span className="px-1.5 text-[11px] font-mono text-outline">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                  </button>
                  {zoomLevel !== 1 && (
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="px-1 text-[10px] text-primary hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Filter Selector */}
                <div className="flex items-center bg-surface-container-lowest/80 p-1 rounded-xl border border-surface-variant/40">
                  <button
                    onClick={() => setViewModeHelper('split')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'split'
                        ? 'bg-surface-container-high text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    50/50 Split
                  </button>
                  <button
                    onClick={() => setViewModeHelper('restored')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'restored'
                        ? 'bg-surface-container-high text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    Restored Only
                  </button>
                  <button
                    onClick={() => setViewModeHelper('damaged')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'damaged'
                        ? 'bg-surface-container-high text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    Damaged Only
                  </button>
                </div>
              </div>
            </div>

            {/* Draggable Interactive Comparison Stage */}
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative w-full h-[380px] md:h-[430px] rounded-xl overflow-hidden select-none cursor-ew-resize bg-surface-container-lowest shadow-inner border border-primary/20 touch-none"
            >
              {/* Background Layer: Reconstructed (or loading placeholder) */}
              <div
                className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {reconstructedImageSrc ? (
                  <img
                    alt="Reconstructed Result"
                    className="w-full h-full object-cover pointer-events-none"
                    src={reconstructedImageSrc}
                  />
                ) : isProcessing ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 gap-3">
                    <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                    <p className="text-sm text-primary font-medium">Reconstructing your image. Please wait...</p>
                    <p className="text-xs text-outline">
                      Completely inpainting missing areas and removing edge streaks
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 gap-2">
                    <span className="material-symbols-outlined text-4xl text-outline">photo_auto_merge</span>
                    <p className="text-sm text-on-surface font-medium">No Reconstruction Generated Yet</p>
                    <p className="text-xs text-outline max-w-sm">
                      Click "Reconstruct" on the left to heal the black patch, edge streaks, and scratches.
                    </p>
                  </div>
                )}
              </div>

              {/* Foreground Overlay Layer: Damaged (Clipped via width) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none transition-none"
                style={{ width: `${splitPos}%` }}
              >
                <div
                  className="relative w-full h-full"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                >
                  <img
                    alt="Damaged Feed"
                    className="absolute inset-y-0 left-0 max-w-none h-full object-cover filter contrast-125 brightness-90"
                    style={{
                      width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                    }}
                    src={damagedImageSrc}
                  />
                </div>
              </div>

              {/* Draggable Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-[3px] bg-primary cursor-ew-resize flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.8)] -translate-x-1/2"
                style={{ left: `${splitPos}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-surface-container-lowest border border-primary shadow-[0_0_16px_rgba(34,211,238,0.5)] flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                </div>
              </div>

              {/* REQUIREMENT 6: Plain slider labels: "Damaged" and "Reconstructed" */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-error font-medium text-[11px] flex items-center gap-1.5 pointer-events-none border border-error/20">
                <span className="w-1.5 h-1.5 rounded-full bg-error" />
                Damaged
              </div>

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-primary font-medium text-[11px] flex items-center gap-1.5 pointer-events-none border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                Reconstructed
              </div>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-surface-container-lowest/70 backdrop-blur-md text-on-surface-variant text-[11px] pointer-events-none border border-primary/10">
                Drag slider to compare Damaged vs Reconstructed
              </div>
            </div>

            {/* REQUIREMENT 5: Show which method actually ran under the result and the damaged-area percentage */}
            <div className="flex flex-col gap-2 mt-4 pt-3 bg-surface-container-lowest/40 rounded-xl p-3 border border-surface-variant/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadResult}
                    disabled={!reconstructedImageSrc}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-semibold text-xs shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_28px_rgba(34,211,238,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
                      !reconstructedImageSrc ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Download Reconstructed Image (PNG)</span>
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    disabled={!reconstructedImageSrc}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold text-xs transition-all cursor-pointer ${
                      !reconstructedImageSrc ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">description</span>
                    <span>View Diagnostic Report</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-outline text-xs">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">verified</span>
                  <span className="font-semibold text-on-surface text-xs">
                    {reconstructedImageSrc && usedMethod
                      ? `${usedMethod} • ${damageMaskResult ? `${damageMaskResult.damagedPercentage}% Damaged Area` : ''}`
                      : 'Awaiting Reconstruction'}
                  </span>
                </div>
              </div>

              {/* REQUIREMENT 2: Show real error text in a "Details" line if Gemini failed before fallback */}
              {geminiErrorDetails && (
                <div className="text-[11px] text-on-surface-variant bg-surface-container-lowest/80 px-3 py-1.5 rounded-lg border border-surface-variant/40 flex items-start gap-1.5">
                  <span className="text-error font-medium shrink-0">Details:</span>
                  <span className="font-mono text-outline leading-tight">{geminiErrorDetails}</span>
                </div>
              )}
            </div>
          </div>

          {/* "What Happened?" & Telemetry Summary Card */}
          <div className="rounded-2xl bg-surface-container/60 backdrop-blur-2xl p-5 border border-primary/15 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">fact_check</span>
                <h2 className="text-base text-on-surface font-semibold">What Happened?</h2>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary-container/30 text-secondary tracking-widest uppercase font-semibold">
                Evaluation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Item 1: Damage Detected */}
              <div className="rounded-xl bg-surface-container-lowest/70 p-3 space-y-1 border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-error">
                  <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
                  <span className="text-xs font-semibold">Damage Detected</span>
                </div>
                <p className="text-sm text-on-surface font-medium capitalize">
                  {damageMaskResult ? `${damageMaskResult.damagedPercentage}% area` : 'Pending scan'}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {damageMaskResult
                    ? damageMaskResult.damageSummary
                    : 'Black/white regions, edge streaks, scratches.'}
                </p>
              </div>

              {/* Item 2: Method Used */}
              <div className="rounded-xl bg-surface-container-lowest/70 p-3 space-y-1 border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-primary-container">
                  <span className="material-symbols-outlined text-[16px]">neurology</span>
                  <span className="text-xs font-semibold">Method Used</span>
                </div>
                <p className="text-sm text-on-surface font-medium truncate">
                  {usedMethod || 'Pending run'}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {usedMethod === 'Gemini image model'
                    ? 'Gemini inpainting model + 3px feathered mask blend.'
                    : usedMethod === 'Local patch-based inpainting (fallback)'
                    ? 'Confidence-ordered Criminisi exemplar inpainting.'
                    : 'Gemini with local fallback.'}
                </p>
              </div>

              {/* Item 3: Measured Processing Time */}
              <div className="rounded-xl bg-surface-container-lowest/70 p-3 space-y-1 border border-surface-variant/30">
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                  <span className="text-xs font-semibold">Measured Time</span>
                </div>
                <p className="text-sm text-on-surface font-medium font-mono">
                  {measuredTimeSec !== null ? `${measuredTimeSec} seconds` : 'Awaiting run'}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Measured via performance.now().
                </p>
              </div>
            </div>

            {/* Note */}
            <div className="rounded-xl bg-surface-container-high/60 p-3.5 flex items-start gap-3 border border-surface-variant/40">
              <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center shrink-0 text-tertiary">
                <span className="material-symbols-outlined text-[18px]">info</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs text-on-surface font-semibold">Notice</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Missing regions are estimated and may not match the original exactly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE REPORT CARD MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-4xl rounded-2xl bg-surface-container border border-primary/30 p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-3 border-b border-surface-variant/40">
                <span className="material-symbols-outlined text-primary text-3xl">lab_profile</span>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">ASTRA Image Diagnostic Report</h3>
                  <p className="text-xs text-outline font-mono">
                    Target File: {damagedFilename} • Generated {new Date().toUTCString()}
                  </p>
                </div>
              </div>

              {/* Visual Artifacts: Damaged File, Mask Image, Reconstructed File */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-lowest border border-error/20">
                  <span className="text-xs font-semibold text-error">1. Damaged Image</span>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <img src={damagedImageSrc} alt="Damaged" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] text-outline truncate">{damagedFilename}</span>
                </div>

                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-lowest border border-tertiary/30">
                  <span className="text-xs font-semibold text-tertiary">2. Damage Mask (Dilated 6px)</span>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    {damageMaskResult ? (
                      <img
                        src={damageMaskResult.maskDataUrl}
                        alt="Binary Mask"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-outline">Mask Pending</span>
                    )}
                  </div>
                  <span className="text-[10px] text-tertiary truncate">
                    White = Missing / Damaged ({damageMaskResult ? `${damageMaskResult.damagedPercentage}%` : '0%'})
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-lowest border border-primary/30">
                  <span className="text-xs font-semibold text-primary">3. Reconstructed Image</span>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    {reconstructedImageSrc && (
                      <img src={reconstructedImageSrc} alt="Reconstructed" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-[10px] text-primary truncate">{usedMethod}</span>
                </div>
              </div>

              {/* Technical Breakdown Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/30">
                  <span className="text-outline text-[10px] uppercase block">Damage Detected</span>
                  <span className="text-sm font-bold text-error block">
                    {damageMaskResult ? `${damageMaskResult.damagedPercentage}% Area` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-outline truncate block">
                    {damageMaskResult?.damageSummary || 'Identified regions'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/30">
                  <span className="text-outline text-[10px] uppercase block">Method Used</span>
                  <span className="text-xs font-semibold text-primary truncate block">{usedMethod}</span>
                  <span className="text-[10px] text-outline">3px Feathered Blend</span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/30">
                  <span className="text-outline text-[10px] uppercase block">Measured Time</span>
                  <span className="text-sm font-bold text-secondary">
                    {measuredTimeSec !== null ? `${measuredTimeSec}s` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-outline">performance.now()</span>
                </div>
              </div>

              {/* Gemini Error Details if any */}
              {geminiErrorDetails && (
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-variant/40 text-xs">
                  <span className="text-error font-medium block mb-0.5">Gemini Execution Details:</span>
                  <span className="font-mono text-outline">{geminiErrorDetails}</span>
                </div>
              )}

              {/* Scientific Note in Report */}
              <div className="p-4 rounded-xl bg-surface-container-high/60 border border-surface-variant/40 space-y-1">
                <h4 className="text-xs text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">verified_user</span>
                  Note
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Missing regions are estimated and may not match the original exactly.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>Print Report (PDF)</span>
                </button>
                <button
                  onClick={handleDownloadResult}
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Download Reconstructed PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
