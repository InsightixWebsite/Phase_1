import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/lib/queries/events'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { formatEventDate } from '@/lib/formatEventDate'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { Pill } from '@/components/ui/Pill'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event || !event.is_active) return {}
  return { title: event.title, description: event.description ?? undefined }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event || !event.is_active) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {event.cover_photo_url && (
        <img
          src={buildCloudinaryUrl(event.cover_photo_url, { width: 1200 })}
          alt={event.title}
          className="w-full rounded-xl border border-brand-border"
        />
      )}
      <Pill className="mt-6" active={event.type === 'upcoming'}>
        {event.type === 'upcoming' ? 'Upcoming' : 'Past'}
      </Pill>
      <h1 className="mt-4 font-display text-4xl font-bold">{event.title}</h1>
      <p className="mt-1 text-brand-muted">{formatEventDate(event.event_date)}</p>
      {event.description && <p className="mt-6 text-brand-muted">{event.description}</p>}
      {event.registration_url && (
        <PrimaryButton href={event.registration_url} className="mt-6">
          Register
        </PrimaryButton>
      )}
      {event.gallery_urls.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {event.gallery_urls.map((url) => (
            <img
              key={url}
              src={buildCloudinaryUrl(url, { width: 400 })}
              alt=""
              className="rounded-lg border border-brand-border object-cover"
            />
          ))}
        </div>
      )}
      {event.video_embed_urls.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          {event.video_embed_urls.map((url) => (
            <iframe key={url} src={url} className="aspect-video w-full rounded-lg" allowFullScreen />
          ))}
        </div>
      )}
    </main>
  )
}
