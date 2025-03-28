'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { orderService } from '../services/orderService';
import { useCart } from '../context/CartContext';

export default function OrderSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    const { clearCart, items } = useCart();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isTestData, setIsTestData] = useState(false);

    useEffect(() => {
        if (!orderId) {
            router.push('/');
            return;
        }

        // Eğer sepette hala ürünler varsa, temizle
        console.log('Sepet durumu kontrol ediliyor...');
        try {
            // Sepeti hem hook üzerinden hem de doğrudan localStorage'dan temizle
            clearCart();

            // LocalStorage'dan doğrudan temizle (daha güvenli)
            localStorage.removeItem('cart');
            localStorage.setItem('cart', '[]');

            console.log('Sipariş başarılı sayfasında sepet temizlendi');

            // LocalStorage'ı doğrula
            const currentCart = localStorage.getItem('cart');
            if (currentCart && currentCart !== '[]') {
                console.warn('Sepet tam olarak temizlenemedi, tekrar deneniyor...');
                localStorage.setItem('cart', '[]');
            }
        } catch (error) {
            console.error('Sepet temizleme hatası:', error);
            // Hata olsa bile localStorage'ı temizlemeye çalış
            localStorage.removeItem('cart');
        }

        loadOrderDetails();
    }, [orderId, router, clearCart]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const orderData = await orderService.getOrderById(parseInt(orderId));

            if (!orderData) {
                throw new Error('Sipariş bulunamadı');
            }

            setOrder(orderData);
            setIsTestData(orderData.isTestData || false);
        } catch (error) {
            console.error('Sipariş detayları yüklenirken hata:', error);
            setError('Sipariş bilgileri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-28">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-28">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md max-w-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                            <p className="mt-2">
                                <Link href="/" className="text-red-600 hover:text-red-500">
                                    Ana Sayfaya Dön
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-12 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {isTestData && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Test Siparişi:</strong> Bu, API bağlantısı olmadığı için yerel olarak oluşturulmuş bir test siparişidir.
                                        Gerçek bir restoran siparişi değildir ve sadece tarayıcınızda saklanmaktadır.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6">
                        <div className="flex justify-center mb-6">
                            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Siparişiniz Alındı!</h1>
                        <p className="text-center text-gray-600 mb-6">
                            Sipariş numaranız: <span className="font-semibold">#{orderId.toString().slice(-4)}</span>
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Sipariş Detayları</h3>
                                    <ul className="mt-2 divide-y divide-gray-200">
                                        {order.items.map((item, index) => (
                                            <li key={index} className="py-3 flex justify-between">
                                                <div>
                                                    <span className="text-gray-900">{item.quantity}x </span>
                                                    <span className="text-gray-900">{item.name}</span>
                                                </div>
                                                <span className="text-gray-900">{(item.price * item.quantity).toFixed(2)} TL</span>
                                            </li>
                                        ))}
                                        <li className="py-3 flex justify-between font-semibold">
                                            <span>Toplam</span>
                                            <span>{order.totalAmount.toFixed(2)} TL</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Teslimat Bilgileri</h3>
                                    <div className="mt-2 text-gray-900">
                                        <p>{order.customerName}</p>
                                        <p>{order.customerPhone}</p>
                                        {order.customerAddress && <p>{order.customerAddress}</p>}
                                    </div>
                                </div>

                                {order.notes && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Sipariş Notları</h3>
                                        <p className="mt-2 text-gray-900">{order.notes}</p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Ödeme Yöntemi</h3>
                                    <p className="mt-2 text-gray-900">
                                        {order.paymentMethod === 'cash' ? 'Kapıda Nakit Ödeme' : 'Kapıda Kredi Kartı'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Sipariş Durumu</h3>
                                    <p className="mt-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            {order.status === 'pending' ? 'Beklemede' :
                                                order.status === 'preparing' ? 'Hazırlanıyor' :
                                                    order.status === 'ready' ? 'Hazır' :
                                                        order.status === 'delivered' ? 'Teslim Edildi' :
                                                            order.status === 'cancelled' ? 'İptal Edildi' : 'Beklemede'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
                            <Link href="/" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Ana Sayfaya Dön
                            </Link>
                            <Link href="/restaurant" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Restoranları Keşfet
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 