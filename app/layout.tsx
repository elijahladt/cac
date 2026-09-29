import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { Navbar } from '@/components/ui/Navbar';
import { BottomNav } from '@/components/ui/BottomNav';

export const metadata: Metadata = {
  title: 'Nevada Nexus | Multimodal AI Community Assistance Navigator',
  description:
    'Empowering North Las Vegas & Nevada CD-4 residents to discover verified local assistance for utilities, food, housing, and emergency aid with multimodal voice, document scanning, and personalized action plans.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1e4db9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-16 md:pb-0">
        <LanguageProvider>
          <EmergencyBanner />
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}
