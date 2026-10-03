import { getSponsorById } from '@/lib/queries/sponsors'
import { SponsorForm } from '../SponsorForm'
import { updateSponsor } from '../actions'

export default async function EditSponsorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sponsor = await getSponsorById(id)
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Edit Sponsor</h1>
      <SponsorForm initial={sponsor} action={updateSponsor.bind(null, id)} />
    </div>
  )
}
