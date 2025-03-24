'use client';

import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    // Toplam tutarı hesapla
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 15; // Sabit teslimat ücreti
    const finalTotal = total + deliveryFee;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Burada ödeme işlemi ve sipariş kaydı yapılacak
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simüle edilmiş işlem
            clearCart();
            router.push('/orders'); // Sipariş takip sayfasına yönlendir
        } catch (error) {
            console.error('Ödeme işlemi başarısız:', error);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        router.push('/cart');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Ödeme</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sipariş Özeti */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between">
                                        <div>
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                                        </div>
                                        <span>{item.price * item.quantity} ₺</span>
                                    </div>
                                ))}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between">
                                        <span>Ara Toplam</span>
                                        <span>{total} ₺</span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span>Teslimat Ücreti</span>
                                        <span>{deliveryFee} ₺</span>
                                    </div>
                                    <div className="flex justify-between mt-4 font-semibold text-lg">
                                        <span>Toplam</span>
                                        <span>{finalTotal} ₺</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ödeme Formu */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Ad Soyad
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Teslimat Adresi
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Telefon
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                                    Kart Numarası
                                </label>
                                <input
                                    type="text"
                                    id="cardNumber"
                                    name="cardNumber"
                                    required
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="1234 5678 9012 3456"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                                        Son Kullanma Tarihi
                                    </label>
                                    <input
                                        type="text"
                                        id="expiryDate"
                                        name="expiryDate"
                                        required
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        placeholder="AA/YY"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        id="cvv"
                                        name="cvv"
                                        required
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                            >
                                {loading ? 'İşleniyor...' : `${finalTotal} ₺ Öde`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 