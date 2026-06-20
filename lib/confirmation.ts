/**
 * Confirmation token utilities
 * These are pure utility functions for encoding/decoding RSVP IDs
 */

/**
 * Generate a confirmation token from an RSVP ID
 * Uses base64 encoding to obfuscate the ID
 */
export function generateConfirmationToken(id: string): string {
  return Buffer.from(id).toString('base64url')
}

/**
 * Decode a confirmation token to get the RSVP ID
 */
export function decodeConfirmationToken(token: string): string | null {
  try {
    return Buffer.from(token, 'base64url').toString('utf-8')
  } catch {
    return null
  }
}

