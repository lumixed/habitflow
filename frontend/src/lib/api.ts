// ─── API Client ───────────────────────────────────────────────────────
// All frontend API calls go through this module.
// It handles the base URL, JSON headers, and consistent error responses.
//
// Usage:
//   import api from '@/lib/api';
//
//   const data = await api.get('/habits');
//   const habit = await api.post('/habits', { title: 'Exercise' });
//   await api.put(`/habits/${id}`, { title: 'New title' });
//   await api.delete(`/habits/${id}`);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}


async function request<T>(
  method: string,
  endpoint: string,
  body?: unknown
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new ApiError('Invalid response from server', res.status);
  }

  if (!res.ok) {
    throw new ApiError(
      data?.error || 'An unexpected error occurred',
      res.status
    );
  }

  return data as T;
}


const api = {
  get: <T>(endpoint: string): Promise<T> => request<T>('GET', endpoint),

  post: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>('POST', endpoint, body),

  put: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>('PUT', endpoint, body),

  delete: <T>(endpoint: string): Promise<T> =>
    request<T>('DELETE', endpoint),
};

export default api;
