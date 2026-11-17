import React from 'react';
import type { Metadata, Viewport } from 'next';
// ⚠️ تأكد من مسار ملف الـ CSS ديالك (غالباً كيكون './globals.css')
import '../styles/tailwind.css';

// استيراد المكونات اللي صايبنا
import NetworkGuard from '@/components/NetworkGuard';
import BackButtonHandler from '@/components/BackButtonHandler';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // مهم جداً لشاشات التليفونات اللي فيهم Notch
};

export const metadata: Metadata = {
  title: 'Mo3idi - موعدي | Premium Barber Booking',
  description: 'Book your barber appointment in seconds.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/* هنا كنغلفو التطبيق كامل بـ NetworkGuard */}
        <NetworkGuard>
          {/* هنا كنحطو زر الرجوع */}
          <BackButtonHandler />
          {children}
        </NetworkGuard>
      </body>
    </html>
  );
}