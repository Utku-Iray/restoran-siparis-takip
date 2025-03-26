import { Inter } from "next/font/google";
import "./globals.css";
import Providers from './providers';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Restoran Sipariş Takip',
  description: 'Online restoran sipariş ve takip sistemi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
