'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderService } from '../services/orderService';
import { checkApiHealth } from '../services/axiosConfig';

// Durum renkleri
const STATUS_COLORS = {
    "Beklemede": "bg-yellow-100 text-yellow-800",
    "Hazırlanıyor": "bg-blue-100 text-blue-800",
    "Yolda": "bg-purple-100 text-purple-800",
    "Tamamlandı": "bg-green-100 text-green-800",
    "İptal Edildi": "bg-red-100 text-red-800",
    "pending": "bg-yellow-100 text-yellow-800",
    "preparing": "bg-blue-100 text-blue-800",
    "delivering": "bg-purple-100 text-purple-800",
    "delivered": "bg-green-100 text-green-800",
    "cancelled": "bg-red-100 text-red-800"
};

const translateStatus = (status) => {
    const statusMap = {
        "pending": "Beklemede",
        "preparing": "Hazırlanıyor",
        "delivering": "Yolda",
        "delivered": "Teslim Edildi",
        "cancelled": "İptal Edildi"
    };
    return statusMap[status] || status;
};

export default function OrdersPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('active');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTestData, setIsTestData] = useState(false);

    // Siparişleri yükle
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);

                const isApiConnected = await checkApiHealth();
                console.log('API bağlantısı kontrolü sonucu:', isApiConnected);

                const data = await orderService.getUserOrders();


                const hasTestOrders = Array.isArray(data) && data.some(order => order.isTestData === true);
                setIsTestData(!isApiConnected || hasTestOrders);

                console.log('Siparişler yüklendi:', data.length, 'adet sipariş');
                console.log('Test modu:', !isApiConnected || hasTestOrders);

                setOrders(data);
                setError(null);
            } catch (err) {
                console.error('Siparişler yüklenirken hata:', err);
                setError('Siparişleriniz yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                setIsTestData(true); // Hata durumunda test modu göster
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        const intervalId = setInterval(fetchOrders, 30000);

        return () => clearInterval(intervalId);
    }, []);

    const activeOrders = orders.filter(order => {
        const status = order.status || order.statusText;
        return status !== "delivered" &&
            status !== "cancelled" &&
            status !== "Teslim Edildi" &&
            status !== "İptal Edildi";
    });

    const pastOrders = orders.filter(order => {
        const status = order.status || order.statusText;
        return status === "delivered" ||
            status === "cancelled" ||
            status === "Teslim Edildi" ||
            status === "İptal Edildi";
    });

    const formatOrder = (order) => {
        // Tarihi formatla
        const orderDate = new Date(order.createdAt || order.date);
        const formattedDate = orderDate.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const status = order.statusText || translateStatus(order.status);

        const restaurantName = order.restaurant?.name || order.restaurant;

        const total = order.totalAmount || order.total;

        return {
            id: order.id,
            date: formattedDate,
            status,
            total,
            items: order.items || [],
            restaurant: restaurantName,
            estimatedDelivery: order.estimatedDelivery || "Yakında",
            deliveredAt: order.deliveredAt || (order.status === "delivered" ? "Teslim edildi" : ""),
            isTestData: order.isTestData
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-36 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Test verisi uyarısı - Header'ın altında kalmayacak şekilde sabit banner olarak tasarlandı */}
                {isTestData && (
                    <div className="fixed top-24 left-0 right-0 z-40 bg-yellow-100 border-b border-yellow-300 shadow-md">
                        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-center">
                                <span className="flex p-1 rounded-full bg-yellow-200 mr-3">
                                    <svg className="h-6 w-6 text-yellow-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <div className="flex flex-col">
                                    <p className="font-medium text-yellow-800 text-center">API bağlantısı yok - Test modu aktif</p>
                                    <p className="text-xs text-yellow-700 mt-1">Siparişleriniz gerçek zamanlı olarak işlenemiyor, görüntülediğiniz siparişler test amaçlıdır.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center mb-8 mt-10">
                    <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="flex space-x-4 bg-white rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'active'
                                ? 'bg-pink-600 text-white'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Aktif Siparişler
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'past'
                                ? 'bg-pink-600 text-white'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Geçmiş Siparişler
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Siparişleriniz yükleniyor...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <p>{error}</p>
                        <button
                            onClick={() => router.refresh()}
                            className="mt-2 bg-red-200 hover:bg-red-300 px-4 py-1 rounded text-sm"
                        >
                            Yeniden Dene
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="space-y-4">
                        {(activeTab === 'active' ? activeOrders : pastOrders).map((rawOrder) => {
                            const order = formatOrder(rawOrder);
                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Sipariş #{typeof order.id === 'string' && order.id.startsWith('sample') ? order.id.substring(0, 10) + '...' : order.id}
                                                </h3>
                                                <p className="text-sm text-gray-500">{order.restaurant}</p>
                                                {order.isTestData && (
                                                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mt-1">
                                                        Test siparişi
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {order.status}
                                                </span>
                                                <p className="text-sm text-gray-500 mt-1">{order.date}</p>
                                            </div>
                                        </div>

                                        {selectedOrder?.id === order.id && (
                                            <div className="border-t pt-4 mt-4">
                                                <div className="space-y-2">
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className="flex justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {item.quantity}x {item.name}
                                                            </span>
                                                            <span className="text-gray-900 font-medium">
                                                                {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="border-t pt-2 mt-2">
                                                        <div className="flex justify-between font-medium">
                                                            <span className="text-gray-900">Toplam</span>
                                                            <span className="text-pink-600">{order.total.toLocaleString('tr-TR')} ₺</span>
                                                        </div>
                                                    </div>
                                                    {order.status !== "Teslim Edildi" && order.status !== "İptal Edildi" && (
                                                        <div className="mt-4 bg-gray-50 p-3 rounded-md">
                                                            <p className="text-sm text-gray-600">
                                                                Tahmini Teslimat: {order.estimatedDelivery}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {order.status === "Teslim Edildi" && (
                                                        <div className="mt-4 bg-green-50 p-3 rounded-md">
                                                            <p className="text-sm text-green-600">
                                                                Teslim Edildi: {order.deliveredAt}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {!loading && ((activeTab === 'active' && activeOrders.length === 0) ||
                            (activeTab === 'past' && pastOrders.length === 0)) && (
                                <div className="text-center py-12 bg-white rounded-lg">
                                    <p className="text-gray-500 text-lg">
                                        {activeTab === 'active'
                                            ? 'Aktif siparişiniz bulunmuyor.'
                                            : 'Geçmiş siparişiniz bulunmuyor.'
                                        }
                                    </p>
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    );
}
