'use client';

import { useCart } from '../context/CartContext';
import { useState } from 'react';
import Link from 'next/link';

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);

    // Toplam tutarı hesapla
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleCheckout = async () => {
        setLoading(true);
        // Burada ödeme sayfasına yönlendirme yapılacak
        setTimeout(() => {
            setLoading(false);
            // Router ile ödeme sayfasına yönlendirme eklenecek
        }, 1000);
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-gray-900">Sepetiniz Boş</h2>
                        <p className="mt-4 text-gray-500">Menüye göz atarak sipariş vermeye başlayabilirsiniz.</p>
                        <Link href="/menu" className="mt-6 inline-block px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700">
                            Menüye Git
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Sepetim</h1>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {cart.map((item) => (
                            <div key={item.id} className="p-6 flex items-center">
                                <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="ml-6 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-lg font-medium text-gray-900">{item.price * item.quantity} ₺</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center border rounded-md">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                className="px-3 py-1 text-gray-600 hover:text-gray-700"
                                            >
                                                -
                                            </button>
                                            <span className="px-3 py-1 text-gray-600">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                className="px-3 py-1 text-gray-600 hover:text-gray-700"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Kaldır
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-gray-50">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>Toplam</p>
                            <p>{total} ₺</p>
                        </div>
                        <div className="mt-6 space-y-4">
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                            >
                                {loading ? 'İşleniyor...' : 'Siparişi Tamamla'}
                            </button>
                            <button
                                onClick={clearCart}
                                className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                            >
                                Sepeti Temizle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 