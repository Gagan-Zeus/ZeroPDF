import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

// Configure pdf.js worker
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export interface UnlockResult {
  success: boolean
  data?: Uint8Array
  error?: string
  pageCount?: number
}

// Convert canvas to PNG bytes (lossless)
function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas export failed'))
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)))
      },
      'image/png'
    )
  })
}

export async function unlockPdf(
  fileBuffer: ArrayBuffer,
  password: string
): Promise<UnlockResult> {
  let pdfDoc: PDFDocumentProxy | null = null

  try {
    // pdfjs-dist decrypts AES-256 encrypted PDFs (like Aadhaar)
    const loadingTask = getDocument({
      data: new Uint8Array(fileBuffer),
      password,
    })

    pdfDoc = await loadingTask.promise
    const pageCount = pdfDoc.numPages

    // Create new unencrypted PDF using pdf-lib
    const newDoc = await PDFDocument.create()

    // Render each page at 4x scale for high quality, then embed as PNG
    const renderScale = 4

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i)
      
      // Get original dimensions (in PDF points, 72 points = 1 inch)
      const viewport = page.getViewport({ scale: 1 })
      const renderViewport = page.getViewport({ scale: renderScale })

      // Create high-res canvas
      const canvas = document.createElement('canvas')
      canvas.width = renderViewport.width
      canvas.height = renderViewport.height
      const ctx = canvas.getContext('2d')!
      
      // White background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Render page
      await page.render({
        canvasContext: ctx,
        viewport: renderViewport,
      } as Parameters<typeof page.render>[0]).promise

      // Convert to PNG (lossless)
      const pngBytes = await canvasToPngBytes(canvas)
      const image = await newDoc.embedPng(pngBytes)

      // Add page at original PDF dimensions
      const newPage = newDoc.addPage([viewport.width, viewport.height])
      newPage.drawImage(image, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      })

      // Cleanup
      canvas.width = 0
      canvas.height = 0
    }

    const savedBytes = await newDoc.save()
    await pdfDoc.destroy()

    return {
      success: true,
      data: savedBytes,
      pageCount,
    }
  } catch (err: unknown) {
    if (pdfDoc) {
      try { await pdfDoc.destroy() } catch { /* ignore */ }
    }

    const message = err instanceof Error ? err.message : String(err)
    console.error('PDF unlock error:', message)

    if (
      message.includes('PasswordException') ||
      message.includes('Incorrect Password') ||
      message.includes('incorrect password') ||
      message.includes('No password given') ||
      message.toLowerCase().includes('password')
    ) {
      return { success: false, error: 'Incorrect password. Please try again.' }
    }

    return { success: false, error: message }
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
