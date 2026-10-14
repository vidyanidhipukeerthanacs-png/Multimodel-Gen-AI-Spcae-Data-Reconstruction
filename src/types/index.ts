export type NavTab = 'home' | 'image' | 'video' | 'audio' | 'text' | 'history';

export interface HistoryItem {
  id: string;
  filename: string;
  hashId: string;
  size: string;
  technique: string;
  modality: 'image' | 'video' | 'audio' | 'text';
  timestamp: string;
  status: 'Completed' | 'Processing' | 'Failed';
  metrics: string;
  downloadUrl?: string;
  previewUrl?: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  icon?: string;
  type?: 'success' | 'info' | 'error';
}
