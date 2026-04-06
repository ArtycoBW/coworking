import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      try {
        const token = JSON.parse(raw)?.state?.token as string | undefined;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {}
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: { response?: { status?: number; data?: { message?: string } }; message?: string; config?: { _toastShown?: boolean } }) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error("Доступ запрещён");
      return Promise.reject(error);
    }

    if (status === 404) {
      return Promise.reject(error);
    }

    if (status === 429) {
      toast.error("Слишком много запросов", { description: "Подожди немного и попробуй снова" });
      return Promise.reject(error);
    }

    if (status && status >= 500) {
      toast.error("Ошибка сервера", { description: message ?? "Попробуй обновить страницу" });
      return Promise.reject(error);
    }

    if (!status) {
      toast.error("Нет соединения с сервером", { description: "Проверь подключение к интернету" });
    }

    return Promise.reject(error);
  },
);
