export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB

export const SUPPORTED_MIME_TYPES = [
  'audio/wav',
  'audio/x-wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/flac',
  'audio/mp4',
  'audio/aac',
  'audio/x-m4a'
]

export const SUPPORTED_EXTENSIONS = [
  '.wav', '.mp3', '.ogg', '.flac', '.m4a', '.aac'
]

export function validateSampleFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File is too large (max 50MB)` }
  }

  // Check mime type first, fallback to extension
  if (file.type && !SUPPORTED_MIME_TYPES.includes(file.type)) {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: `Unsupported file format` }
    }
  }

  return { valid: true }
}
