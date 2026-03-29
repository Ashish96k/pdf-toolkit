"use client";

import { useCallback, useRef } from "react";
import api from "@/lib/axios";
import { suggestedDocxFilename } from "@/lib/suggestedDocxFilename";
import { useUploadStore } from "@/store/useUploadStore";

export type SplitPDFOptions =
  | { mode: "all" }
  | { mode: "range"; range: string };

export type CompressionLevel = "low" | "medium" | "high";

export type CompressPDFResult = {
  downloadUrl: string;
  originalSize: number;
  compressedSize: number;
};

function resolveDownloadUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base =
    typeof process.env.NEXT_PUBLIC_API_URL === "string"
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
      : "";
  if (base && pathOrUrl.startsWith("/")) {
    return `${base}${pathOrUrl}`;
  }
  return pathOrUrl;
}

export function usePDFProcess() {
  const blobUrlRef = useRef<string | null>(null);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const mergePDF = useCallback(
    async (files: File[]) => {
      revokeBlobUrl();

      const { setProcessing, setProgress, setDownloadUrl, setDownloadFilename, setError } =
        useUploadStore.getState();

      setError(null);
      setDownloadUrl(null);
      setDownloadFilename(null);
      setProcessing(true);
      setProgress(1);

      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      try {
        const response = await api.post<Blob>("/api/merge", formData, {
          responseType: "blob",
          onUploadProgress: (event) => {
            const total = event.total;
            if (total && total > 0) {
              setProgress(Math.round((event.loaded / total) * 100));
            }
          },
        });

        const blob = response.data;
        const contentType = String(
          response.headers["content-type"] ?? ""
        ).toLowerCase();

        if (contentType.includes("application/json")) {
          const text = await blob.text();
          const json = JSON.parse(text) as {
            url?: string;
            downloadUrl?: string;
          };
          const url = json.url ?? json.downloadUrl;
          if (url) {
            setDownloadUrl(url);
          } else {
            useUploadStore.getState().setError("Invalid response from server");
          }
        } else {
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setDownloadUrl(url);
        }

        setProgress(100);
      } catch {
        // Error message is set by the axios response interceptor.
      } finally {
        setProcessing(false);
      }
    },
    [revokeBlobUrl]
  );

  const splitPDF = useCallback(
    async (file: File, splitOptions: SplitPDFOptions) => {
      revokeBlobUrl();

      const {
        setProcessing,
        setProgress,
        setDownloadUrl,
        setDownloadFilename,
        setError,
      } = useUploadStore.getState();

      setError(null);
      setDownloadUrl(null);
      setDownloadFilename(null);
      setProcessing(true);
      setProgress(1);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", splitOptions.mode);
      if (splitOptions.mode === "range") {
        formData.append("range", splitOptions.range);
      }

      try {
        const response = await api.post<Blob>("/api/split", formData, {
          responseType: "blob",
          onUploadProgress: (event) => {
            const total = event.total;
            if (total && total > 0) {
              setProgress(Math.round((event.loaded / total) * 100));
            }
          },
        });

        const blob = response.data;
        const contentType = String(
          response.headers["content-type"] ?? ""
        ).toLowerCase();

        if (contentType.includes("application/json")) {
          const text = await blob.text();
          const json = JSON.parse(text) as {
            url?: string;
            downloadUrl?: string;
          };
          const url = json.url ?? json.downloadUrl;
          if (url) {
            setDownloadUrl(url);
            setDownloadFilename(null);
          } else {
            useUploadStore.getState().setError("Invalid response from server");
          }
        } else {
          if (contentType.includes("application/zip")) {
            setDownloadFilename("split-pages.zip");
          } else {
            setDownloadFilename("split.pdf");
          }
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setDownloadUrl(url);
        }

        setProgress(100);
      } catch {
        /* error set by axios interceptor */
      } finally {
        setProcessing(false);
      }
    },
    [revokeBlobUrl]
  );

  const compressPDF = useCallback(
    async (file: File, level: CompressionLevel) => {
      revokeBlobUrl();

      const {
        setProcessing,
        setProgress,
        setDownloadUrl,
        setDownloadFilename,
        setError,
      } = useUploadStore.getState();

      setError(null);
      setDownloadUrl(null);
      setDownloadFilename(null);
      setProcessing(true);
      setProgress(1);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("level", level);

      try {
        const response = await api.post<{
          downloadUrl: string;
          originalSize: number;
          compressedSize: number;
        }>("/api/compress", formData, {
          onUploadProgress: (event) => {
            const total = event.total;
            if (total && total > 0) {
              setProgress(Math.round((event.loaded / total) * 100));
            }
          },
        });

        const { downloadUrl, originalSize, compressedSize } = response.data;
        if (!downloadUrl) {
          useUploadStore.getState().setError("Invalid response from server");
          return null;
        }

        const url = resolveDownloadUrl(downloadUrl);
        setDownloadUrl(url);
        setDownloadFilename("compressed.pdf");
        setProgress(100);

        return {
          downloadUrl: url,
          originalSize,
          compressedSize,
        } satisfies CompressPDFResult;
      } catch {
        return null;
      } finally {
        setProcessing(false);
      }
    },
    [revokeBlobUrl]
  );

  const convertPDFToWord = useCallback(
    async (file: File) => {
      revokeBlobUrl();

      const {
        setProcessing,
        setProgress,
        setDownloadUrl,
        setDownloadFilename,
        setError,
      } = useUploadStore.getState();

      setError(null);
      setDownloadUrl(null);
      setDownloadFilename(null);
      setProcessing(true);
      setProgress(1);

      const suggestedName = suggestedDocxFilename(file.name);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await api.post<{ downloadUrl: string }>(
          "/api/pdf-to-word",
          formData,
          {
            onUploadProgress: (event) => {
              const total = event.total;
              if (total && total > 0) {
                setProgress(Math.round((event.loaded / total) * 100));
              }
            },
          }
        );

        const { downloadUrl: pathOrUrl } = response.data;
        if (!pathOrUrl) {
          useUploadStore.getState().setError("Invalid response from server");
          return null;
        }

        const url = resolveDownloadUrl(pathOrUrl);
        setDownloadUrl(url);
        setDownloadFilename(suggestedName);
        setProgress(100);

        return { downloadUrl: url };
      } catch {
        return null;
      } finally {
        setProcessing(false);
      }
    },
    [revokeBlobUrl]
  );

  return { mergePDF, splitPDF, compressPDF, convertPDFToWord, revokeBlobUrl };
}
