import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'STOCKROOM — Retail Store Management System',
  description: 'Ultra-premium, highly interactive retail management platform for electronics accessories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-app-bg text-content-primary selection:bg-brand-soft selection:text-brand font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
