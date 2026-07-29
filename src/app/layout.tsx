import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import { site } from '@/shared/config/site';
import { ThemeProvider } from '@/shared/ui';

import 'flag-icons/css/flag-icons.min.css';
import './globals.css';

/**
 * Fonts are self-hosted by `next/font`: the files are downloaded at build time
 * and served from our own origin. No runtime request to Google, no third-party
 * origin in the CSP, no layout shift while a webfont loads.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.legalName,
  authors: [{ name: site.legalName }],
  keywords: [
    'international trade',
    'export management',
    'buyer discovery',
    'supplier sourcing',
    'trade CRM',
    'B2B outreach',
  ],
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom is never capped: pinch-to-zoom is an accessibility necessity for
  // low-vision users, and disabling it is a WCAG failure.
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfcfd' },
    { media: '(prefers-color-scheme: dark)', color: '#15181c' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={site.locale}
      // next-themes writes the theme class here before React hydrates; without
      // this, React reports a mismatch it cannot possibly avoid.
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-dvh">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
