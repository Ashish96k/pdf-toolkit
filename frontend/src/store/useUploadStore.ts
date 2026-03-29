import { create } from "zustand";

export interface UploadState {
  files: File[];
  isProcessing: boolean;
  progress: number;
  downloadUrl: string | null;
  downloadFilename: string | null;
  error: string | null;
  setFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  setProcessing: (value: boolean) => void;
  setProgress: (value: number) => void;
  setDownloadUrl: (url: string | null) => void;
  setDownloadFilename: (name: string | null) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  files: [],
  isProcessing: false,
  progress: 0,
  downloadUrl: null,
  downloadFilename: null,
  error: null,
  setFiles: (files) => set({ files }),
  addFiles: (files) =>
    set((state) => ({ files: [...state.files, ...files] })),
  removeFile: (index) =>
    set((state) => ({
      files: state.files.filter((_, i) => i !== index),
    })),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress) =>
    set({ progress: Math.min(100, Math.max(0, progress)) }),
  setDownloadUrl: (downloadUrl) => set({ downloadUrl }),
  setDownloadFilename: (downloadFilename) => set({ downloadFilename }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      files: [],
      isProcessing: false,
      progress: 0,
      downloadUrl: null,
      downloadFilename: null,
      error: null,
    }),
}));
