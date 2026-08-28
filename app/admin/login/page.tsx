import { signIn } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold text-white">Admin Login</h1>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <form action={signIn} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="Email" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white" />
        <input name="password" type="password" required placeholder="Password" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white" />
        <button type="submit" className="rounded bg-amber-500 px-3 py-2 font-semibold text-black">
          Log in
        </button>
      </form>
    </main>
  )
}
