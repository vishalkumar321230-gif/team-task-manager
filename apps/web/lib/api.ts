import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  const shouldEncode =
    config.data &&
    ["POST", "PUT", "PATCH"].includes(method ?? "") &&
    !(config.data instanceof FormData) &&
    !(config.data instanceof URLSearchParams);

  if (shouldEncode) {
    const params = new URLSearchParams();

    Object.entries(config.data as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    config.data = params;
    config.headers.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
  }

  return config;
});

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
