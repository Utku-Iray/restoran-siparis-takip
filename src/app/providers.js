'use client';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <CartProvider>
                <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-grow bg-white">{children}</main>
                    <Footer />
                </div>
            </CartProvider>
        </AuthProvider>
    );
} 