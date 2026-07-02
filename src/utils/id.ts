/** Generate a real UUID (v4). Backend log ids are UUIDs, and the frontend
 *  keeps the entry id as the source of truth for edit/delete. */
export const newId = (): string => {
  const c = globalThis.crypto as Crypto | undefined
  if (c?.randomUUID) return c.randomUUID()
  // Fallback for very old environments (should not happen in modern browsers)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0
    const v = ch === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
