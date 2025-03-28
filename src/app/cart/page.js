'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useSearchParams } from 'next/navigation';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, total } = useCart();
    const [isClient, setIsClient] = useState(false);
    const searchParams = useSearchParams();
    const ordered = searchParams?.get('ordered');
    const [showOrderSuccess, setShowOrderSuccess] = useState(false);


    useEffect(() => {

        setIsClient(true);


        const isOrdered = ordered === 'true';


        if (isOrdered) {
            console.log('Sipariş başarılı mesajı gösteriliyor');
            setShowOrderSuccess(true);


            const timer = setTimeout(() => {
                setShowOrderSuccess(false);
            }, 30000);

            return () => clearTimeout(timer);
        }
    }, [ordered]);

    if (!isClient) {
        return <div className="min-h-screen pt-32">Yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen pt-32 pb-12 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {showOrderSuccess && (
                    <div className="mb-6 bg-green-100 border-2 border-green-500 p-6 rounded-lg shadow-lg animate-fadeIn success-pulse">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                                <svg className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="text-lg font-bold text-green-800">
                                    Siparişiniz Başarıyla Alındı!
                                </h2>
                                <p className="text-green-700">
                                    Siparişiniz restoran tarafından alındı ve en kısa sürede hazırlanacak.
                                    Siparişlerinizi <Link href="/orders" className="underline font-medium">Siparişlerim</Link> sayfasından takip edebilirsiniz.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sepetim</h1>

                        {items.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">Sepetiniz boş</h3>
                                <p className="mt-1 text-sm text-gray-500">Sepetinize henüz ürün eklemediniz.</p>
                                <div className="mt-6">
                                    <Link href="/restaurant" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                        Restoranları Keşfet
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flow-root">
                                    <ul className="-my-6 divide-y divide-gray-200">
                                        {items.map((item) => (
                                            <li key={item.id} className="py-6 flex">
                                                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                                                    <img
                                                        src={item.image || "/image/default-food.jpg"}
                                                        alt={item.name}
                                                        className="w-full h-full object-center object-cover"
                                                    />
                                                </div>
                                                <div className="ml-4 flex-1 flex flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                                            <h3>{item.name}</h3>
                                                            <p className="ml-4">{(item.price * item.quantity).toFixed(2)} TL</p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {item.description?.substring(0, 100)}
                                                            {item.description?.length > 100 ? '...' : ''}
                                                        </p>
                                                    </div>
                                                    <div className="flex-1 flex items-end justify-between text-sm">
                                                        <div className="flex items-center border rounded-md">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                                className="px-3 py-1 bg-gray-100 text-black hover:bg-gray-200"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="px-3 py-1 text-black">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-red-600 hover:text-red-500"
                                                        >
                                                            Kaldır
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <p>Toplam</p>
                                            <p>{total.toFixed(2)} TL</p>
                                        </div>
                                        <p className="mt-0.5 text-sm text-gray-500">Vergiler ve kargo ücreti dahildir.</p>
                                        <div className="mt-6">
                                            <Link
                                                href="/checkout"
                                                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Sipariş Ver
                                            </Link>
                                        </div>
                                        <div className="mt-4 flex justify-center text-sm text-center text-gray-500">
                                            <p>
                                                veya{' '}
                                                <Link href="/restaurant" className="text-red-600 hover:text-red-500">
                                                    Alışverişe Devam Et
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 