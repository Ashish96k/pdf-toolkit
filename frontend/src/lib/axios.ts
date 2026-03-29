import axios, { AxiosError } from "axios";
import { useUploadStore } from "@/store/useUploadStore";

const baseURL =
  typeof process.env.NEXT_PUBLIC_API_URL === "string"
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : "";

export const api = axios.create({
  baseURL: baseURL || undefined,
  timeout: 120_000,
});

api.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === "development") {
    const url = config.url ?? "";
    const base = config.baseURL ?? "";
    console.log("[api]", `${base}${url}`);
  }
  return config;
});

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      if (
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
      ) {
        return (data as { error: string }).error;
      }
      if (
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
      ) {
        return (data as { message: string }).message;
      }
    }
  }
  return "Something went wrong";
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getErrorMessage(error);
    useUploadStore.getState().setError(message);
    return Promise.reject(error);
  }
);

export default api;
