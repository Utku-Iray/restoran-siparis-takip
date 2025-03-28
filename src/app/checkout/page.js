'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, clearCart } = useCart();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isTestMode, setIsTestMode] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: '',
        address: '',
        notes: '',
        paymentMethod: 'cash'
    });

    useEffect(() => {
        // API bağlantısını kontrol et
        checkApiConnection();

        // Sepet boşsa checkout sayfasına erişim engelle
        if (!items || items.length === 0) {
            router.push('/cart');
        }
    }, [items, router]);

    const checkApiConnection = async () => {
        try {
            // API'ye basit bir istek yaparak bağlantıyı kontrol et
            const response = await fetch('http://localhost:3000/health', {
                method: 'GET',
                cache: 'no-store',
                signal: new AbortController().signal,
                timeout: 3000
            });
            setIsTestMode(false);
        } catch (error) {
            console.log('API bağlantısı yok, test modu aktif:', error);
            setIsTestMode(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setOrderSuccess(false);

        if (!formData.name || !formData.phone) {
            setError('Ad ve telefon numarası gereklidir');
            return;
        }

        try {
            setIsSubmitting(true);

            // Siparişi oluştur
            const order = {
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: total,
                customerName: formData.name,
                customerPhone: formData.phone,
                customerAddress: formData.address,
                notes: formData.notes,
                paymentMethod: formData.paymentMethod,
                userId: user?.id,
                restaurantId: items[0]?.restaurantId || 1, // Tüm ürünlerin aynı restorandan olduğunu varsayıyoruz
                status: 'pending'
            };

            // Sipariş oluşturma işlemi
            console.log('Sipariş oluşturuluyor...', order);
            const result = await orderService.createOrder(order);
            console.log('Sipariş oluşturma sonucu:', result);

            if (!result || !result.id) {
                throw new Error('Sipariş oluşturulamadı: ' + JSON.stringify(result));
            }

            // Başarılı sipariş bilgisini ayarla
            setOrderId(result.id);
            setOrderSuccess(true);

            // Önce sepeti temizle ve sonra yönlendir - böylece veri kaybı olmaz
            try {
                // Sepeti temiz temiz
                clearCart();

                // localStorage'dan da elle temizleyelim
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('cart');
                    localStorage.setItem('cart', '[]');

                    // Temizleme işlemi tamamlandıktan sonra yönlendirme yapalım
                    console.log(`Sipariş başarılı, ID: ${result.id}, sepet temizlendi. Yönlendirme yapılıyor...`);

                    // Güvenli yönlendirme: önce değişkeni ayarlayıp sonra yönlendir
                    const url = '/cart?ordered=true';
                    window.location.href = url;
                }
            } catch (clearError) {
                console.error('Sepet temizleme hatası:', clearError);
                // Hata olsa bile cart sayfasına yönlendir
                window.location.href = '/cart?ordered=true';
            }

        } catch (error) {
            console.error('Sipariş oluşturma hatası:', error);
            setError('Sipariş oluşturulurken bir hata oluştu: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!items || items.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-32 pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {orderSuccess && (
                    <div className="mb-6 bg-green-100 border-2 border-green-500 p-6 rounded-lg shadow-lg">
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
                                    Siparişiniz #{orderId} restoran tarafından alındı ve en kısa sürede hazırlanacak.
                                    Birazdan yönlendirileceksiniz...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {isTestMode && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Test Modu Aktif:</strong> API bağlantısı olmadığı için test siparişi oluşturulacak.
                                        Bu sipariş sadece tarayıcınızda saklanacak ve 5 saat sonra otomatik olarak silinecek.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="px-4 py-5 sm:p-6">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sipariş Tamamla</h1>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Teslimat Bilgileri</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adres</label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Sipariş Notları</label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                            placeholder="Özel istekleriniz, alerjenler vs."
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Yöntemi</label>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    id="cash"
                                                    name="paymentMethod"
                                                    type="radio"
                                                    checked={formData.paymentMethod === 'cash'}
                                                    value="cash"
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                                />
                                                <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700">
                                                    Kapıda Nakit Ödeme
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="card"
                                                    name="paymentMethod"
                                                    type="radio"
                                                    checked={formData.paymentMethod === 'card'}
                                                    value="card"
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                                />
                                                <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                                                    Kapıda Kredi Kartı
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Sipariş Oluşturuluyor...' : 'Siparişi Tamamla'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Özeti</h2>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="max-h-80 overflow-y-auto">
                                        <ul className="divide-y divide-gray-200">
                                            {items.map((item) => (
                                                <li key={item.id} className="py-3 flex justify-between">
                                                    <div className="flex items-center">
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                            <p className="text-sm text-gray-500">{item.quantity} x {item.price.toFixed(2)} TL</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">{(item.price * item.quantity).toFixed(2)} TL</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between">
                                        <p className="text-sm text-gray-600">Toplam</p>
                                        <p className="text-sm font-medium text-gray-900">{total.toFixed(2)} TL</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 