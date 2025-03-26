'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/app/services/orderService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getRestaurantOrders();
            setOrders(data);
            setError(null);
        } catch (err) {
            setError('Siparişler yüklenirken bir hata oluştu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            loadOrders();
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
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
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Siparişler</h1>
            </div>

            <div className="flex space-x-2 mb-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'all'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    Tümü
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'pending'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    Bekleyen
                </button>
                <button
                    onClick={() => setActiveTab('preparing')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'preparing'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    Hazırlanıyor
                </button>
                <button
                    onClick={() => setActiveTab('ready')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'ready'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    Hazır
                </button>
                <button
                    onClick={() => setActiveTab('delivered')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'delivered'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    Teslim Edildi
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-primary">Sipariş #{order.id}</h2>
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
                                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                Detayları Gör
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-primary dark:text-white">Sipariş #{selectedOrder.id}</h2>
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
                                                {selectedOrder.totalAmount.toFixed(2)} TL
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