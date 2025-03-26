'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderService } from '@/app/services/orderService';

export default function CheckoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        notes: ''
    });

    useEffect(() => {
        // Sayfa yüklendiğinde sepeti kontrol et
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('Sepet içeriği:', cartItems);

        if (cartItems.length === 0) {
            setError('Sepetiniz boş!');
            return;
        }

        // restaurantId'yi ilk menü öğesinden al
        const restaurantId = cartItems[0].restaurantId;
        console.log('Restoran ID:', restaurantId);

        if (!restaurantId) {
            setError('Restoran bilgisi bulunamadı. Lütfen menü sayfasına dönüp tekrar deneyin.');
            return;
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            console.log('Checkout - Sipariş oluşturulurken sepet içeriği:', cartItems);

            if (cartItems.length === 0) {
                throw new Error('Sepetiniz boş!');
            }

            // Tüm ürünlerin aynı restorandan olduğundan emin ol
            const firstItemRestaurantId = cartItems[0].restaurantId;
            const allSameRestaurant = cartItems.every(item => item.restaurantId === firstItemRestaurantId);

            console.log('Checkout - Ürünlerin restaurantId değerleri kontrolü:', {
                firstItemRestaurantId,
                allSameRestaurant,
                itemRestaurantIds: cartItems.map(item => item.restaurantId)
            });

            if (!allSameRestaurant) {
                throw new Error('Sepetinizde farklı restoranlardan ürünler bulunuyor. Lütfen tek bir restorandan sipariş verin.');
            }

            // localStorage'dan restaurantId'yi al
            const storedRestaurantId = localStorage.getItem('restaurantId');
            console.log('Checkout - localStorage\'dan alınan restaurantId:', storedRestaurantId);

            // Sepetteki ürünlerin restaurantId'si ile localStorage'daki restaurantId uyumlu mu kontrol et
            if (storedRestaurantId && Number(storedRestaurantId) !== firstItemRestaurantId) {
                console.warn('Checkout - UYARI: localStorage\'daki restaurantId ile sepetteki ürünlerin restaurantId\'si uyuşmuyor!');
            }

            // Öncelikle sepetteki ürünlerin restaurantId'sini kullan
            const restaurantId = firstItemRestaurantId;
            const restaurantName = localStorage.getItem('restaurantName') || cartItems[0].restaurantName || 'Restoran';
            const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

            console.log('Checkout - Sipariş detayları:', {
                restaurantId,
                restaurantName,
                totalAmount,
                items: cartItems,
                customerInfo: formData
            });

            if (!restaurantId) {
                throw new Error('Restoran bilgisi bulunamadı. Lütfen menü sayfasına dönüp tekrar deneyin.');
            }

            const orderData = {
                ...formData,
                items: cartItems,
                totalAmount,
                restaurantId: parseInt(restaurantId),
                restaurantName,
                status: 'pending'
            };

            console.log('Checkout - Gönderilecek sipariş verisi:', orderData);

            const response = await orderService.createOrder(orderData);
            console.log('Checkout - Sipariş yanıtı:', response);

            localStorage.removeItem('cart');
            // Sadece sepeti temizle, restaurantId ve restaurantName'i tutuyoruz
            // localStorage.removeItem('restaurantId');
            // localStorage.removeItem('restaurantName');

            alert(`Siparişiniz ${restaurantName} restoranına başarıyla iletildi!`);
            router.push('/');
        } catch (err) {
            console.error('Checkout - Sipariş hatası:', err);
            setError(err.response?.data?.message || err.message || 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Siparişi Tamamla</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Lütfen siparişinizi tamamlamak için bilgilerinizi girin
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                            Ad Soyad
                        </label>
                        <input
                            type="text"
                            id="customerName"
                            name="customerName"
                            required
                            value={formData.customerName}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
                            Telefon
                        </label>
                        <input
                            type="tel"
                            id="customerPhone"
                            name="customerPhone"
                            required
                            value={formData.customerPhone}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">
                            Adres
                        </label>
                        <textarea
                            id="customerAddress"
                            name="customerAddress"
                            required
                            value={formData.customerAddress}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Notlar (Opsiyonel)
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={2}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                    >
                        {loading ? 'Sipariş Oluşturuluyor...' : 'Siparişi Tamamla'}
                    </button>
                </form>
            </div>
        </div>
    );
} 