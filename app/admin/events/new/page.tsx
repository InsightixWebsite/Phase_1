import { EventForm } from '../EventForm'
import { createEvent } from '../actions'

export default function NewEventPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Add Event</h1>
      <EventForm action={createEvent} />
    </div>
  )
}
