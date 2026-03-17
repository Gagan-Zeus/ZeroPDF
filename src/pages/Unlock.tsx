import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Lock,
  Unlock as UnlockIcon,
  Eye,
  EyeOff,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Info,
} from 'lucide-react'
import { unlockPdf, formatFileSize } from '../lib/pdf-unlock'

type Stage = 'idle' | 'file-selected' | 'processing' | 'success' | 'error'

export default function Unlock() {
  const [stage, setStage] = useState<Stage>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Revoke blob URL on cleanup
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [blobUrl])

  const handleFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a PDF file.')
      setStage('error')
      return
    }
    setFile(f)
    setStage('file-selected')
    setPassword('')
    setErrorMessage('')
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
      setBlobUrl(null)
    }
    // Focus password field after a tick
    setTimeout(() => passwordRef.current?.focus(), 100)
  }, [blobUrl])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const f = e.dataTransfer.files[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  const handleUnlock = useCallback(async () => {
    if (!file || !password) return

    setStage('processing')
    setProgress(0)
    setErrorMessage('')

    // Animate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval)
          return 85
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      const buffer = await file.arrayBuffer()
      const result = await unlockPdf(buffer, password)

      clearInterval(interval)

      if (result.success && result.data) {
        setProgress(100)
        setPageCount(result.pageCount ?? 0)

        // Create download blob
        const blob = new Blob([new Uint8Array(result.data)], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        if (blobUrl) URL.revokeObjectURL(blobUrl)
        setBlobUrl(url)

        setTimeout(() => setStage('success'), 400)
      } else {
        setErrorMessage(result.error ?? 'Failed to unlock PDF.')
        setStage('error')
      }
    } catch {
      clearInterval(interval)
      setErrorMessage('An unexpected error occurred while processing the PDF.')
      setStage('error')
    }
  }, [file, password, blobUrl])

  const handleDownload = useCallback(() => {
    if (!blobUrl || !file) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = file.name.replace(/\.pdf$/i, '') + '_unlocked.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [blobUrl, file])

  const reset = useCallback(() => {
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    setBlobUrl(null)
    setFile(null)
    setPassword('')
    setStage('idle')
    setErrorMessage('')
    setProgress(0)
  }, [blobUrl])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password && file && stage === 'file-selected') {
      handleUnlock()
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
      {/* Header */}
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10"
        >
          <AnimatePresence mode="wait">
            {stage === 'success' ? (
              <motion.div
                key="unlocked"
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: -90 }}
                transition={{ duration: 0.3 }}
              >
                <UnlockIcon className="h-6 w-6 text-success" />
              </motion.div>
            ) : (
              <motion.div
                key="locked"
                initial={{ rotateY: -90 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: 90 }}
                transition={{ duration: 0.3 }}
              >
                <Lock className="h-6 w-6 text-accent" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
          Unlock PDF
        </h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          Remove passwords from encrypted PDF files — all processing happens locally
        </p>
      </div>

      {/* Drop zone / File info */}
      <AnimatePresence mode="wait">
        {stage === 'idle' && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
              }}
              aria-label="Upload PDF file"
              className={`group cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all sm:p-14 ${
                dragOver
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 transition-colors group-hover:bg-accent/10">
                <Upload className="h-5 w-5 text-text-tertiary transition-colors group-hover:text-accent" />
              </div>
              <p className="text-[14px] font-medium text-text-primary">
                Drop your encrypted PDF here
              </p>
              <p className="mt-1 text-[12px] text-text-tertiary">
                or click to browse files
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                  e.target.value = ''
                }}
              />
            </div>
          </motion.div>
        )}

        {(stage === 'file-selected' || stage === 'processing' || stage === 'error') && file && (
          <motion.div
            key="file-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* File card */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <FileText className="h-5 w-5 text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-text-primary">
                  {file.name}
                </p>
                <p className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
                  {formatFileSize(file.size)}
                  <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">
                    <Lock className="h-2.5 w-2.5" />
                    Encrypted
                  </span>
                </p>
              </div>
              <button
                onClick={reset}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-neutral-100 hover:text-text-secondary"
                aria-label="Remove file"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Password input */}
            <div>
              <label
                htmlFor="pdf-password"
                className="mb-1.5 block text-[12px] font-medium text-text-secondary"
              >
                PDF Password
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id="pdf-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter the file password"
                  disabled={stage === 'processing'}
                  className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 pr-10 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-tertiary transition-colors hover:text-text-secondary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Smart hint */}
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-blue-50/60 px-3 py-2">
                <Info className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
                <p className="text-[11px] leading-relaxed text-blue-600/80">
                  Many Aadhaar PDFs use: First 4 letters of name (CAPS) + Birth Year.
                  E.g., <span className="font-medium">GAGA1990</span>
                </p>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {stage === 'error' && errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 overflow-hidden rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-error" />
                  <p className="text-[12px] leading-relaxed text-red-700">
                    {errorMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress */}
            {stage === 'processing' && (
              <div className="space-y-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-center text-[12px] text-text-tertiary">
                  Decrypting locally… {Math.round(progress)}%
                </p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleUnlock}
              disabled={!password || stage === 'processing'}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-accent-hover hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm"
            >
              {stage === 'processing' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <UnlockIcon className="h-4 w-4" />
                  Unlock PDF
                </>
              )}
            </button>
          </motion.div>
        )}

        {stage === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10"
              >
                <CheckCircle2 className="h-6 w-6 text-success" />
              </motion.div>
              <h2 className="text-[15px] font-semibold text-text-primary">
                PDF Unlocked Successfully
              </h2>
              <p className="mt-1 text-[12px] text-text-secondary">
                {pageCount > 0 && `${pageCount} page${pageCount > 1 ? 's' : ''} · `}
                Processed locally. Your file was never uploaded.
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-accent-hover hover:shadow-md active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Download Unlocked PDF
            </button>

            <button
              onClick={reset}
              className="flex h-9 w-full items-center justify-center rounded-lg border border-border text-[12px] font-medium text-text-secondary transition-colors hover:bg-neutral-50 hover:text-text-primary"
            >
              Unlock another PDF
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
