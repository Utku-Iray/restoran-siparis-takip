'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { checkApiHealth } from '@/app/services/axiosConfig';

const SAMPLE_USERS = [
    {
        id: 1,
        email: "restaurant1@example.com",
        password: "password",
        name: "Lezzet Dünyası",
        role: "restaurant",
        restaurantId: 1
    },
    {
        id: 2,
        email: "restaurant2@example.com",
        password: "password",
        name: "Pizza Express",
        role: "restaurant",
        restaurantId: 2
    },
    {
        id: 3,
        email: "restaurant3@example.com",
        password: "password",
        name: "Sushi Master",
        role: "restaurant",
        restaurantId: 3
    },
    // Normal kullanıcı
    {
        id: 4,
        email: "user@example.com",
        password: "password",
        name: "Örnek Müşteri",
        role: "user"
    },
    // Admin kullanıcı
    {
        id: 5,
        email: "admin@example.com",
        password: "password",
        name: "Site Yöneticisi",
        role: "admin"
    }
];

// Restoranlar için veri
const SAMPLE_RESTAURANTS = [
    {
        id: 1,
        name: "Lezzet Dünyası",
        owner: "Lezzet Dünyası",
        status: "Aktif",
        rating: 4.5,
        totalOrders: 1250,
        monthlyRevenue: 45000
    },
    {
        id: 2,
        name: "Pizza Express",
        owner: "Pizza Express",
        status: "Aktif",
        rating: 4.2,
        totalOrders: 850,
        monthlyRevenue: 32000
    },
    {
        id: 3,
        name: "Sushi Master",
        owner: "Sushi Master",
        status: "Aktif",
        rating: 4.8,
        totalOrders: 780,
        monthlyRevenue: 38000
    }
];

