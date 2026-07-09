import { env } from './env';

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: string | string[] }).message)
        : res.statusText;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }

  return data as T;
}
