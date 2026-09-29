import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function HomeOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0a0a0a',
          color: '#f5f5f5',
          fontSize: 80,
          fontWeight: 700,
        }}
      >
        <div style={{ display: 'flex' }}>
          Insight<span style={{ color: '#FF7A00' }}>ix</span>
        </div>
        <div style={{ display: 'flex', fontSize: 32, marginTop: 16, color: '#a3a3a3' }}>Tech Club</div>
      </div>
    ),
    size
  )
}
