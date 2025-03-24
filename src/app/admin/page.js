'use client';

import { useState } from 'react';

// Örnek veriler - Backend entegrasyonunda değiştirilecek
const SAMPLE_RESTAURANTS = [
    {
        id: 1,
        name: "Lezzet Durağı",
        owner: "Ahmet Yılmaz",
        status: "Aktif",
        rating: 4.5,
        totalOrders: 1250,
        monthlyRevenue: 45000
    },
    {
        id: 2,
        name: "Pizza House",
        owner: "Mehmet Demir",
        status: "Aktif",
        rating: 4.2,
        totalOrders: 850,
        monthlyRevenue: 32000
    }
];

const SAMPLE_USERS = [
    {
        id: 1,
        name: "Ali Yıldız",
        email: "ali@example.com",
        type: "Müşteri",
        orders: 25,
        joinDate: "2024-01-15"
    },
    {
        id: 2,
        name: "Ayşe Kaya",
        email: "ayse@example.com",
        type: "Restoran",
        orders: 0,
        joinDate: "2024-02-20"
    }
];

const SAMPLE_STATS = {
    totalUsers: 1500,
    totalRestaurants: 45,
    totalOrders: 25000,
    totalRevenue: 750000,
    activeOrders: 120,
    monthlyGrowth: 15
};

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

    const handleStatusChange = (restaurantId, newStatus) => {
        // Backend entegrasyonunda restoran durumu güncellenecek
        console.log(`Restoran ${restaurantId} durumu ${newStatus} olarak güncellendi`);
    };

    const handleUserTypeChange = (userId, newType) => {
        // Backend entegrasyonunda kullanıcı tipi güncellenecek
        console.log(`Kullanıcı ${userId} tipi ${newType} olarak güncellendi`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
                </div>


                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`py-4 px-6 text-sm font-medium ${activeTab === 'dashboard'
                                    ? 'border-b-2 border-pink-500 text-pink-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('restaurants')}
                                className={`py-4 px-6 text-sm font-medium ${activeTab === 'restaurants'
                                    ? 'border-b-2 border-pink-500 text-pink-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Restoranlar
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`py-4 px-6 text-sm font-medium ${activeTab === 'users'
                                    ? 'border-b-2 border-pink-500 text-pink-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Kullanıcılar
                            </button>
                        </nav>
                    </div>
                </div>


                {activeTab === 'dashboard' && (
                    <div className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Toplam Kullanıcı</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{SAMPLE_STATS.totalUsers}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Toplam Restoran</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{SAMPLE_STATS.totalRestaurants}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Toplam Sipariş</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{SAMPLE_STATS.totalOrders}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Toplam Gelir</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{SAMPLE_STATS.totalRevenue} ₺</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Aktif Siparişler</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{SAMPLE_STATS.activeOrders}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Aylık Büyüme</h3>
                                <p className="mt-2 text-3xl font-bold text-green-600">%{SAMPLE_STATS.monthlyGrowth}</p>
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === 'restaurants' && (
                    <div className="space-y-6">

                        <div className="flex justify-between items-center">
                            <input
                                type="text"
                                placeholder="Restoran ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            />
                            <button className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700">
                                Yeni Restoran Ekle
                            </button>
                        </div>


                        <div className="bg-white shadow overflow-hidden rounded-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Restoran
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sahibi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Durum
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Değerlendirme
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Toplam Sipariş
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aylık Gelir
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {SAMPLE_RESTAURANTS.map((restaurant) => (
                                        <tr key={restaurant.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{restaurant.owner}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={restaurant.status}
                                                    onChange={(e) => handleStatusChange(restaurant.id, e.target.value)}
                                                    className="text-sm rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                                                >
                                                    <option value="Aktif">Aktif</option>
                                                    <option value="Pasif">Pasif</option>
                                                    <option value="İnceleniyor">İnceleniyor</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{restaurant.rating}/5</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{restaurant.totalOrders}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{restaurant.monthlyRevenue} ₺</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-pink-600 hover:text-pink-900">Düzenle</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


                {activeTab === 'users' && (
                    <div className="space-y-6">

                        <div className="flex justify-between items-center">
                            <input
                                type="text"
                                placeholder="Kullanıcı ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 rounded-md border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>


                        <div className="bg-white shadow overflow-hidden rounded-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kullanıcı
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            E-posta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tip
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sipariş Sayısı
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kayıt Tarihi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {SAMPLE_USERS.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={user.type}
                                                    onChange={(e) => handleUserTypeChange(user.id, e.target.value)}
                                                    className="text-sm rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                                                >
                                                    <option value="Müşteri">Müşteri</option>
                                                    <option value="Restoran">Restoran</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.orders}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{user.joinDate}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-pink-600 hover:text-pink-900 mr-4">Düzenle</button>
                                                <button className="text-red-600 hover:text-red-900">Sil</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
