import { SponsorForm } from '../SponsorForm'
import { createSponsor } from '../actions'

export default function NewSponsorPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Add Sponsor</h1>
      <SponsorForm action={createSponsor} />
    </div>
  )
}
