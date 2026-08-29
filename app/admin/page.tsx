import Link from 'next/link'

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-neutral-400">
        Choose a section from the nav above, or start with <Link href="/admin/site-settings" className="text-brand-accent">Site Settings</Link>.
      </p>
    </div>
  )
}
