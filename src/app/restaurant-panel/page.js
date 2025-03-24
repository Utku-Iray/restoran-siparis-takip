'use client';

import { useState } from 'react';

// Örnek veriler - Backend entegrasyonunda değiştirilecek
const SAMPLE_ORDERS = [
    {
        id: "ORD123",
        customerName: "Mehmet Yılmaz",
        items: [
            { name: "Köfte", quantity: 2, notes: "Az acılı" },
            { name: "Ayran", quantity: 2 }
        ],
        total: 240,
        status: "Yeni",
        orderTime: "14:30",
        address: "Atatürk Cad. No:123, Çankaya/Ankara"
    },
    // Diğer siparişler backend'den gelecek
];

const SAMPLE_MENU_ITEMS = [
    {
        id: 1,
        name: "Köfte",
        price: 120,
        category: "Ana Yemekler",
        description: "Izgara köfte, yanında pilav ve salata ile",
        isAvailable: true
    },
    // Diğer menü öğeleri backend'den gelecek
];

const SAMPLE_STATS = {
    dailyOrders: 45,
    dailyRevenue: 5400,
    monthlyOrders: 1250,
    monthlyRevenue: 150000,
    popularItems: [
        { name: "Köfte", count: 150 },
        { name: "Pide", count: 120 },
        { name: "Lahmacun", count: 100 }
    ]
};

export default function RestaurantPanel() {
    const [activeTab, setActiveTab] = useState('orders');
    const [orderStatus, setOrderStatus] = useState('all');
    const [showAddItemForm, setShowAddItemForm] = useState(false);
    const [newMenuItem, setNewMenuItem] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        isAvailable: true
    });

    const handleStatusChange = (orderId, newStatus) => {
        // Backend entegrasyonunda sipariş durumu güncellenecek
        console.log(`Sipariş ${orderId} durumu ${newStatus} olarak güncellendi`);
    };

    const handleAddMenuItem = (e) => {
        e.preventDefault();
        // Backend entegrasyonunda yeni menü öğesi eklenecek
        console.log('Yeni menü öğesi:', newMenuItem);
        setShowAddItemForm(false);
        setNewMenuItem({
            name: '',
            price: '',
            category: '',
            description: '',
            isAvailable: true
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Restoran Yönetim Paneli</h1>
                </div>


                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`py-4 px-6 text-sm font-medium ${activeTab === 'orders'
                                    ? 'border-b-2 border-pink-500 text-pink-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Siparişler
                            </button>
                            <button
                                onClick={() => setActiveTab('menu')}
                                className={`py-4 px-6 text-sm font-medium ${activeTab === 'menu'
                                    ? 'border-b-2 border-pink-500 text-pink-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Menü Yönetimi
                            </button>
                            <button
                                onClick={() => setActiveTab('stats')}
                                className={`py-4 px-6 text-sm font-medium ${activeTab === 'stats'
                                    ? 'border-b-2 border-pink-500 text-pink-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                İstatistikler
                            </button>
                        </nav>
                    </div>
                </div>


                {activeTab === 'orders' && (
                    <div className="space-y-6">

                        <div className="flex space-x-4 mb-4">
                            <button
                                onClick={() => setOrderStatus('all')}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${orderStatus === 'all'
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Tümü
                            </button>
                            <button
                                onClick={() => setOrderStatus('new')}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${orderStatus === 'new'
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Yeni
                            </button>
                            <button
                                onClick={() => setOrderStatus('preparing')}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${orderStatus === 'preparing'
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Hazırlanıyor
                            </button>
                        </div>


                        <div className="space-y-4">
                            {SAMPLE_ORDERS.map((order) => (
                                <div key={order.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Sipariş #{order.id}
                                            </h3>
                                            <p className="text-sm text-gray-500">{order.customerName}</p>
                                            <p className="text-sm text-gray-500">{order.orderTime}</p>
                                        </div>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="rounded-md border-gray-300 text-sm focus:ring-pink-500 focus:border-pink-500"
                                        >
                                            <option value="Yeni">Yeni</option>
                                            <option value="Hazırlanıyor">Hazırlanıyor</option>
                                            <option value="Yolda">Yolda</option>
                                            <option value="Tamamlandı">Tamamlandı</option>
                                        </select>
                                    </div>
                                    <div className="border-t border-b border-gray-200 py-4 my-4">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2">
                                                <div>
                                                    <span className="font-medium">{item.quantity}x</span>{' '}
                                                    <span>{item.name}</span>
                                                    {item.notes && (
                                                        <p className="text-sm text-gray-500">Not: {item.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-gray-500">Toplam: <span className="font-medium text-gray-900">{order.total} ₺</span></p>
                                        <p className="text-sm text-gray-500">{order.address}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {activeTab === 'menu' && (
                    <div>
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={() => setShowAddItemForm(true)}
                                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                            >
                                Yeni Ürün Ekle
                            </button>
                        </div>

                        {showAddItemForm && (
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <form onSubmit={handleAddMenuItem} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
                                        <input
                                            type="text"
                                            value={newMenuItem.name}
                                            onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fiyat</label>
                                        <input
                                            type="number"
                                            value={newMenuItem.price}
                                            onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                        <input
                                            type="text"
                                            value={newMenuItem.category}
                                            onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                                        <textarea
                                            value={newMenuItem.description}
                                            onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddItemForm(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                                        >
                                            Kaydet
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {SAMPLE_MENU_ITEMS.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500">{item.category}</p>
                                        </div>
                                        <p className="text-lg font-bold text-pink-600">{item.price} ₺</p>
                                    </div>
                                    <p className="text-gray-600 mb-4">{item.description}</p>
                                    <div className="flex justify-between items-center">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={item.isAvailable}
                                                onChange={() => {
                                                    // Backend entegrasyonunda güncellenecek
                                                    console.log(`${item.name} durumu güncellendi`);
                                                }}
                                                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Mevcut</span>
                                        </label>
                                        <button
                                            onClick={() => {
                                                // Backend entegrasyonunda düzenleme modalı açılacak
                                                console.log(`${item.name} düzenleniyor`);
                                            }}
                                            className="text-sm text-pink-600 hover:text-pink-700"
                                        >
                                            Düzenle
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Günlük Sipariş</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{SAMPLE_STATS.dailyOrders}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Günlük Gelir</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{SAMPLE_STATS.dailyRevenue} ₺</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Aylık Sipariş</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{SAMPLE_STATS.monthlyOrders}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Aylık Gelir</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{SAMPLE_STATS.monthlyRevenue} ₺</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">En Popüler Ürünler</h3>
                            <div className="space-y-4">
                                {SAMPLE_STATS.popularItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <span className="text-gray-600">{item.name}</span>
                                        <span className="text-gray-900 font-medium">{item.count} sipariş</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 