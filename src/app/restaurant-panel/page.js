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

// Not: Menü öğeleri için örnek veri kaldırıldı, gerçek veriler API'den alınıyor

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

    useEffect(() => {
        if (!loading && (!user || user.role !== 'restaurant')) {
            router.push('/auth/login');
        }

        // Kullanıcı login olduğunda restaurantId'yi localStorage'a kaydet
        if (user && user.restaurantId) {
            console.log("Dashboard - user.restaurantId localStorage'a kaydediliyor:", user.restaurantId);
            localStorage.setItem('restaurantId', user.restaurantId);
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            console.log('Restaurant Panel - Kullanıcı bilgisi:', user);

            // RestaurantId hem user.id hem de user.restaurantId olabilir, ikisini de kaydet
            if (user.restaurantId) {
                localStorage.setItem('restaurantId', user.restaurantId);
                console.log('Restaurant Panel - user.restaurantId localStorage\'a kaydedildi:', user.restaurantId);
            } else if (user.id) {
                localStorage.setItem('restaurantId', user.id);
                console.log('Restaurant Panel - user.id localStorage\'a kaydedildi:', user.id);
            }

            // Her iki durumda da restaurant adını kaydet
            if (user.name) {
                localStorage.setItem('restaurantName', user.name);
            }

            loadMenuItems();
            loadOrders();

            // Her 10 saniyede bir siparişleri yenile
            const orderInterval = setInterval(() => {
                console.log('Restaurant Panel - Siparişler yenileniyor...');
                loadOrders();
            }, 10000);

            // Component unmount olduğunda interval'i temizle
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

    const loadMenuItems = async () => {
        try {
            console.log("loadMenuItems çalıştırılıyor - DASHBOARD SAYFASI");
            setIsLoading(true);

            // restaurantId için birden fazla kaynağı kontrol et
            let restaurantId = null;

            // 1. Kaynak: user nesnesinden
            if (user && user.restaurantId) {
                restaurantId = user.restaurantId;
                console.log("Dashboard - restaurantId user nesnesinden alındı:", restaurantId);
            }
            // 2. Kaynak: user.id değerinden (bazı API'ler bunu kullanıyor olabilir)
            else if (user && user.id) {
                restaurantId = user.id;
                console.log("Dashboard - restaurantId user.id'den alındı:", restaurantId);
            }
            // 3. Kaynak: localStorage'dan
            else {
                restaurantId = localStorage.getItem('restaurantId');
                console.log("Dashboard - restaurantId localStorage'dan alındı:", restaurantId);
            }

            // restaurantId hala bulunamadıysa
            if (!restaurantId) {
                console.warn("Dashboard - restaurantId hiçbir kaynaktan bulunamadı, boş menü listesi kullanılıyor");
                setMenuItems([]);
                setError(null);
                setIsLoading(false);
                return;
            }

            // API için her iki durumu da localStorage'a kaydet
            if (typeof window !== 'undefined') {
                localStorage.setItem('restaurantId', restaurantId);
                console.log("Dashboard - restaurantId localStorage'a kaydedildi:", restaurantId);

                // Eğer user.name değeri varsa, restoran adını da kaydet
                if (user?.name) {
                    localStorage.setItem('restaurantName', user.name);
                    console.log("Dashboard - restaurantName localStorage'a kaydedildi:", user.name);
                }
            }

            try {
                console.log(`Dashboard - Menü öğeleri restaurantId=${restaurantId} için getiriliyor`);

                // Önce önbellek yaşı kontrol edilir
                const lastUpdatedStr = localStorage.getItem('menuItemsLastUpdated');
                let useFreshData = true;

                if (lastUpdatedStr) {
                    const lastUpdated = new Date(lastUpdatedStr);
                    const now = new Date();
                    const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);

                    // 2 saatten eskiyse, önbelleği temizleyelim
                    if (hoursDiff > 2) {
                        console.log('Önbellek 2 saatten eski, temizleniyor...');
                        await menuItemService.clearCache();
                        useFreshData = true;
                    }
                }

                const items = await menuItemService.getMenuItems(restaurantId);

                if (!items || !Array.isArray(items)) {
                    console.warn("Dashboard - Veri alındı ama dizi değil:", items);
                    setMenuItems([]);

                    // Önbelleği temizle ve yeniden dene
                    console.log("Geçersiz veri, önbelleği temizleyip yeniden deneniyor...");
                    await menuItemService.clearCache();

                    // Yeniden bir deneme yap
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

                // Eğer API hatası ise, menüyü temizleyelim
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

            // Siparişleri tarihe göre sırala (en yeni en üstte)
            const sortedOrders = data.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setOrders(sortedOrders);
            setError(null);

            // Dashboard istatistiklerini güncelle
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
            loadOrders(); // Siparişleri yeniden yükle
        } catch (err) {
            console.error('Sipariş durumu güncellenirken hata:', err);
        }
    };

    const handleAddMenuItem = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // menuService yerine menuItemService kullanıyoruz
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
            // Bu fonksiyonu menuItemService'e eklemeliyiz, şimdilik silip koşullu yaptım
            // await menuService.toggleAvailability(id);
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
                // menuService yerine menuItemService kullanıyoruz
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
                // menuService yerine menuItemService kullanıyoruz
                await menuItemService.updateMenuItem(editingItem.id, formData);
            } else {
                // menuService yerine menuItemService kullanıyoruz
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

        // Siparişlerin geçerli olup olmadığını kontrol et
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

        // Menü öğelerinin geçerli olup olmadığını kontrol et
        if (!Array.isArray(menuItems)) {
            console.warn("Menü öğeleri verisi dizi değil, boş dizi kullanılıyor");
            // Menü öğeleri array değilse, boş array olarak ayarla
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

        // localStorage'dan menü öğeleri bilgisini direkt kontrol et
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

        // Aktif siparişleri hesapla
        const activeOrders = orders.filter(order =>
            order.status === 'pending' || order.status === 'preparing' || order.status === 'ready'
        ).length;

        // Tamamlanan siparişleri hesapla
        const completedOrders = orders.filter(order =>
            order.status === 'delivered'
        ).length;

        // Günlük geliri hesapla
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyRevenue = orders
            .filter(order => {
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime() && order.status === 'delivered';
            })
            .reduce((total, order) => total + parseFloat(order.totalAmount || 0), 0);

        // Toplam menü öğesi sayısını hesapla
        const totalMenuItems = Array.isArray(menuItems) ? menuItems.length : 0;

        console.log("Dashboard istatistikleri:");
        console.log("- Toplam menü öğesi:", totalMenuItems);
        console.log("- Aktif siparişler:", activeOrders);
        console.log("- Tamamlanan siparişler:", completedOrders);
        console.log("- Günlük gelir:", dailyRevenue.toFixed(2), "₺");
        console.log("-------------------------");

        // Dashboard istatistiklerini güncelle
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
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Üst Başlık */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Restaurant Panel</h1>
                        <p className="mt-2 text-lg text-gray-600">Hoş geldiniz, {user?.name}</p>
                    </div>

                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`${activeTab === 'dashboard'
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => router.push('/restaurant-panel/menu')}
                                className={`${activeTab === 'menu'
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Menü
                            </button>
                            <button
                                onClick={() => router.push('/restaurant-panel/orders')}
                                className={`${activeTab === 'orders'
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Siparişler
                            </button>
                            <button
                                onClick={() => router.push('/restaurant-panel/settings')}
                                className={`${activeTab === 'settings'
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Ayarlar
                            </button>
                        </nav>
                    </div>

                    {/* Dashboard İçeriği */}
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

                            {error && (
                                <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                    <p>{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
                                    <p>{success}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Toplam Menü Öğesi */}
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
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

                                {/* Aktif Siparişler */}
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

                                {/* Tamamlanan Siparişler */}
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

                                {/* Günlük Gelir */}
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

                            {/* Son Siparişler */}
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

                    {/* Menü Yönetimi İçeriği */}
                    {activeTab === 'menu' && (
                        <div>
                            {error && (
                                <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                    <p>{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
                                    <p>{success}</p>
                                </div>
                            )}

                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setShowAddItemForm(true)}
                                    className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                                >
                                    Yeni Ürün Ekle
                                </button>
                            </div>

                            {showAddItemForm && (
                                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium">Yeni Menü Öğesi Ekle</h3>
                                            <button
                                                onClick={() => setShowAddItemForm(false)}
                                                className="text-gray-400 hover:text-gray-500"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Ürün Adı
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Açıklama
                                                </label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                    rows="3"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Fiyat (₺)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Kategori
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Görsel URL
                                                </label>
                                                <input
                                                    type="url"
                                                    value={formData.image}
                                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-3">
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
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {menuItems.map((item) => (
                                    <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-500">{item.category}</p>
                                            </div>
                                            <p className="text-lg font-bold text-pink-600">{item.price} ₺</p>
                                        </div>
                                        <p className="text-gray-600 mb-4">{item.description}</p>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ayarlar İçeriği */}
                    {activeTab === 'settings' && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-2xl font-semibold mb-4">Ayarlar</h2>
                            <p className="text-gray-600">Yakında eklenecek...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 