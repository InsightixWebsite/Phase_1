import Link from 'next/link'
import { getAllSponsors } from '@/lib/queries/sponsors'
import { archiveSponsor } from './actions'

export default async function SponsorsListPage() {
  const sponsors = await getAllSponsors()
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Sponsors</h1>
        <Link href="/admin/sponsors/new" className="rounded bg-amber-500 px-3 py-2 font-semibold text-black">Add sponsor</Link>
      </div>
      <ul className="flex flex-col gap-2">
        {sponsors.map((s) => (
          <li key={s.id} className="flex items-center justify-between border-b border-neutral-800 py-2">
            <span className={s.is_active ? '' : 'text-neutral-500 line-through'}>{s.name}</span>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/sponsors/${s.id}`} className="text-brand-accent">Edit</Link>
              {s.is_active && (
                <form action={archiveSponsor.bind(null, s.id)}>
                  <button type="submit" className="text-neutral-400">Archive</button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
