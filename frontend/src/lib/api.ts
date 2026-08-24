import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// Baked in at build time from frontend/.env.production (production points at
// the live PythonAnywhere API). The localhost default is ONLY for desktop
// development against `python manage.py runserver`.
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Resolve the API base URL at runtime.
 *
 * A build made without NEXT_PUBLIC_API_URL would otherwise bake in
 * "http://localhost:8000/api/v1" — which works on the developer's desktop but
 * is unreachable from a phone (localhost on a phone is the phone itself) and
 * shows up as a generic "Network Error". When the page is served from a real
 * (non-local) host, repoint a localhost API URL at the same machine that is
 * serving the page, so phones testing a desktop dev server over LAN work too.
 */
function resolveApiUrl(): string {
  if (typeof window === "undefined") return RAW_API_URL;
  const pageHost = window.location.hostname;
  if (pageHost === "localhost" || pageHost === "127.0.0.1" || pageHost === "::1") {
    return RAW_API_URL;
  }
  return RAW_API_URL.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?/i, (_m, scheme, _host, port) => {
    return `${scheme}${pageHost}${port ?? ""}`;
  });
}

const API_URL = resolveApiUrl();

// Increased timeout for FREE plan - gives more time for slower workers
export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

export const TOKEN_KEYS = {
  access: "libseat_access",
  refresh: "libseat_refresh",
  user: "libseat_user",
};

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEYS.access);
}

export function setTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEYS.access, access);
  window.localStorage.setItem(TOKEN_KEYS.refresh, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEYS.access);
  window.localStorage.removeItem(TOKEN_KEYS.refresh);
  window.localStorage.removeItem(TOKEN_KEYS.user);
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return false;
  return Date.now() >= payload.exp * 1000;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && !isTokenExpired(token)) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

let onUnauthorizedHandler: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorizedHandler = handler;
}

const MAX_TRANSIENT_RETRIES = 2;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refresh = window.localStorage.getItem(TOKEN_KEYS.refresh);
      if (refresh) {
        refreshing =
          refreshing ??
          axios
            .post(`${API_URL}/auth/refresh/`, { refresh })
            .then((r) => r.data.access as string)
            .catch(() => null)
            .finally(() => (refreshing = null));
        const newAccess = await refreshing;
        if (newAccess) {
          window.localStorage.setItem(TOKEN_KEYS.access, newAccess);
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        }
      }
      // Session is dead: drop tokens and sign the user out everywhere.
      clearTokens();
      onUnauthorizedHandler?.();
    }

    // Transient-failure resilience: when the backend is momentarily busy it
    // answers 502/503/504 (proxy/gateway), 429 (throttle), or drops the
    // connection entirely. Retry only idempotent GETs with exponential
    // backoff so a load spike resolves itself instead of surfacing as
    // "server busy" errors. Mutating requests (POST/PATCH/DELETE) are never
    // auto-retried, so a hold/payment is never submitted twice.
    const method = (original?.method ?? "get").toLowerCase();
    const status = error.response?.status;
    const transient =
      status === 429 || (status != null && status >= 502 && status <= 504) || !error.response;
    if (original && method === "get" && transient && (original._retryCount ?? 0) < MAX_TRANSIENT_RETRIES) {
      original._retryCount = (original._retryCount ?? 0) + 1;
      const delay = 300 * 2 ** (original._retryCount - 1);
      await new Promise((r) => setTimeout(r, delay));
      return api(original);
    }

    if (!error.response) {
      // No response at all: connectivity, timeout, CORS block or mixed content.
      // Log the URL + method so mobile issues are diagnosable from the console.
      console.warn(
        `[api] Request to ${error.config?.baseURL ?? ""}${error.config?.url ?? ""} failed without a response`,
        error.code
      );
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (!axios.isAxiosError(err)) return fallback;

  const data = err.response?.data as
    | { detail?: string; message?: string; fields?: Record<string, unknown> }
    | undefined;
  const status = err.response?.status;

  // Rate limiting gets a human, reassuring message before anything else —
  // DRF's raw "Expected available in 3021 seconds" is developer-speak.
  if (status === 429) {
    const match = /expected available in (\d+) second/i.exec(String(data?.detail ?? ""));
    if (match) {
      const secs = parseInt(match[1], 10);
      const wait =
        secs >= 5400
          ? `about ${Math.round(secs / 3600)} hours`
          : secs >= 90
            ? `about ${Math.max(1, Math.round(secs / 60))} minutes`
            : `${secs} seconds`;
      return `You've been quite active — please try again in ${wait}.`;
    }
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (data?.fields) {
    const first = Object.values(data.fields)[0];
    const msg = Array.isArray(first) ? first[0] : String(first ?? "");
    if (msg) return msg;
  }
  if (data?.detail) return String(data.detail);
  if (data?.message) return String(data.message);

  if (status) {
    if (status === 401 || status === 403) return "Your session has expired. Please sign in again.";
    if (status === 502) return "The payment gateway is unavailable right now. Please try again in a moment.";
    if (status >= 500) return "The server is temporarily unavailable. Please try again in a moment.";
    return err.message || fallback;
  }

  // No HTTP response reached: true network failure, a timeout, a CORS-blocked
  // request, or mixed content. All of these are reported by axios as a
  // "Network Error" with no response body — turn that into a useful message.
  if (err.code === "ECONNABORTED" || /timeout/i.test(err.message)) {
    return "The server is taking too long to respond. Please check your connection and try again.";
  }
  const code = err.code ? ` (${err.code})` : "";
  return `Unable to connect to the server${code}. Please check your internet connection and try again.`;
}

export function apiErrorFields(err: unknown): Record<string, string[]> | null {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { fields?: Record<string, string[]> } | undefined;
    return data?.fields ?? null;
  }
  return null;
}

/** True when the request failed before any HTTP response arrived (connectivity,
 *  timeout, CORS block, or a connection dropped while a cold server boots). */
export function isNoResponseError(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response;
}

export function apiErrorCode(err: unknown): string | null {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { code?: string } | undefined;
    return data?.code ?? null;
  }
  return null;
}
