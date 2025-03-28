'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { menuItemService } from '../services/menuItemService';
import { orderService } from '../services/orderService';
import Image from 'next/image';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MdMenuBook } from 'react-icons/md';


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

export default function RestaurantPanel() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showAddItemForm, setShowAddItemForm] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalMenuItems: 0,
        activeOrders: 0,
        completedOrders: 0,
        dailyRevenue: 0
    });
    const [newMenuItem, setNewMenuItem] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        isAvailable: true
    });
    const [success, setSuccess] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        category: ''
    });
    const [isTestMode, setIsTestMode] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'restaurant')) {
            router.push('/auth/login');
        }


        if (user && user.restaurantId) {
            console.log("Dashboard - user.restaurantId localStorage'a kaydediliyor:", user.restaurantId);
            localStorage.setItem('restaurantId', user.restaurantId);
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            console.log('Restaurant Panel - Kullanıcı bilgisi:', user);


            if (user.restaurantId) {
                localStorage.setItem('restaurantId', user.restaurantId);
                console.log('Restaurant Panel - user.restaurantId localStorage\'a kaydedildi:', user.restaurantId);
            } else if (user.id) {
                localStorage.setItem('restaurantId', user.id);
                console.log('Restaurant Panel - user.id localStorage\'a kaydedildi:', user.id);
            }


            if (user.name) {
                localStorage.setItem('restaurantName', user.name);
            }


            checkApiConnection();


            loadInitialData();


            const orderInterval = setInterval(() => {
                console.log('Restaurant Panel - Siparişler sessizce yenileniyor...');
                refreshOrdersSilently();
            }, 10000);


            return () => clearInterval(orderInterval);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'menu') {
            loadMenuItems();
        } else if (activeTab === 'orders') {
            loadOrders();
        } else if (activeTab === 'dashboard') {
            loadMenuItems();
            loadOrders();
        }
    }, [activeTab]);


    const checkApiConnection = async () => {
        try {

            const response = await fetch('http://localhost:3000/health', {
                method: 'GET',
                cache: 'no-store',
                signal: new AbortController().signal,
                timeout: 3000
            });
            setIsTestMode(false);
            console.log('API bağlantısı başarılı, gerçek mod aktif');
        } catch (error) {
            console.log('API bağlantısı yok, test modu aktif:', error);
            setIsTestMode(true);
        }
    };


    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            await loadMenuItems();
            await loadOrders();
        } catch (error) {
            console.error("İlk veri yüklemesi sırasında hata:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const refreshOrdersSilently = async () => {
        try {
            console.log('Restaurant Panel - Siparişler arkaplanda yenileniyor...');
            const data = await orderService.getRestaurantOrders();

            // Test verileri kullanılıyor mu kontrol et
            if (data.some(order => order.isTestData)) {
                setIsTestMode(true);
            }


            const sortedOrders = data.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setOrders(sortedOrders);


            calculateDashboardStats();
        } catch (err) {
            console.error('Siparişleri sessizce yenilerken hata:', err);

        }
    };

    const loadMenuItems = async () => {
        try {
            console.log("loadMenuItems çalıştırılıyor - DASHBOARD SAYFASI");
            setIsLoading(true);


            let restaurantId = null;


            if (user && user.restaurantId) {
                restaurantId = user.restaurantId;
                console.log("Dashboard - restaurantId user nesnesinden alındı:", restaurantId);
            }

            else if (user && user.id) {
                restaurantId = user.id;
                console.log("Dashboard - restaurantId user.id'den alındı:", restaurantId);
            }

            else {
                restaurantId = localStorage.getItem('restaurantId');
                console.log("Dashboard - restaurantId localStorage'dan alındı:", restaurantId);
            }


            if (!restaurantId) {
                console.warn("Dashboard - restaurantId hiçbir kaynaktan bulunamadı, boş menü listesi kullanılıyor");
                setMenuItems([]);
                setError(null);
                setIsLoading(false);
                return;
            }


            if (typeof window !== 'undefined') {
                localStorage.setItem('restaurantId', restaurantId);
                console.log("Dashboard - restaurantId localStorage'a kaydedildi:", restaurantId);


                if (user?.name) {
                    localStorage.setItem('restaurantName', user.name);
                    console.log("Dashboard - restaurantName localStorage'a kaydedildi:", user.name);
                }
            }

            try {
                console.log(`Dashboard - Menü öğeleri restaurantId=${restaurantId} için getiriliyor`);


                const lastUpdatedStr = localStorage.getItem('menuItemsLastUpdated');
                let useFreshData = true;

                if (lastUpdatedStr) {
                    const lastUpdated = new Date(lastUpdatedStr);
                    const now = new Date();
                    const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);


                    if (hoursDiff > 2) {
                        console.log('Önbellek 2 saatten eski, temizleniyor...');
                        await menuItemService.clearCache();
                        useFreshData = true;
                    }
                }

                const items = await menuItemService.getMenuItems(restaurantId);


                if (items && items.some(item => item.isTestData)) {
                    setIsTestMode(true);
                }

                if (!items || !Array.isArray(items)) {
                    console.warn("Dashboard - Veri alındı ama dizi değil:", items);
                    setMenuItems([]);


                    console.log("Geçersiz veri, önbelleği temizleyip yeniden deneniyor...");
                    await menuItemService.clearCache();


                    const retryItems = await menuItemService.getMenuItems(restaurantId);
                    if (Array.isArray(retryItems)) {
                        console.log(`Dashboard - Yeniden deneme başarılı, ${retryItems.length} menü öğesi yüklendi`);
                        setMenuItems(retryItems);
                    } else {
                        console.error("Dashboard - Yeniden deneme başarısız, boş liste kullanılıyor");
                        setMenuItems([]);
                    }
                } else {
                    console.log(`Dashboard - Toplam ${items.length} menü öğesi yüklendi`);
                    setMenuItems(items);
                }

                setError(null);
            } catch (err) {
                console.error("Dashboard - Menü yüklenirken hata:", err);


                console.log("API hatası oluştu, önbelleği temizleniyor...");
                await menuItemService.clearCache();

                setError('Menü yüklenirken bir hata oluştu');
                setMenuItems([]);
            }
        } catch (err) {
            console.error('Dashboard - Beklenmeyen hata:', err);
            setError('Menü yüklenirken beklenmeyen bir hata oluştu');
            setMenuItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            console.log('Restaurant Panel - Siparişler yükleniyor...');
            setIsLoading(true);
            const data = await orderService.getRestaurantOrders();
            console.log('Restaurant Panel - Yüklenen siparişler:', data);

            // Test verileri kullanılıyor mu kontrol et
            if (data.some(order => order.isTestData)) {
                setIsTestMode(true);
            }


            const sortedOrders = data.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setOrders(sortedOrders);
            setError(null);


            calculateDashboardStats();
        } catch (err) {
            console.error('Restaurant Panel - Siparişler yüklenirken hata:', err);
            setError('Siparişler yüklenirken bir hata oluştu');
        } finally {
            setIsLoading(false);
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

    const handleAddMenuItem = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {

            await menuItemService.createMenuItem(newMenuItem);
            await loadMenuItems();
            setShowAddItemForm(false);
            setNewMenuItem({
                name: '',
                price: '',
                category: '',
                description: '',
                isAvailable: true
            });
            setSuccess('Menü öğesi başarıyla eklendi');
        } catch (error) {
            console.error('Menü öğesi eklenirken hata:', error);
            setError('Menü öğesi eklenirken bir hata oluştu');
        }
    };

    const handleToggleAvailability = async (id) => {
        try {

            const item = menuItems.find(item => item.id === id);
            if (item) {
                const updatedItem = { ...item, isAvailable: !item.isAvailable };
                await menuItemService.updateMenuItem(id, updatedItem);
            }
            await loadMenuItems();
            setSuccess('Menü öğesi durumu güncellendi');
        } catch (error) {
            console.error('Menü öğesi durumu güncellenirken hata:', error);
            setError('Menü öğesi durumu güncellenirken bir hata oluştu');
        }
    };

    const handleDeleteMenuItem = async (id) => {
        if (window.confirm('Bu menü öğesini silmek istediğinizden emin misiniz?')) {
            try {

                await menuItemService.deleteMenuItem(id, user?.restaurantId);
                await loadMenuItems();
                setSuccess('Menü öğesi başarıyla silindi');
            } catch (error) {
                console.error('Menü öğesi silinirken hata:', error);
                setError('Menü öğesi silinirken bir hata oluştu');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {

                await menuItemService.updateMenuItem(editingItem.id, formData);
            } else {

                await menuItemService.createMenuItem(formData);
            }
            setFormData({ name: '', description: '', price: '', image: '', category: '' });
            setEditingItem(null);
            loadMenuItems();
        } catch (err) {
            console.error('Menü öğesi kaydedilirken hata:', err);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: item.category
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                await menuItemService.deleteMenuItem(id, user?.restaurantId);
                loadMenuItems();
            } catch (err) {
                console.error('Ürün silinirken hata:', err);
            }
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    const calculateDashboardStats = () => {
        console.log("calculateDashboardStats çağrıldı");
        console.log("-------------------------");
        console.log("MENÜ ÖĞESİ DETAYLARI:");
        console.log("-------------------------");


        if (!Array.isArray(orders)) {
            console.warn("Sipariş verisi dizi değil, boş dizi kullanılıyor");
            setDashboardStats({
                totalMenuItems: Array.isArray(menuItems) ? menuItems.length : 0,
                activeOrders: 0,
                completedOrders: 0,
                dailyRevenue: 0
            });
            return;
        }


        if (!Array.isArray(menuItems)) {
            console.warn("Menü öğeleri verisi dizi değil, boş dizi kullanılıyor");

            setMenuItems([]);
        } else {
            console.log(`Dashboard - Menü öğeleri sayısı: ${menuItems.length}`);
            if (menuItems.length > 0) {
                console.log("Menü öğesi örnekleri:");
                menuItems.slice(0, Math.min(3, menuItems.length)).forEach((item, index) => {
                    console.log(`Dashboard - Menü öğesi ${index + 1}:`, JSON.stringify(item));
                });

                if (menuItems.length > 3) {
                    console.log(`... ve ${menuItems.length - 3} adet daha menü öğesi`);
                }
            } else {
                console.warn("DİKKAT: Menü öğesi bulunamadı, liste boş!");
            }
        }


        try {
            if (typeof window !== 'undefined') {
                const rawStoredItems = localStorage.getItem('menuItems');
                if (rawStoredItems) {
                    const storedItems = JSON.parse(rawStoredItems);
                    console.log(`localStorage kontrolü - 'menuItems' anahtarında ${Array.isArray(storedItems) ? storedItems.length : 'geçersiz'} öğe var`);

                    if (Array.isArray(storedItems) && storedItems.length !== menuItems.length) {
                        console.warn(`UYUŞMAZLIK: localStorage'da ${storedItems.length} öğe varken state'de ${menuItems.length} öğe var!`);
                    }
                } else {
                    console.warn("localStorage kontrolü - 'menuItems' anahtarı bulunamadı!");
                }
            }
        } catch (e) {
            console.error("localStorage kontrolü sırasında hata:", e);
        }

        console.log("-------------------------");


        const activeOrders = orders.filter(order =>
            order.status === 'pending' || order.status === 'preparing' || order.status === 'ready'
        ).length;


        const completedOrders = orders.filter(order =>
            order.status === 'delivered'
        ).length;


        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyRevenue = orders
            .filter(order => {
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime() && order.status === 'delivered';
            })
            .reduce((total, order) => total + parseFloat(order.totalAmount || 0), 0);


        const totalMenuItems = Array.isArray(menuItems) ? menuItems.length : 0;

        console.log("Dashboard istatistikleri:");
        console.log("- Toplam menü öğesi:", totalMenuItems);
        console.log("- Aktif siparişler:", activeOrders);
        console.log("- Tamamlanan siparişler:", completedOrders);
        console.log("- Günlük gelir:", dailyRevenue.toFixed(2), "₺");
        console.log("-------------------------");


        setDashboardStats({
            totalMenuItems,
            activeOrders,
            completedOrders,
            dailyRevenue
        });
    };

    useEffect(() => {
        calculateDashboardStats();
    }, [orders, menuItems]);

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
        <div className="min-h-screen bg-gray-100">
            {isTestMode && (
                <div className="fixed top-16 inset-x-0 bg-yellow-50 border-b border-yellow-200 text-center py-3 px-4 z-50 shadow-md">
                    <div className="flex items-center justify-center gap-2">
                        <svg className="h-6 w-6 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-base font-medium text-yellow-800">
                            <strong>Test Modu</strong> - API bağlantısı yok, veriler yerel depolamada saklanıyor. Gerçek restoran işlemleri değil.
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-36">
                <div className="px-4 py-6 sm:px-0">

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Restaurant Panel</h1>
                        <p className="mt-2 text-lg text-gray-600">Hoş geldiniz, {user?.name}</p>
                    </div>

                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`${activeTab === 'dashboard'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => router.push('/restaurant-panel/menu')}
                                className={`${activeTab === 'menu'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Menü
                            </button>
                            <button
                                onClick={() => router.push('/restaurant-panel/orders')}
                                className={`${activeTab === 'orders'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Siparişler
                            </button>
                            <button
                                onClick={() => router.push('/restaurant-panel/settings')}
                                className={`${activeTab === 'settings'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Ayarlar
                            </button>
                        </nav>
                    </div>


                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">Dashboard Bilgileri</h2>
                                <button
                                    onClick={() => {
                                        try {
                                            menuItemService.resetAllData();
                                            setSuccess('Tüm veriler başarıyla temizlendi. Sayfa yenileniyor...');
                                            setTimeout(() => {
                                                window.location.reload();
                                            }, 1500);
                                        } catch (err) {
                                            console.error('Veriler temizlenirken hata:', err);
                                            setError('Veriler temizlenirken bir hata oluştu.');
                                        }
                                    }}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                    title="Eğer sayfa hatalı veri gösteriyorsa tüm verileri temizleyin"
                                >
                                    Verileri Sıfırla
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-red-600 rounded-md p-3">
                                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-700 truncate">
                                                        Toplam Menü Öğesi
                                                    </dt>
                                                    <dd className="flex items-baseline">
                                                        <div className="text-2xl font-semibold text-gray-900">
                                                            {dashboardStats.totalMenuItems}
                                                        </div>
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-700 truncate">
                                                        Aktif Siparişler
                                                    </dt>
                                                    <dd className="flex items-baseline">
                                                        <div className="text-2xl font-semibold text-gray-900">
                                                            {dashboardStats.activeOrders}
                                                        </div>
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-700 truncate">
                                                        Tamamlanan Siparişler
                                                    </dt>
                                                    <dd className="flex items-baseline">
                                                        <div className="text-2xl font-semibold text-gray-900">
                                                            {dashboardStats.completedOrders}
                                                        </div>
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-700 truncate">
                                                        Günlük Gelir
                                                    </dt>
                                                    <dd className="flex items-baseline">
                                                        <div className="text-2xl font-semibold text-gray-900">
                                                            {dashboardStats.dailyRevenue.toFixed(2)} ₺
                                                        </div>
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Son Siparişler</h3>
                                    <div className="mt-5">
                                        <div className="flex flex-col">
                                            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Sipariş No
                                                                    </th>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Müşteri
                                                                    </th>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Tutar
                                                                    </th>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Durum
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {orders.slice(0, 5).map((order) => (
                                                                    <tr key={order.id}>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                            #{order.id}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {order.customerName}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {parseFloat(order.totalAmount).toFixed(2)} ₺
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                                                                        'bg-gray-100 text-gray-800'
                                                                                }`}>
                                                                                {OrderStatus[order.status]}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 