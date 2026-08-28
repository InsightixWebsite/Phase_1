// Cloudinary's console UI does not expose a "max file size" field for signed
// upload presets (it's an Admin-API-only parameter), so size limits are
// enforced client-side in <ImageUpload> using this pure, unit-testable check.
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB
export const MAX_PDF_BYTES = 20 * 1024 * 1024 // 20MB

export function isFileTooLarge(file: { size: number }, accept: 'image' | 'pdf'): boolean {
  const max = accept === 'pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES
  return file.size > max
}

export function buildCloudinaryUrl(url: string, opts?: { width?: number }): string {
  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || idx === -1) return url

  const transforms = ['f_auto', 'q_auto']
  if (opts?.width) transforms.push(`w_${opts.width}`)

  const before = url.slice(0, idx + marker.length)
  const after = url.slice(idx + marker.length)
  return `${before}${transforms.join(',')}/${after}`
}
