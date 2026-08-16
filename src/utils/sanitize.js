import DOMPurify from 'dompurify'

export function sanitize(value) {
  if (typeof value !== 'string') return value
  return DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

export function sanitizeFormData(data) {
  if (!data || typeof data !== 'object') return data
  const clean = {}
  for (const key in data) {
    const val = data[key]
    if (typeof val === 'string') {
      clean[key] = sanitize(val)
    } else if (Array.isArray(val)) {
      clean[key] = val.map(v => typeof v === 'string' ? sanitize(v) : v)
    } else {
      clean[key] = val
    }
  }
  return clean
}