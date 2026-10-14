import React, { useState, useEffect, useRef } from 'react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onDeleteItem: (id: string) => void;
  onShowToast: (text: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyItems,
  onDeleteItem,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'text'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredItems = historyItems.filter((item) => {
    const matchesFilter = filter === 'all' || item.modality === filter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.filename.toLowerCase().includes(query) ||
      item.modality.toLowerCase().includes(query) ||
      item.technique.toLowerCase().includes(query) ||
      item.hashId.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const handleDownloadResult = (item: HistoryItem) => {
    if (item.previewUrl) {
      const a = document.createElement('a');
      a.href = item.previewUrl;
      a.download = `RECONSTRUCTED_${item.filename.replace(/\.[^/.]+$/, '')}.png`;
      a.click();
      onShowToast(`Downloaded reconstructed result for ${item.filename}`);
    } else {
      onShowToast(`Downloading result for ${item.filename}`);
    }
  };

  const handleDownloadReport = (item: HistoryItem) => {
    const report = {
      recordId: item.id,
      filename: item.filename,
      hashId: item.hashId,
      modality: item.modality,
      technique: item.technique,
      status: item.status,
      timestampUtc: item.timestamp,
      fidelityMetrics: item.metrics,
      database: 'SQLite v3.45 Telemetry Archive',
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}_DIAGNOSTIC_REPORT.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`Downloaded report for ${item.filename}`);
  };

  const getModalityIcon = (mod: string) => {
    switch (mod) {
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'audio':
        return 'graphic_eq';
      case 'text':
        return 'description';
      default:
        return 'dataset';
    }
  };

  const getModalityColor = (mod: string) => {
    switch (mod) {
      case 'image':
        return 'text-primary bg-primary-container/15';
      case 'video':
        return 'text-primary-fixed-dim bg-primary/10';
      case 'audio':
        return 'text-secondary bg-secondary-container/25';
      case 'text':
        return 'text-tertiary-fixed bg-tertiary-container/20';
      default:
        return 'text-on-surface bg-surface-container';
    }
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Page Header & Metrics Strip */}
      <div className="relative pt-4 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            <span className="font-label-caps text-xs uppercase tracking-wider text-primary font-semibold">
              Telemetry Archive Node
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-4xl text-on-surface tracking-tight font-semibold">
            Reconstruction History
          </h1>
          <p className="font-body-md text-sm md:text-base text-on-surface-variant">
            Past reconstructed space data stored in mission database.
          </p>
        </div>

        {/* Quick Telemetry HUD */}
        <div className="flex items-center gap-4 bg-surface-container-low/70 backdrop-blur-xl p-3 px-5 rounded-2xl border border-primary/15 shadow-sm self-start md:self-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-semibold">Active Database</span>
            <span className="text-xs text-primary font-semibold flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-[16px]">database</span>
              SQLite v3.45 Local
            </span>
          </div>
          <div className="w-px h-8 bg-surface-container-highest" />
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-semibold">Reconstruction Health</span>
            <span className="text-xs text-tertiary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              100% Fidelity
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-surface-container-low/60 backdrop-blur-2xl rounded-2xl p-3 flex flex-col lg:flex-row items-center justify-between gap-4 border border-primary/15 shadow-sm mb-6">
        {/* Search Input */}
        <div className="relative w-full lg:w-96 flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files by name or modality..."
            className="w-full bg-surface-container-lowest/80 text-on-surface text-xs rounded-xl pl-10 pr-12 py-2.5 placeholder:text-outline border border-surface-variant/40 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(34,211,238,0.3)] transition-all"
          />
          <kbd className="hidden sm:inline-flex absolute right-3 font-mono text-[10px] text-outline bg-surface-container-high px-1.5 py-0.5 rounded border border-surface-variant/40">
            ⌘K
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'all'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                : 'text-on-surface-variant bg-surface-container-lowest/60 hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 bg-black/20 rounded-full text-[10px]">{historyItems.length}</span>
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'image'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                : 'text-on-surface-variant bg-surface-container-lowest/60 hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">image</span>
            <span>Images</span>
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'video'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                : 'text-on-surface-variant bg-surface-container-lowest/60 hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            <span>Videos</span>
          </button>
          <button
            onClick={() => setFilter('audio')}
            className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'audio'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                : 'text-on-surface-variant bg-surface-container-lowest/60 hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
            <span>Audio</span>
          </button>
          <button
            onClick={() => setFilter('text')}
            className={`px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'text'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(34,211,238,0.3)]'
                : 'text-on-surface-variant bg-surface-container-lowest/60 hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Text</span>
          </button>
        </div>
      </div>

      {/* History Container Matrix */}
      <div className="bg-surface-container-low/50 backdrop-blur-2xl rounded-[24px] p-4 lg:p-6 border border-primary/15 shadow-xl overflow-hidden flex flex-col gap-2">
        {/* Table Header Bar */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-4 pb-2 text-outline text-[11px] uppercase tracking-wider font-semibold">
          <div className="col-span-5 flex items-center gap-2">
            <span>Target File & Hash ID</span>
          </div>
          <div className="col-span-2">Modality</div>
          <div className="col-span-2">Timestamp (UTC)</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Rows Stack */}
        <div className="flex flex-col gap-2.5">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-sm">
              No matching reconstruction logs found in telemetry pool.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-surface-container/60 hover:bg-surface-container-high/80 rounded-2xl p-4 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(34,211,238,0.08)] border border-surface-variant/30 hover:border-primary/30 flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 items-start lg:items-center"
              >
                {/* Col 1-5: File Info */}
                <div className="col-span-5 flex items-center gap-3 w-full">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner ${getModalityColor(
                      item.modality
                    )}`}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {getModalityIcon(item.modality)}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors font-mono">
                      {item.filename}
                    </span>
                    <span className="text-xs text-outline truncate flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px]">{item.id}</span>
                      <span>•</span>
                      <span className="text-on-surface-variant font-mono text-[11px]">{item.size}</span>
                      <span>•</span>
                      <span className="text-tertiary">{item.technique}</span>
                    </span>
                  </div>
                </div>

                {/* Col 6-7: Modality */}
                <div className="col-span-2 flex items-center gap-2">
                  <span className="lg:hidden text-outline text-[10px] uppercase">Modality:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary text-xs font-medium capitalize">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item.modality}
                  </span>
                </div>

                {/* Col 8-9: Timestamp */}
                <div className="col-span-2 flex items-center gap-1.5 text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-outline text-[16px]">schedule</span>
                  <span>{item.timestamp}</span>
                </div>

                {/* Col 10: Status */}
                <div className="col-span-1 flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(34,211,238,0.9)] animate-pulse" />
                    {item.status}
                  </span>
                </div>

                {/* Col 11-12: Actions */}
                <div className="col-span-2 w-full lg:w-auto flex items-center justify-end gap-1.5 pt-2 lg:pt-0 border-t border-surface-container-highest/50 lg:border-t-0">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors cursor-pointer"
                    title="View Preview"
                  >
                    <span className="material-symbols-outlined text-[19px]">visibility</span>
                  </button>
                  <button
                    onClick={() => handleDownloadResult(item)}
                    className="px-2.5 py-1.5 rounded-xl bg-surface-container-highest text-on-surface hover:text-primary hover:bg-surface-bright text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                    title="Download Result"
                  >
                    <span className="material-symbols-outlined text-[17px]">download</span>
                    <span className="hidden xl:inline">Result</span>
                  </button>
                  <button
                    onClick={() => handleDownloadReport(item)}
                    className="px-2.5 py-1.5 rounded-xl bg-surface-container-highest text-on-surface-variant hover:text-on-surface hover:bg-surface-bright text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                    title="Download Report"
                  >
                    <span className="material-symbols-outlined text-[17px]">lab_profile</span>
                    <span className="hidden xl:inline">Report</span>
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <span className="material-symbols-outlined text-[19px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination & Storage Indicator Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-3 text-on-surface-variant text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-container" />
          <span>Showing {filteredItems.length} of {historyItems.length} stored reconstructions · SQLite Local DB</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-container-lowest/80 p-1 rounded-xl border border-surface-variant/40">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-outline disabled:opacity-40" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-2 text-xs font-semibold text-primary">1</span>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-outline disabled:opacity-40" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
          <span className="text-outline">Page 1 of 1</span>
        </div>
      </div>

      {/* Storage Allocation Metric Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low/40 rounded-2xl p-4 flex items-center gap-4 border border-primary/10 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">hard_drive</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-semibold">Storage Allocation</span>
            <span className="text-xs text-on-surface font-semibold font-mono">151.8 MB / 2.0 GB Local Pool</span>
          </div>
        </div>

        <div className="bg-surface-container-low/40 rounded-2xl p-4 flex items-center gap-4 border border-primary/10 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-semibold">Inpainting Fidelity</span>
            <span className="text-xs text-on-surface font-semibold font-mono">Exemplar & Generative Synthesis</span>
          </div>
        </div>

        <div className="bg-surface-container-low/40 rounded-2xl p-4 flex items-center gap-4 border border-primary/10 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[20px]">sync_saved_locally</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-semibold">Autonomous Backup</span>
            <span className="text-xs text-on-surface font-semibold">Sync Active (Sol Orbit Clock)</span>
          </div>
        </div>
      </div>

      {/* Preview Modal for selected history item */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl bg-surface-container border border-primary/30 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/40 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {getModalityIcon(previewItem.modality)}
                </span>
                <span className="text-sm font-semibold font-mono">{previewItem.filename}</span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {previewItem.previewUrl ? (
                <div className="rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                  <img src={previewItem.previewUrl} alt={previewItem.filename} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-surface-container-lowest font-mono text-xs text-on-surface-variant">
                  [TELEMETRY PAYLOAD]: MISSION_LOG_SOL_412: Atmospheric probe entered Martian ionosphere. Radiation flux reached 148.2 rads/hr. Telemetry status: NOMINAL.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-container-low">
                  <span className="text-[10px] text-outline uppercase block">Architecture</span>
                  <span className="text-on-surface font-medium">{previewItem.technique}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low">
                  <span className="text-[10px] text-outline uppercase block">Verification</span>
                  <span className="text-primary font-mono">{previewItem.metrics}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    handleDownloadResult(previewItem);
                    setPreviewItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold"
                >
                  Download Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
