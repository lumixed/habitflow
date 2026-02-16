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

// ─── Error Class ──────────────────────────────────────────────────────

export class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}

// ─── Core Request Handler ─────────────────────────────────────────────

async function request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    token?: string
): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // sends cookies (needed for NextAuth sessions)
    };

    // If a token is provided, add it to the Authorization header
    if (token) {
        (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    console.log(`[API] ${method} ${url}`);
    const res = await fetch(url, options);

    // If the response isn't JSON (e.g. 500 from a crash), handle gracefully
    let data: any;
    try {
        data = await res.json();
        console.log(`[API] Success ${url}`, data);
    } catch (err) {
        console.error(`[API] Error parsing JSON ${url}`, err);
        throw new ApiError('Invalid response from server', res.status);
    }

    // If the backend returned an error, throw it
    if (!res.ok) {
        throw new ApiError(
            data?.error || 'An unexpected error occurred',
            res.status
        );
    }

    return data as T;
}

// ─── Convenience Methods ──────────────────────────────────────────────

const api = {
    get: <T>(endpoint: string, token?: string): Promise<T> => request<T>('GET', endpoint, undefined, token),

    post: <T>(endpoint: string, body?: unknown, token?: string): Promise<T> =>
        request<T>('POST', endpoint, body, token),

    put: <T>(endpoint: string, body?: unknown, token?: string): Promise<T> =>
        request<T>('PUT', endpoint, body, token),

    delete: <T>(endpoint: string, body?: unknown, token?: string): Promise<T> =>
        request<T>('DELETE', endpoint, body, token),
};

export default api;