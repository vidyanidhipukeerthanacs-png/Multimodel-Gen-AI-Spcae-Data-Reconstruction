import React, { useState } from 'react';
import { NavTab, HistoryItem, ToastMessage } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ImageReconstructionView } from './components/ImageReconstructionView';
import { VideoReconstructionView } from './components/VideoReconstructionView';
import { AudioDenoisingView } from './components/AudioDenoisingView';
import { TextReconstructionView } from './components/TextReconstructionView';
import { HistoryView } from './components/HistoryView';
import { MatrixModal } from './components/MatrixModal';
import { Toast } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Initial telemetry database records
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    {
      id: 'ASTRA-GEN-4902',
      filename: 'europa_flyby_raw_04.png',
      hashId: 'SHA-256: 4e91...d28f',
      size: '24.8 MB',
      technique: 'Exemplar Inpainting',
      modality: 'image',
      timestamp: '12 Mar 2026, 14:22',
      status: 'Completed',
      metrics: '34.2% Area Infilled (1.4s)',
      previewUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD8j6RrVCSxJbjbHiUBAq19_hOpOxmyoChQCJ-6dEKVtDtWyRhPbs6iE_PljGzP7ngq424xwH53YdBZ3FB7CLNrfc-GlP6uDDp89XGuLhvyiRR5Gv9LxYxDaP9KvCAvsGA6GE4aO4pK-1t6tTBwTpUDU1yUzKXUGflXaIgJvcSlDXZeFElCMnHPkxZyCUVyMsdLWa5TY12rpn1uwMD2zPuF2msalhvoHyJt7UJCRrJNiUbOQY2vUeHKng',
    },
    {
      id: 'ASTRA-GEN-4899',
      filename: 'voyager_plasma_signal_ch2.wav',
      hashId: 'SHA-256: 3a9f...d482',
      size: '8.2 MB',
      technique: 'Denoised Plasma Freq',
      modality: 'audio',
      timestamp: '12 Mar 2026, 11:05',
      status: 'Completed',
      metrics: '+42.8 dB Noise Reduced · Dropouts Infilled',
    },
    {
      id: 'ASTRA-GEN-4881',
      filename: 'deep_space_telemetry_sol89.txt',
      hashId: 'SHA-256: 8f4c...c29b',
      size: '412 KB',
      technique: 'Syntactic Imputation',
      modality: 'text',
      timestamp: '11 Mar 2026, 19:40',
      status: 'Completed',
      metrics: '99.4% Confidence · 374 tok/sec',
    },
    {
      id: 'ASTRA-GEN-4874',
      filename: 'artemis_lunar_descent_cam1.mp4',
      hashId: 'SHA-256: 7d2e...b91a',
      size: '118.4 MB',
      technique: 'Temporal Super-Resolution',
      modality: 'video',
      timestamp: '10 Mar 2026, 09:15',
      status: 'Completed',
      metrics: '60 FPS Restored · 18 Frames Infilled',
      previewUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAjeIwm7GBjBFtCXg3ORJPRvpyUbM8_h4usUXox3eo6nNoywSEy0008y1YqDMK1rdZmiXDJsw7gCTdfg2A2fPhPYBQZfiZVl5aWUJ_4zeRuRlM-FhUjTNM8bUczDo1FcynKk_w_R1uhfzKLK1V9bLJLI8ToTMN-UoFD7Dd3znVGZb--QSo0VnKschGfJU1BX7z6t91sc1M1LDxhdb7XMMpcWX4oIOqUzKs7xfjQnnPvQtR0mWL4GKIHiA',
    },
  ]);

  const showToast = (text: string, icon = 'check_circle') => {
    setToast({ id: String(Date.now()), text, icon });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const handleAddHistory = (item: HistoryItem) => {
    setHistoryItems((prev) => [item, ...prev]);
  };

  const handleDeleteHistory = (id: string) => {
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Record purged from local telemetry archive', 'delete');
  };

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col relative selection:bg-primary-container selection:text-on-primary-container">
      {/* Ambient Celestial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-secondary-container/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-[5%] w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[160px]" />
      </div>

      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenMatrix={() => setIsMatrixOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="relative z-10 w-full pt-16 flex-1 bg-transparent max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenMatrix={() => setIsMatrixOpen(true)}
          />
        )}

        {activeTab === 'image' && (
          <ImageReconstructionView
            onShowToast={showToast}
            onAddHistory={handleAddHistory}
          />
        )}

        {activeTab === 'video' && (
          <VideoReconstructionView
            onShowToast={showToast}
            onAddHistory={handleAddHistory}
          />
        )}

        {activeTab === 'audio' && (
          <AudioDenoisingView
            onShowToast={showToast}
            onAddHistory={handleAddHistory}
          />
        )}

        {activeTab === 'text' && (
          <TextReconstructionView
            onShowToast={showToast}
            onAddHistory={handleAddHistory}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            historyItems={historyItems}
            onDeleteItem={handleDeleteHistory}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Global Academic Footer */}
      <Footer />

      {/* Cross-Modality Reconstruction Matrix Modal */}
      <MatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        onNavigate={handleNavigate}
        onShowToast={showToast}
      />

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
