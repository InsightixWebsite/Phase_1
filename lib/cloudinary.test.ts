import { describe, it, expect } from 'vitest'
import { buildCloudinaryUrl, isFileTooLarge, MAX_IMAGE_BYTES, MAX_PDF_BYTES } from './cloudinary'

describe('buildCloudinaryUrl', () => {
  it('inserts f_auto,q_auto into a Cloudinary delivery URL', () => {
    const input = 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
    expect(buildCloudinaryUrl(input)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/sample.jpg'
    )
  })

  it('adds a width transform when provided', () => {
    const input = 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
    expect(buildCloudinaryUrl(input, { width: 400 })).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400/v1/sample.jpg'
    )
  })

  it('returns non-Cloudinary URLs unchanged', () => {
    expect(buildCloudinaryUrl('https://example.com/x.jpg')).toBe('https://example.com/x.jpg')
  })
})

describe('isFileTooLarge', () => {
  it('rejects an image file over 10MB', () => {
    expect(isFileTooLarge({ size: MAX_IMAGE_BYTES + 1 }, 'image')).toBe(true)
  })

  it('accepts an image file at or under 10MB', () => {
    expect(isFileTooLarge({ size: MAX_IMAGE_BYTES }, 'image')).toBe(false)
    expect(isFileTooLarge({ size: 1024 }, 'image')).toBe(false)
  })

  it('rejects a PDF file over 20MB', () => {
    expect(isFileTooLarge({ size: MAX_PDF_BYTES + 1 }, 'pdf')).toBe(true)
  })

  it('accepts a PDF file at or under 20MB', () => {
    expect(isFileTooLarge({ size: MAX_PDF_BYTES }, 'pdf')).toBe(false)
  })

  it('defaults to the image threshold when accept is omitted-equivalent (image)', () => {
    expect(isFileTooLarge({ size: MAX_IMAGE_BYTES + 1 }, 'image')).toBe(true)
    expect(isFileTooLarge({ size: MAX_IMAGE_BYTES + 1 }, 'pdf')).toBe(false)
  })
})
