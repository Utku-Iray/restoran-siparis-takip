'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/app/services/orderService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

const OrderStatus = {
    pending: 'Beklemede',
    preparing: 'Hazırlanıyor',
    ready: 'Hazır',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi'
};

const OrderStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isUsingTestData, setIsUsingTestData] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    useEffect(() => {
        loadOrders();

        // 10 saniyede bir verileri arkaplanda yenile (sayfa yenileme yapmadan)
        const interval = setInterval(() => {
            loadOrders(true);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const loadOrders = async (isBackground = false) => {
        try {
            if (!isBackground) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const data = await orderService.getRestaurantOrders();

            // Test verisi kullanılıyor mu kontrol et
            const usingTestData = data.some(order => order.isTestData);
            setIsUsingTestData(usingTestData);

            setOrders(data);
            setLastRefresh(new Date());
            setError(null);
        } catch (err) {
            setError('Siparişler yüklenirken bir hata oluştu');
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            loadOrders(true);
        } catch (err) {
            console.error('Sipariş durumu güncellenirken hata:', err);
        }
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const order = await orderService.getOrderById(orderId);
            setSelectedOrder(order);
        } catch (err) {
            console.error('Sipariş detayları yüklenirken hata:', err);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    const handleRefresh = () => {
        loadOrders(true);
    };

    const handleGoBack = () => {
        router.push('/restaurant-panel');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Hata!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-36">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white shadow-sm rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleGoBack}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors flex items-center"
                                >
                                    <span className="mr-1">←</span> Geri Dön
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
                            </div>

                            <div className="flex items-center gap-4">
                                {isUsingTestData && (
                                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Test Verileri - API Bağlantısı Yok
                                    </div>
                                )}

                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className={`px-4 py-2 rounded-md transition-colors flex items-center ${refreshing
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {refreshing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Yenileniyor...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Yenile
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            Son güncelleme: {format(lastRefresh, 'dd MMMM yyyy HH:mm:ss', { locale: tr })}
                        </p>

                        <div className="flex space-x-2 mb-6 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-md ${activeTab === 'all'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                Tümü
                            </button>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-2 rounded-md ${activeTab === 'pending'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                Bekleyen
                            </button>
                            <button
                                onClick={() => setActiveTab('preparing')}
                                className={`px-4 py-2 rounded-md ${activeTab === 'preparing'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                Hazırlanıyor
                            </button>
                            <button
                                onClick={() => setActiveTab('ready')}
                                className={`px-4 py-2 rounded-md ${activeTab === 'ready'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                Hazır
                            </button>
                            <button
                                onClick={() => setActiveTab('delivered')}
                                className={`px-4 py-2 rounded-md ${activeTab === 'delivered'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                Teslim Edildi
                            </button>
                            <button
                                onClick={() => setActiveTab('cancelled')}
                                className={`px-4 py-2 rounded-md ${activeTab === 'cancelled'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                İptal Edildi
                            </button>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-10">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Sipariş Bulunamadı</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Henüz sipariş bulunmuyor veya seçilen filtreye uygun sipariş yok.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow 
                                                  ${order.isTestData ? 'border-l-4 border-yellow-400' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center">
                                                    <h2 className="text-xl font-semibold text-primary">Sipariş #{order.id.toString().slice(-4)}</h2>
                                                    {order.isTestData && (
                                                        <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                                                            Test
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-secondary">
                                                    {format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                                                </p>
                                            </div>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className="px-3 py-1 rounded text-sm font-medium bg-white dark:bg-gray-700 text-primary dark:text-white border border-gray-300 dark:border-gray-600"
                                            >
                                                <option value="pending">Beklemede</option>
                                                <option value="preparing">Hazırlanıyor</option>
                                                <option value="ready">Hazır</option>
                                                <option value="delivered">Teslim Edildi</option>
                                                <option value="cancelled">İptal Edildi</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="text-primary dark:text-white">
                                                        {item.quantity}x {item.name}
                                                    </span>
                                                    <span className="text-primary dark:text-white font-medium">
                                                        {(item.price * item.quantity).toFixed(2)} ₺
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className="flex justify-between text-secondary dark:text-gray-300">
                                                <span className="font-medium text-primary dark:text-white">Müşteri:</span>
                                                <span className="text-primary dark:text-white">{order.customerName}</span>
                                            </p>
                                            <p className="flex justify-between text-secondary dark:text-gray-300">
                                                <span className="font-medium text-primary dark:text-white">Telefon:</span>
                                                <span className="text-primary dark:text-white">{order.customerPhone}</span>
                                            </p>
                                            {order.customerAddress && (
                                                <p className="flex justify-between text-secondary dark:text-gray-300">
                                                    <span className="font-medium text-primary dark:text-white">Adres:</span>
                                                    <span className="text-primary dark:text-white">{order.customerAddress}</span>
                                                </p>
                                            )}
                                            <p className="flex justify-between text-secondary dark:text-gray-300">
                                                <span className="font-medium text-primary dark:text-white">Toplam:</span>
                                                <span className="text-primary dark:text-white">
                                                    {typeof order.totalAmount === 'string'
                                                        ? parseFloat(order.totalAmount).toFixed(2)
                                                        : order.totalAmount?.toFixed(2) || '0.00'} TL
                                                </span>
                                            </p>
                                        </div>

                                        {order.notes && (
                                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                <p className="text-sm text-secondary dark:text-gray-300">
                                                    <span className="font-medium text-primary dark:text-white">Notlar: </span>
                                                    {order.notes}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={() => viewOrderDetails(order.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                                            >
                                                Detayları Gör
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center">
                                    <h2 className="text-2xl font-bold text-primary dark:text-white">
                                        Sipariş #{selectedOrder.id.toString().slice(-4)}
                                    </h2>
                                    {selectedOrder.isTestData && (
                                        <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-sm">
                                            Test Verisi
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-secondary dark:text-gray-300">
                                    {format(new Date(selectedOrder.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-secondary hover:text-primary dark:text-gray-300 dark:hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Müşteri Bilgileri */}
                            <div>
                                <h3 className="text-lg font-semibold text-primary dark:text-white mb-3">Müşteri Bilgileri</h3>
                                <div className="space-y-2">
                                    <p className="flex justify-between text-secondary dark:text-gray-300">
                                        <span>İsim:</span>
                                        <span className="text-primary dark:text-white">{selectedOrder.customerName}</span>
                                    </p>
                                    <p className="flex justify-between text-secondary dark:text-gray-300">
                                        <span>Telefon:</span>
                                        <span className="text-primary dark:text-white">{selectedOrder.customerPhone}</span>
                                    </p>
                                    {selectedOrder.customerAddress && (
                                        <p className="flex justify-between text-secondary dark:text-gray-300">
                                            <span>Adres:</span>
                                            <span className="text-primary dark:text-white">{selectedOrder.customerAddress}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Sipariş Öğeleri */}
                            <div>
                                <h3 className="text-lg font-semibold text-primary dark:text-white mb-3">Sipariş Detayları</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span className="text-secondary dark:text-gray-300">
                                                {item.quantity}x {item.name}
                                            </span>
                                            <span className="text-primary dark:text-white font-medium">
                                                {(item.price * item.quantity).toFixed(2)} TL
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-primary dark:text-white">Toplam</span>
                                            <span className="text-xl font-bold text-primary dark:text-white">
                                                {parseFloat(selectedOrder.totalAmount).toFixed(2)} TL
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notlar */}
                            {selectedOrder.notes && (
                                <div>
                                    <h3 className="text-lg font-semibold text-primary dark:text-white mb-3">Notlar</h3>
                                    <p className="text-secondary dark:text-gray-300">{selectedOrder.notes}</p>
                                </div>
                            )}

                            {/* Durum Güncelleme */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h3 className="text-lg font-semibold text-primary dark:text-white mb-3">Sipariş Durumu</h3>
                                <div className="flex justify-between items-center">
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => {
                                            handleStatusUpdate(selectedOrder.id, e.target.value);
                                            setSelectedOrder(null);
                                        }}
                                        className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-primary dark:text-white border border-gray-300 dark:border-gray-600"
                                    >
                                        <option value="pending">Beklemede</option>
                                        <option value="preparing">Hazırlanıyor</option>
                                        <option value="ready">Hazır</option>
                                        <option value="delivered">Teslim Edildi</option>
                                        <option value="cancelled">İptal Edildi</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 