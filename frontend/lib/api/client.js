import { getAccessToken } from '../supabase/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const COLD_START_TIMEOUT = 60000;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export class ColdStartError extends Error {
  constructor() {
    super('El servidor está iniciando. Por favor espera un momento...');
    this.name = 'ColdStartError';
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = await getAccessToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COLD_START_TIMEOUT);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Error desconocido');
      let errorMessage = errorText;

      try {
        const errorBody = JSON.parse(errorText);
        errorMessage = errorBody.message || errorBody.Message || errorText;
      } catch {
        // La respuesta no siempre es JSON.
      }

      if (res.status === 401) {
        errorMessage = 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.';
      } else if (res.status === 403) {
        errorMessage = 'No tienes permiso para realizar esta acción.';
      }

      throw new ApiError(res.status, errorMessage);
    }

    if (res.status === 204) return null;
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ColdStartError();
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  get: (endpoint) => apiFetch(endpoint),
  
  post: (endpoint, data) => apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint, data) => apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint) => apiFetch(endpoint, {
    method: 'DELETE',
  }),
};
