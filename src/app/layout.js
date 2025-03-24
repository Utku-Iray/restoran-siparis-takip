import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from 'next/link'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: 'Restoran Sipariş Takip',
  description: 'Online restoran sipariş ve takip sistemi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body
        className={`${inter.className} antialiased text-gray-900`}
      >
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="bg-white min-h-screen w-full">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
