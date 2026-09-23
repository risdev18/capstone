import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: {
    default: 'MediBox — Connected Health Monitoring Platform',
    template: '%s | MediBox',
  },
  description:
    'MediBox is an educational IoT health-monitoring platform for real-time sensor data collection, analytics, and care tracking. Not a substitute for professional medical advice.',
  keywords: [
    'health monitoring',
    'IoT healthcare',
    'ESP32',
    'heart rate monitor',
    'SpO2',
    'health dashboard',
    'capstone project',
  ],
  authors: [{ name: 'MediBox Team' }],
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/brand/medibox-icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
