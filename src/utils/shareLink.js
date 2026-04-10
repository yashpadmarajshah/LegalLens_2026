import LZString from 'lz-string'

export function encodeToHash(docName, result) {
  const payload = JSON.stringify({ docName, result })
  const compressed = LZString.compressToEncodedURIComponent(payload)
  return compressed
}

export function decodeFromHash(hash) {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash)
    if (!decompressed) return null
    return JSON.parse(decompressed)
  } catch {
    return null
  }
}

export function buildShareURL(docName, result) {
  const hash = encodeToHash(docName, result)
  const base = window.location.origin + window.location.pathname
  return `${base}#shared=${hash}`
}

export function parseShareFromURL() {
  const hash = window.location.hash
  if (!hash.startsWith('#shared=')) return null
  const encoded = hash.replace('#shared=', '')
  return decodeFromHash(encoded)
}
