import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vocalis AI Studio | Neural Text to Speech AI',
  description: 'Production-ready full-stack Text-to-Speech application powered by Vocalis AI, Kokoro-82M neural model, Next.js, and Node.js TypeScript.',
  keywords: ['Vocalis AI', 'Kokoro TTS', 'Text to Speech', 'AI Voice', 'Neural Speech', 'Next.js', 'Node.js', 'TypeScript', 'ONNX'],
  authors: [{ name: 'Vocalis AI Studio' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-violet-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
