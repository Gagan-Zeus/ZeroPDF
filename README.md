# ZeroPDF

A browser-based PDF password removal tool that preserves document quality. All processing happens locally in your browser - files never leave your device.

## Features

- Remove passwords from encrypted PDFs
- Preserves vector text and graphics (no quality loss)
- Auto-detects if PDF is password protected
- Works completely offline
- Zero file uploads - everything runs in-browser
- Maintains original file size

## How It Works

ZeroPDF uses MuPDF.js (compiled to WebAssembly) to decrypt password-protected PDFs. Unlike other tools that rasterize pages into images, this approach preserves all vector content including text, fonts, and graphics. The result is identical to the original PDF but without encryption.

## Tech Stack

- React 19 with TypeScript
- MuPDF.js for PDF decryption
- Tailwind CSS for styling
- Framer Motion for animations
- Vite for build tooling

## Development

Install dependencies:
```bash
npm install
```

Start dev server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## How to Use

1. Drop an encrypted PDF or click to browse
2. Enter the password when prompted
3. Download the unlocked PDF

If you upload a non-encrypted PDF, the app will notify you that no password is required.

## License

MIT License - see LICENSE file for details

## Notes

MuPDF.js is licensed under AGPL. If you're building a commercial closed-source application, contact Artifex for a commercial license.