const SAMPLE_STATS = {
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 25000,
    totalRevenue: 750000,
    activeOrders: 120,
    monthlyGrowth: 15
};

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [isApiConnected, setIsApiConnected] = useState(false);
    const [deletedRestaurants, setDeletedRestaurants] = useState([]);
    const [showDeleteMessage, setShowDeleteMessage] = useState(false);
    const [deleteMessageText, setDeleteMessageText] = useState('');

    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);

                const isConnected = await checkApiHealth();
                setIsApiConnected(isConnected);

                if (isConnected) {
                    try {
                        const [restaurantsRes, usersRes, statsRes] = await Promise.all([
                            axios.get('http://localhost:3001/admin/restaurants'),
                            axios.get('http://localhost:3001/admin/users'),
                            axios.get('http://localhost:3001/admin/stats')
                        ]);

                        setRestaurants(restaurantsRes.data);
                        setUsers(usersRes.data);
                        setStats(statsRes.data);

                        console.log('API verilerini başarıyla aldım.');
                    } catch (apiError) {
                        console.warn('API verileri alınamadı, örnek veriler kullanılıyor:', apiError);


                        const formattedUsers = SAMPLE_USERS.map(user => ({
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            type: user.role === 'user' ? 'Müşteri' :
                                user.role === 'restaurant' ? 'Restoran' :
                                    user.role === 'admin' ? 'Admin' : user.role,
                            orders: user.role === 'user' ? 25 : 0,
                            joinDate: "2024-03-15"
                        }));

                        setUsers(formattedUsers);
                        setRestaurants(SAMPLE_RESTAURANTS);

                        const customerCount = SAMPLE_USERS.filter(user => user.role === 'user').length;
                        const restaurantCount = SAMPLE_USERS.filter(user => user.role === 'restaurant').length;

                        setStats({
                            ...SAMPLE_STATS,
                            totalUsers: customerCount,
                            totalRestaurants: restaurantCount
                        });
                    }
                } else {
                    console.log('API bağlantısı yok, örnek veriler kullanılıyor.');

                    const formattedUsers = SAMPLE_USERS.map(user => ({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        type: user.role === 'user' ? 'Müşteri' :
                            user.role === 'restaurant' ? 'Restoran' :
                                user.role === 'admin' ? 'Admin' : user.role,
                        orders: user.role === 'user' ? 25 : 0,
                        joinDate: "2024-03-15"
                    }));

                    setUsers(formattedUsers);
                    setRestaurants(SAMPLE_RESTAURANTS);

                    const customerCount = SAMPLE_USERS.filter(user => user.role === 'user').length;
                    const restaurantCount = SAMPLE_USERS.filter(user => user.role === 'restaurant').length;

                    setStats({
                        ...SAMPLE_STATS,
                        totalUsers: customerCount,
                        totalRestaurants: restaurantCount
                    });
                }
            } catch (error) {
                console.error('Veri başlatılırken hata:', error);

                const formattedUsers = SAMPLE_USERS.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    type: user.role === 'user' ? 'Müşteri' :
                        user.role === 'restaurant' ? 'Restoran' :
                            user.role === 'admin' ? 'Admin' : user.role,
                    orders: user.role === 'user' ? 25 : 0,
                    joinDate: "2024-03-15"
                }));

                setUsers(formattedUsers);
                setRestaurants(SAMPLE_RESTAURANTS);

                const customerCount = SAMPLE_USERS.filter(user => user.role === 'user').length;
                const restaurantCount = SAMPLE_USERS.filter(user => user.role === 'restaurant').length;

                setStats({
                    ...SAMPLE_STATS,
                    totalUsers: customerCount,
                    totalRestaurants: restaurantCount
                });
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    const filteredRestaurants = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (restaurantId, newStatus) => {
        try {
            if (isApiConnected) {
                await axios.patch(`http://localhost:3001/admin/restaurants/${restaurantId}`, {
                    status: newStatus
                });
                console.log(`Restoran ${restaurantId} durumu ${newStatus} olarak güncellendi`);

                const response = await axios.get('http://localhost:3001/admin/restaurants');
                setRestaurants(response.data);
            } else {
                const updatedRestaurants = restaurants.map(restaurant =>
                    restaurant.id === restaurantId
                        ? { ...restaurant, status: newStatus }
                        : restaurant
                );
                setRestaurants(updatedRestaurants);
                console.log(`Restoran ${restaurantId} durumu ${newStatus} olarak güncellendi (yerel)`);
            }
        } catch (error) {
            console.error(`Restoran durumu güncellenirken hata:`, error);
        }
    };

    const deleteRestaurant = (restaurantId) => {
        const restaurantToDelete = restaurants.find(restaurant => restaurant.id === restaurantId);
        if (!restaurantToDelete) return;

        setDeletedRestaurants([...deletedRestaurants, restaurantToDelete]);

        const updatedRestaurants = restaurants.filter(restaurant => restaurant.id !== restaurantId);
        setRestaurants(updatedRestaurants);

        setDeleteMessageText(`${restaurantToDelete.name} geçici olarak silindi. Sayfayı yenilediğinizde geri gelecektir.`);
        setShowDeleteMessage(true);

        setTimeout(() => {
            setShowDeleteMessage(false);
        }, 5000);
    };

    const handleUserTypeChange = async (userId, newType) => {
        try {
            if (isApiConnected) {
                await axios.patch(`http://localhost:3001/admin/users/${userId}`, {
                    type: newType
                });
                console.log(`Kullanıcı ${userId} tipi ${newType} olarak güncellendi`);

                const response = await axios.get('http://localhost:3001/admin/users');
                setUsers(response.data);
            } else {
                const updatedUsers = users.map(user =>
                    user.id === userId
                        ? { ...user, type: newType }
                        : user
                );
                setUsers(updatedUsers);
                console.log(`Kullanıcı ${userId} tipi ${newType} olarak güncellendi (yerel)`);
            }
        } catch (error) {
            console.error(`Kullanıcı tipi güncellenirken hata:`, error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-36">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!isApiConnected && (
                    <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md shadow mb-4 font-medium">
                        Test Verileri - API Bağlantısı Yok
                    </div>
                )}

                <div className="mb-8 flex justify-between items-center">
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
                                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Toplam Restoran</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalRestaurants}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Toplam Sipariş</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Toplam Gelir</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalRevenue} ₺</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Aktif Siparişler</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeOrders}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">Aylık Büyüme</h3>
                                <p className="mt-2 text-3xl font-bold text-green-600">%{stats.monthlyGrowth}</p>
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
                        </div>

                        {showDeleteMessage && (
                            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md shadow mb-4">
                                {deleteMessageText}
                            </div>
                        )}

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
                                    {filteredRestaurants.map((restaurant) => (
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
                                                <button
                                                    onClick={() => deleteRestaurant(restaurant.id)}
                                                    className="text-red-600 hover:text-red-900">
                                                    Sil
                                                </button>
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
                                    {filteredUsers.map((user) => (
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
