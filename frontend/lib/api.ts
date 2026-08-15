import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const TOKEN_KEY = "eventora_token";

const getToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable — cookie fallback still applies.
  }
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await api.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new ApiError(
        axiosError.response?.data?.message ?? "Something went wrong. Please try again.",
        axiosError.response?.status ?? 0,
      );
    }
    throw error;
  }
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}