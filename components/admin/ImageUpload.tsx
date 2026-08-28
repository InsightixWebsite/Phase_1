'use client'

import { useState } from 'react'
import { buildCloudinaryUrl, isFileTooLarge, MAX_IMAGE_BYTES, MAX_PDF_BYTES } from '@/lib/cloudinary'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string) => void
  folder: string
  accept?: 'image' | 'pdf'
}

export function ImageUpload({ value, onChange, folder, accept = 'image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)

    // Cloudinary's console UI has no "max file size" field for signed upload
    // presets (Admin-API-only parameter), so enforce the size limit here as a
    // client-side substitute for the preset-level restriction.
    if (isFileTooLarge(file, accept)) {
      const maxMb = accept === 'pdf' ? MAX_PDF_BYTES / (1024 * 1024) : MAX_IMAGE_BYTES / (1024 * 1024)
      setError(`File is too large. Maximum size is ${maxMb}MB.`)
      return
    }

    setUploading(true)
    try {
      const signRes = await fetch('/api/cloudinary-sign', {
        method: 'POST',
        body: JSON.stringify({ folder }),
      })
      const { signature, timestamp, apiKey, cloudName } = await signRes.json()

      const body = new FormData()
      body.append('file', file)
      body.append('api_key', apiKey)
      body.append('timestamp', String(timestamp))
      body.append('signature', signature)
      body.append('folder', folder)
      body.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

      const resourceType = accept === 'pdf' ? 'raw' : 'image'
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: 'POST', body }
      )
      const data = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(data.error?.message ?? 'Upload failed')
      onChange(data.secure_url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value && accept === 'image' && (
        <img src={buildCloudinaryUrl(value, { width: 200 })} alt="" className="h-24 w-24 rounded object-cover" />
      )}
      <input
        type="file"
        accept={accept === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp'}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p className="text-sm text-neutral-400">Uploading…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
