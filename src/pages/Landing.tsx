import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  Cpu,
  WifiOff,
  Upload,
  Lock,
  FileDown,
  Layers,
  ArrowRight,
  Fingerprint,
} from 'lucide-react'

const features = [
  {
    icon: Cpu,
    title: '100% Local Processing',
    desc: 'Everything runs in your browser. No server-side computation.',
  },
  {
    icon: Upload,
    title: 'No Upload Required',
    desc: 'Your files are never sent anywhere. They stay on your device.',
  },
  {
    icon: WifiOff,
    title: 'Works Offline',
    desc: 'Once loaded, the app works without an internet connection.',
  },
  {
    icon: Fingerprint,
    title: 'Aadhaar / Bank PDF Ready',
    desc: 'Optimized for password-protected government and financial PDFs.',
  },
]

const tools = [
  {
    icon: Lock,
    title: 'Unlock PDF',
    desc: 'Remove passwords from encrypted PDFs',
    to: '/unlock',
    active: true,
  },
  {
    icon: FileDown,
    title: 'Compress PDF',
    desc: 'Reduce file size without quality loss',
    to: '#',
    active: false,
  },
  {
    icon: Layers,
    title: 'Merge PDF',
    desc: 'Combine multiple PDFs into one',
    to: '#',
    active: false,
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
}

export default function Landing() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* Hero */}
      <section className="pb-16 pt-16 sm:pb-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span className="text-[12px] font-medium text-text-secondary">
              Zero data collection
            </span>
          </div>

          <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl">
            Unlock Your PDFs.
            <br />
            <span className="text-text-tertiary">Keep Your Privacy.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-text-secondary">
            Remove passwords from encrypted PDF files entirely inside your browser.
            No uploads. No servers. No tracking. Your files never leave your device.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/unlock"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-[13px] font-semibold text-white no-underline shadow-sm transition-all hover:bg-accent-hover hover:shadow-md active:scale-[0.98]"
            >
              Unlock a PDF
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex h-10 items-center rounded-lg border border-border px-5 text-[13px] font-medium text-text-secondary no-underline transition-colors hover:bg-neutral-50 hover:text-text-primary"
            >
              Learn more
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
            Privacy by design
          </h2>
          <p className="mt-1 text-[13px] text-text-tertiary">
            Built from the ground up to protect your data
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              className="group rounded-xl border border-border bg-surface-elevated p-5 transition-all hover:border-neutral-300 hover:shadow-sm"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-accent/10">
                <f.icon className="h-4 w-4 text-text-secondary transition-colors group-hover:text-accent" />
              </div>
              <h3 className="text-[14px] font-semibold text-text-primary">
                {f.title}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
            PDF Tools
          </h2>
          <p className="mt-1 text-[13px] text-text-tertiary">
            All processing happens locally in your browser
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
            >
              {tool.active ? (
                <Link
                  to={tool.to}
                  className="group flex flex-col items-center rounded-xl border border-border bg-surface-elevated p-6 text-center no-underline transition-all hover:border-accent/30 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <tool.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-text-primary">
                    {tool.title}
                  </h3>
                  <p className="mt-1 text-[12px] text-text-secondary">
                    {tool.desc}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    Open tool <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ) : (
                <div className="relative flex flex-col items-center rounded-xl border border-border-subtle bg-surface-elevated/60 p-6 text-center opacity-60">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
                    <tool.icon className="h-5 w-5 text-text-tertiary" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-text-primary">
                    {tool.title}
                  </h3>
                  <p className="mt-1 text-[12px] text-text-secondary">
                    {tool.desc}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
                    Coming soon
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
