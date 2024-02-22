import crypto from 'node:crypto'

export function generateRandomString(size = 16) {
  return crypto.randomBytes(size).toString('hex')
}
