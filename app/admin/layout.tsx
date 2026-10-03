import Link from 'next/link'
import { signOut } from './actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
        <div className="flex gap-4 text-sm">
          <Link href="/admin/site-settings">Site Settings</Link>
          <Link href="/admin/home">Home</Link>
          <Link href="/admin/about">About</Link>
          <Link href="/admin/team">Team</Link>
          <Link href="/admin/events">Events</Link>
          <Link href="/admin/sponsors">Sponsors</Link>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-neutral-400">Log out</button>
        </form>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
