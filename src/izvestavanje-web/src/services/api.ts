const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5144'

export async function apiRequest<T>(
  putanja: string,
): Promise<T> {
  const odgovor = await fetch(
    `${API_BASE_URL}${putanja}`,
  )

  if (!odgovor.ok) {
    throw new Error(
      `Greška prilikom poziva A.2 API-ja (${odgovor.status}).`,
    )
  }

  return odgovor.json() as Promise<T>
}
