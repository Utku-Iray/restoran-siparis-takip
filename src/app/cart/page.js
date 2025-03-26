'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function CartPage() {
    const router = useRouter();
    const { items: cartItems, updateQuantity, removeFromCart, total } = useCart();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cart context zaten localStorage'dan yüklüyor, sadece loading durumunu ayarlıyoruz
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Sepetiniz Boş</h2>
                    <p className="text-gray-600 mb-8">Sepetinizde henüz ürün bulunmuyor.</p>
                    <button
                        onClick={() => router.push('/menu')}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    >
                        Menüye Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Sepetim</h1>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <li key={item.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-gray-500">
                                            {typeof item.price === 'number' ? item.price.toFixed(2) : item.price} TL
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                -
                                            </button>
                                            <span className="text-gray-900 font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="px-6 py-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-medium text-gray-900">Toplam</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {typeof total === 'number' ? total.toFixed(2) : total} TL
                            </span>
                        </div>
                        <button
                            onClick={() => router.push('/checkout')}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                            Siparişi Tamamla
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 