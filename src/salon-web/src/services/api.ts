const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5111'

export async function apiRequest<T>(
  putanja: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(
    `${API_BASE_URL}${putanja}`,
    {
      ...options,
      headers,
    },
  )

  if (!response.ok) {
    let poruka = 'Došlo je do greške prilikom komunikacije sa serverom.'

    const text = await response.text()

    if (text) {
      poruka = text
    }

    throw new Error(poruka)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}