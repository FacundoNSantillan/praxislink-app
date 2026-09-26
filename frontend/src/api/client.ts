import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("praxislink_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function fileUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return `${API_ORIGIN}${path}`;
}

export function apiErrorMessage(err: unknown, fallback = "Ocurrió un error inesperado."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data!.message.join(" ");
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
}
