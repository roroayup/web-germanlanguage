import { PageShell } from '../components/layout/PageShell'
import { Button } from '../components/ui/Button'

export default function NotFound() {
  return (
    <PageShell>
      <div className="py-16 text-center">
        <p className="font-display text-7xl font-bold text-accent">404</p>
        <h1 lang="de" className="mt-4 font-display text-3xl font-bold">
          Seite nicht gefunden
        </h1>
        <p className="mt-2 text-muted">Halaman yang kamu cari tidak ada.</p>
        <Button to="/" className="mt-8">
          Kembali ke beranda
        </Button>
      </div>
    </PageShell>
  )
}
