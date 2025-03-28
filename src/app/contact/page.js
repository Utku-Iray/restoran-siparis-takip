'use client';

import { useState } from 'react';


const FAQ_ITEMS = [
    {
        question: "Sipariş verdikten sonra ne kadar sürede gelir?",
        answer: "Siparişiniz, restoranın yoğunluğuna ve konumunuza bağlı olarak ortalama 30-45 dakika içerisinde teslim edilir."
    },
    {
        question: "Ödeme seçenekleri nelerdir?",
        answer: "Kredi kartı, banka kartı ve kapıda ödeme seçeneklerimiz mevcuttur. Online ödemelerde 3D Secure güvenlik sistemi kullanılmaktadır."
    },
    {
        question: "Minimum sipariş tutarı var mı?",
        answer: "Minimum sipariş tutarı restoranlara göre değişiklik göstermektedir. Seçtiğiniz restoranın minimum sipariş tutarını menü sayfasında görebilirsiniz."
    },
    {
        question: "Siparişimi nasıl iptal edebilirim?",
        answer: "Siparişiniz hazırlanmaya başlamadan önce 'Siparişlerim' sayfasından iptal edebilirsiniz. Hazırlanmaya başlanan siparişler için müşteri hizmetleri ile iletişime geçmeniz gerekmektedir."
    }
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        orderNumber: ''
    });
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [submitStatus, setSubmitStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Form gönderildi:', formData);
        setSubmitStatus('success');
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            orderNumber: ''
        });
        setTimeout(() => setSubmitStatus(''), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">İletişim ve Destek</h1>
                    <p className="mt-4 text-lg text-gray-600">Size nasıl yardımcı olabiliriz?</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    <div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bize Ulaşın</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">E-posta</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Konu</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        required
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="siparis">Sipariş Hakkında</option>
                                        <option value="teknik">Teknik Sorun</option>
                                        <option value="oneri">Öneri/Şikayet</option>
                                        <option value="diger">Diğer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sipariş Numarası (Opsiyonel)</label>
                                    <input
                                        type="text"
                                        value={formData.orderNumber}
                                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mesajınız</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                >
                                    Gönder
                                </button>
                            </form>
                            {submitStatus === 'success' && (
                                <div className="mt-4 p-4 bg-green-50 rounded-md">
                                    <p className="text-green-800">Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SSS */}
                    <div>
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Sık Sorulan Sorular</h2>
                                <div className="space-y-4">
                                    {FAQ_ITEMS.map((item, index) => (
                                        <div key={index} className="border-b border-gray-200 pb-4">
                                            <button
                                                className="flex justify-between items-center w-full text-left"
                                                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                            >
                                                <span className="text-gray-900 font-medium">{item.question}</span>
                                                <span className="ml-6 flex-shrink-0">
                                                    {expandedFaq === index ? (
                                                        <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </span>
                                            </button>
                                            {expandedFaq === index && (
                                                <div className="mt-2">
                                                    <p className="text-gray-600">{item.answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* İletişim Bilgileri */}
                            <div className="border-t border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Diğer İletişim Kanalları</h3>
                                <div className="space-y-3">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Telefon:</span> (553) 566 92 71
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">E-posta:</span> destek@rslezzet.com
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Çalışma Saatleri:</span> Her gün 09:00 - 24:00
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 