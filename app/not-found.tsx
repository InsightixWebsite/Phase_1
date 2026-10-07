import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <span className="font-display text-7xl font-bold text-brand-accent sm:text-8xl">404</span>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">This page doesn&apos;t exist</h1>
        <p className="mt-3 max-w-md text-brand-muted">
          The page you&apos;re looking for may have been moved or never existed. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <PrimaryButton href="/">Back to Home</PrimaryButton>
          <SecondaryButton href="/events">Explore Events</SecondaryButton>
        </div>
      </main>
      <Footer />
    </>
  )
}
