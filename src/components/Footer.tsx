import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-elevated">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900">
            <Shield className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-medium text-text-secondary">
            Built for Privacy
          </span>
        </div>

        <p className="text-center text-[12px] leading-relaxed text-text-tertiary sm:text-right">
          Your files never leave your device. Zero tracking. Zero analytics.
          <br className="hidden sm:block" />
          ZeroPDF is open-source and runs entirely in your browser.
        </p>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-text-tertiary">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Open Source
          </span>
          <span className="text-[11px] text-text-tertiary">
            © {new Date().getFullYear()} ZeroPDF
          </span>
        </div>
      </div>
    </footer>
  )
}
