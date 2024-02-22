import crypto from 'node:crypto'

export function generateRandomString(size = 16) {
  return crypto.randomBytes(size).toString('hex')
}

export function buildURL(baseURL, params) {
  const url = new URL(baseURL)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value)
  }
  return url
}
