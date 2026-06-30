import { API_BASE_URL } from './config';

async function request<T>(
  path: string,
  options: { method?: string; token?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

export const registerNumber = (number: string) =>
  request<{ message: string }>('/auth/register', { method: 'POST', body: { number } });

export const verifyCode = (number: string, code: string) =>
  request<{ message: string; token: string; refreshToken: string }>('/auth/verify', {
    method: 'POST',
    body: { number, code },
  });

export const completeProfile = (token: string, firstName: string, lastName: string) =>
  request<{ message: string }>('/auth/complete-profile', {
    method: 'POST',
    token,
    body: { firstName, lastName },
  });
