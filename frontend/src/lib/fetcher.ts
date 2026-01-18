export async function fetcher<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiUrl) {
    throw new Error('API_URLが設定されていません');
  }
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  // レスポンスボディが空の場合はundefinedを返す
  const text = await res.text();
  if (!text || text.trim() === '') {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
