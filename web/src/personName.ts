export const PLAYER_NAME_MAX_LENGTH = 22
export const PROFILE_NAME_MAX_LENGTH = 28
export const PERSON_NAME_PATTERN = '[\\p{L}\\p{Nd}]*'
export const PERSON_NAME_HINT = 'Solo letras y números, sin espacios ni símbolos.'

// This is an input policy, not HTML escaping. Render names as React text or
// canvas text; never interpolate them into HTML, scripts, URLs, or CSS.
export function sanitizePersonName(value: unknown, maxLength = PLAYER_NAME_MAX_LENGTH): string {
  if (typeof value !== 'string') return ''
  const lettersAndDigits = value.normalize('NFC').replace(/[^\p{L}\p{Nd}]/gu, '')
  return Array.from(lettersAndDigits).slice(0, maxLength).join('')
}
