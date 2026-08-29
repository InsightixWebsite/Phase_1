import { getEventById } from '@/lib/queries/events'
import { EventForm } from '../EventForm'
import { updateEvent } from '../actions'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEventById(id)
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Edit Event</h1>
      <EventForm initial={event} action={updateEvent.bind(null, id)} />
    </div>
  )
}
