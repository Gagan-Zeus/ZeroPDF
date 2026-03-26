import * as mupdf from 'mupdf'

export interface UnlockResult {
  success: boolean
  data?: Uint8Array
  error?: string
  pageCount?: number
}

export interface PdfCheckResult {
  isEncrypted: boolean
  error?: string
}

// Check if PDF is password protected
export async function checkPdfEncryption(fileBuffer: ArrayBuffer): Promise<PdfCheckResult> {
  try {
    const doc = mupdf.Document.openDocument(fileBuffer, 'application/pdf')
    const needsPassword = doc.needsPassword()
    doc.destroy()
    return { isEncrypted: needsPassword }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { isEncrypted: false, error: message }
  }
}

export async function unlockPdf(
  fileBuffer: ArrayBuffer,
  password: string
): Promise<UnlockResult> {
  try {
    // Open PDF with mupdf
    const doc = mupdf.Document.openDocument(fileBuffer, 'application/pdf')

    // Check if password is needed
    if (doc.needsPassword()) {
      const authResult = doc.authenticatePassword(password)
      // authResult: 0 = failed, 1 = user password ok, 2 = owner password ok
      if (authResult === 0) {
        doc.destroy()
        return { success: false, error: 'Incorrect password. Please try again.' }
      }
    }

    const pageCount = doc.countPages()

    // Get PDF document for saving
    const pdfDoc = doc.asPDF()
    if (!pdfDoc) {
      doc.destroy()
      return { success: false, error: 'Not a valid PDF file.' }
    }

    // Save decrypted PDF - this preserves all vector content
    const buffer = pdfDoc.saveToBuffer('decrypt')
    const data = buffer.asUint8Array()

    doc.destroy()
    buffer.destroy()

    return {
      success: true,
      data: new Uint8Array(data),
      pageCount,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)

    if (
      message.toLowerCase().includes('password') ||
      message.toLowerCase().includes('encrypted')
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
