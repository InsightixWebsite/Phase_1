import { ImageResponse } from 'next/og'
import { getEventBySlug } from '@/lib/queries/events'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function EventOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

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
          fontSize: 64,
          fontWeight: 700,
        }}
      >
        <div style={{ color: '#f5820c' }}>Insightix</div>
        <div style={{ fontSize: 40, marginTop: 20, textAlign: 'center', padding: '0 60px' }}>
          {event?.title ?? 'Event'}
        </div>
      </div>
    ),
    size
  )
}
