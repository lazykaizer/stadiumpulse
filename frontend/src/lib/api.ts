/**
 * API client for StadiumPulse backend.
 * All responses are typed — no `any` flows through.
 */

import type { ZoneData, ZoneDetail, AlertFeed, AlertFilter, ReasoningOutput, UploadResult } from "../types";

const API_BASE = import.meta.env.PROD ? (import.meta.env.VITE_API_URL || "") : (import.meta.env.VITE_API_URL || "http://localhost:8000");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert camelCase keys to snake_case for the Python backend. */
export function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

/** Convert snake_case keys to camelCase for the frontend. */
function toCamelCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T;
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
      result[camelKey] = toCamelCase(value);
    }
    return result as T;
  }
  return obj as T;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  const data: unknown = await response.json();
  return toCamelCase<T>(data);
}

// ---------------------------------------------------------------------------
// Zone Endpoints
// ---------------------------------------------------------------------------

/**
 * Fetch the current state of all stadium zones.
 * @returns A promise resolving to an array of ZoneData objects.
 */
export async function fetchZones(): Promise<ZoneData[]> {
  return apiFetch<ZoneData[]>("/api/zones");
}

/**
 * Fetch detailed information for a specific zone, including historical trends.
 * @param zoneId - The unique identifier of the zone.
 * @returns A promise resolving to the zone's details and history.
 */
export async function fetchZoneDetail(zoneId: string): Promise<ZoneDetail> {
  return apiFetch<ZoneDetail>(`/api/zones/${zoneId}`);
}

// ---------------------------------------------------------------------------
// Alert Endpoints
// ---------------------------------------------------------------------------

/**
 * Fetch a paginated, filtered list of alerts.
 * @param filters - Optional filters for severity, zone, and time range.
 * @returns A promise resolving to the alert feed.
 */
export async function fetchAlerts(filters: Partial<AlertFilter> = {}): Promise<AlertFeed> {
  const params = new URLSearchParams();
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.zoneId) params.set("zone_id", filters.zoneId);
  if (filters.startTime) params.set("start_time", filters.startTime);
  if (filters.endTime) params.set("end_time", filters.endTime);
  params.set("page", String(filters.page || 1));
  params.set("page_size", String(filters.pageSize || 20));

  return apiFetch<AlertFeed>(`/api/alerts?${params.toString()}`);
}

// ---------------------------------------------------------------------------
// Reasoning Endpoints
// ---------------------------------------------------------------------------

/**
 * Trigger the Gemini reasoning engine to generate an assessment.
 * @param zoneId - Optional zone ID. If omitted, reasons across all zones and returns the most critical.
 * @returns A promise resolving to the AI reasoning output.
 */
export async function triggerReasoning(zoneId?: string): Promise<ReasoningOutput> {
  const path = zoneId ? `/api/reason/${zoneId}` : "/api/reason";
  return apiFetch<ReasoningOutput>(path, { method: "POST" });
}

// ---------------------------------------------------------------------------
// Upload Endpoints
// ---------------------------------------------------------------------------

/**
 * Upload a dataset file (e.g., historical incidents or zone config).
 * @param file - The file object to upload.
 * @returns A promise resolving to the upload result summary.
 */
export async function uploadData(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/data/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload error ${response.status}: ${error}`);
  }

  const data: unknown = await response.json();
  return toCamelCase<UploadResult>(data);
}

/**
 * Reset all data to the default synthesized initial state.
 * @returns A promise resolving to the reset operation result.
 */
export async function resetData(): Promise<UploadResult> {
  return apiFetch<UploadResult>("/api/data/reset", { method: "POST" });
}

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

/**
 * Check the health status of the backend API.
 * @returns A promise resolving to the health check status.
 */
export async function healthCheck(): Promise<{ status: string; service: string }> {
  return apiFetch<{ status: string; service: string }>("/api/health");
}
