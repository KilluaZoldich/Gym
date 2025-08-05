import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scheda Allenamento",
  description: "App per gestire schede di allenamento e tracciare i progressi. Ottimizzata per iPhone 16 Pro.",
  keywords: ["gym", "fitness", "palestra", "allenamento", "workout", "iPhone", "mobile", "PWA", "scheda"],
  authors: [{ name: "Scheda Team" }],
  openGraph: {
    title: "Scheda Allenamento",
    description: "App per gestire schede di allenamento e tracciare i progressi. Ottimizzata per iPhone 16 Pro.",
    url: "https://scheda-allenamento.app",
    siteName: "Scheda",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scheda Allenamento",
    description: "App per gestire schede di allenamento e tracciare i progressi. Ottimizzata per iPhone 16 Pro.",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Scheda",
    "application-name": "Scheda",
    "msapplication-TileColor": "#1f2937",
    "msapplication-config": "/browserconfig.xml",
    "format-detection": "telephone=no",
  },
  icons: {
    icon: [
      { url: '/Gym/icon.svg', type: 'image/svg+xml' },
      { url: '/Gym/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/Gym/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/Gym/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/Gym/favicon.ico',
  },
  manifest: '/Gym/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1f2937" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Scheda" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/Gym/apple-touch-icon.png" />
        <link rel="manifest" href="/Gym/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
