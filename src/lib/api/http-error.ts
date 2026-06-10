/**
 * Shared error handling for API responses.
 *
 * Works with any response-like object exposing `ok` and `text()` — both the
 * native `fetch` `Response` and the lightweight object returned by `apiFetch`.
 */

interface ResponseLike {
  ok: boolean
  text: () => Promise<string>
}

/**
 * Reads the response body as text and throws an Error with it as the message.
 * Falls back to "Error desconocido" when the body cannot be read.
 *
 * Mirrors the previously inlined block:
 *   const text = await res.text().catch(() => "Error desconocido")
 *   throw new Error(text)
 */
export async function throwResponseError(res: ResponseLike): Promise<never> {
  const text = await res.text().catch(() => 'Error desconocido')
  throw new Error(text)
}
