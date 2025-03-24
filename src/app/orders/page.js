'use client';

import { useState } from 'react';

// Örnek veri - Backend entegrasyonunda değiştirilecek
const SAMPLE_ORDERS = [
    {
        id: "ORD001",
        date: "2024-03-20 14:30",
        status: "Hazırlanıyor",
        total: 240,
        items: [
            {
                name: "Köfte",
                quantity: 2,
                price: 120,
            }
        ],
        restaurant: "Lezzet Durağı",
        estimatedDelivery: "15:00"
    },
    {
        id: "ORD002",
        date: "2024-03-19 19:15",
        status: "Tamamlandı",
        total: 180,
        items: [
            {
                name: "Tavuk Şiş",
                quantity: 2,
                price: 90,
            }
        ],
        restaurant: "Lezzet Durağı",
        deliveredAt: "20:00"
    }
];

const STATUS_COLORS = {
    "Beklemede": "bg-yellow-100 text-yellow-800",
    "Hazırlanıyor": "bg-blue-100 text-blue-800",
    "Yolda": "bg-purple-100 text-purple-800",
    "Tamamlandı": "bg-green-100 text-green-800",
    "İptal Edildi": "bg-red-100 text-red-800"
};

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState('active');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const activeOrders = SAMPLE_ORDERS.filter(order => order.status !== "Tamamlandı" && order.status !== "İptal Edildi");
    const pastOrders = SAMPLE_ORDERS.filter(order => order.status === "Tamamlandı" || order.status === "İptal Edildi");

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Başlık */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
                </div>

                {/* Tab Menü */}
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

                {/* Sipariş Listesi */}
                <div className="space-y-4">
                    {(activeTab === 'active' ? activeOrders : pastOrders).map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        >
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Sipariş #{order.id}
                                        </h3>
                                        <p className="text-sm text-gray-500">{order.restaurant}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
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
                                                        {item.price * item.quantity} ₺
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="border-t pt-2 mt-2">
                                                <div className="flex justify-between font-medium">
                                                    <span className="text-gray-900">Toplam</span>
                                                    <span className="text-pink-600">{order.total} ₺</span>
                                                </div>
                                            </div>
                                            {order.status !== "Tamamlandı" && order.status !== "İptal Edildi" && (
                                                <div className="mt-4 bg-gray-50 p-3 rounded-md">
                                                    <p className="text-sm text-gray-600">
                                                        Tahmini Teslimat: {order.estimatedDelivery}
                                                    </p>
                                                </div>
                                            )}
                                            {order.status === "Tamamlandı" && (
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
                    ))}

                    {/* Sipariş bulunamadı */}
                    {((activeTab === 'active' && activeOrders.length === 0) ||
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
            </div>
        </div>
    );
}
