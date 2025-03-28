'use client';

import { Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import dynamic from 'next/dynamic';

// Client taraflı yükleme için
const Header = dynamic(() => import('@/components/Header'), {
    ssr: false,
    loading: () => <div className="h-16 bg-white shadow"></div>
});

const Footer = dynamic(() => import('@/components/Footer'), {
    ssr: false,
    loading: () => <div className="h-12 bg-gray-100"></div>
});

// Sunucu tarafında render edilebilecek basit layout
const ServerLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col">
        <div className="h-16 bg-white shadow"></div>
        <main className="flex-grow bg-white">{children}</main>
        <div className="h-12 bg-gray-100"></div>
    </div>
);

// Client tarafında render edilecek tam layout
const ClientLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-white">{children}</main>
        <Footer />
    </div>
);

export default function Providers({ children }) {
    // React Context'leri sunucu tarafında güvenli şekilde sarmak için Suspense kullanıyoruz
    return (
        <Suspense fallback={<ServerLayout>{children}</ServerLayout>}>
            <AuthProvider>
                <CartProvider>
                    <ClientLayout>{children}</ClientLayout>
                </CartProvider>
            </AuthProvider>
        </Suspense>
    );
} 