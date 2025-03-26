'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { StarIcon, MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/solid';
import { restaurantService } from '@/app/services/restaurantService';

// Geçici örnek veriler
const SAMPLE_RESTAURANTS = [
    {
        id: 1,
        name: "Lezzet Dünyası",
        description: "Geleneksel Türk mutfağının en seçkin lezzetleri",
        rating: 4.5,
        totalReviews: 128,
        address: "Atatürk Cad. No: 123, İstanbul",
        phone: "0212 345 67 89",
        workingHours: "10:00 - 22:00",
        reviews: [
            {
                id: 1,
                user: "Mehmet Y.",
                rating: 5,
                comment: "Harika lezzetler, hızlı servis.",
                date: "2024-03-15"
            },
            {
                id: 2,
                user: "Ayşe K.",
                rating: 4,
                comment: "Lezzetli yemekler ama teslimat biraz geç oldu.",
                date: "2024-03-14"
            }
        ]
    },
    {
        id: 2,
        name: "Pizza Express",
        description: "İtalyan mutfağının en sevilen tatları",
        rating: 4.2,
        totalReviews: 96,
        address: "İstiklal Cad. No: 456, İstanbul",
        phone: "0212 987 65 43",
        workingHours: "11:00 - 23:00",
        reviews: [
            {
                id: 1,
                user: "Ali S.",
                rating: 4,
                comment: "Pizzalar çok lezzetli, özellikle karışık pizza favorim.",
                date: "2024-03-18"
            }
        ]
    },
    {
        id: 3,
        name: "Sushi Master",
        description: "Uzak Doğu'nun eşsiz tatları",
        rating: 4.8,
        totalReviews: 65,
        address: "Bağdat Cad. No: 789, İstanbul",
        phone: "0216 345 67 89",
        workingHours: "12:00 - 22:00",
        reviews: [
            {
                id: 1,
                user: "Zeynep A.",
                rating: 5,
                comment: "İstanbul'da yediğim en iyi sushi.",
                date: "2024-03-20"
            }
        ]
    }
];

const SAMPLE_MENU_ITEMS = {
    1: [
        {
            id: 101,
            name: "Adana Kebap",
            description: "Özel baharatlarla hazırlanmış el yapımı kebap",
            price: 120,
            image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGtlYmFifGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
            category: "Ana Yemekler",
            restaurantId: 1
        },
        {
            id: 102,
            name: "Mercimek Çorbası",
            description: "Geleneksel tarif ile hazırlanmış mercimek çorbası",
            price: 45,
            image: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGVudGlsJTIwc291cHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
            category: "Çorbalar",
            restaurantId: 1
        },
        {
            id: 103,
            name: "Ayran",
            description: "Ev yapımı ayran",
            price: 15,
            image: "https://images.unsplash.com/photo-1629203432180-71e9b18d855a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8YXlyYW58ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
            category: "İçecekler",
            restaurantId: 1
        }
    ],
    2: [
        {
            id: 201,
            name: "Margarita Pizza",
            description: "Domates, mozzarella ve fesleğen ile",
            price: 90,
            image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8bWFyZ2FyaXRhJTIwcGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
            category: "Pizzalar",
            restaurantId: 2
        },
        {
            id: 202,
            name: "Spagetti Bolonez",
            description: "Özel soslu spagetti",
            price: 75,
            image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8cGFzdGElMjB3aXRoJTIwbWVhdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
            category: "Makarnalar",
            restaurantId: 2
        },
        {
            id: 203,
            name: "Tiramisu",
            description: "Ev yapımı Tiramisu",
            price: 60,
            image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8dGlyYW1pc3V8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
            category: "Tatlılar",
            restaurantId: 2
        }
    ],
    3: [
        {
            id: 301,
            name: "Karışık Sushi Tabağı",
            description: "8 adet farklı çeşitlerden oluşan tabak",
            price: 180,
            image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8c3VzaGl8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
            category: "Sushi",
            restaurantId: 3
        },
        {
            id: 302,
            name: "Miso Çorbası",
            description: "Geleneksel Japon çorbası",
            price: 45,
            image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8bWlzbyUyMHNvdXB8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
            category: "Çorbalar",
            restaurantId: 3
        },
        {
            id: 303,
            name: "Yeşil Çay",
            description: "Taze demlenen geleneksel yeşil çay",
            price: 20,
            image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8Z3JlZW4lMjB0ZWF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
            category: "İçecekler",
            restaurantId: 3
        }
    ]
};

export default function RestaurantPage() {
    const params = useParams();
    const restaurantId = params.id;
    const { addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [activeTab, setActiveTab] = useState('menu');
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState(['Tümü']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (restaurantId) {
            loadRestaurantDetails();
        }
    }, [restaurantId]);

    const loadRestaurantDetails = async () => {
        try {
            setLoading(true);

            // Backend'den veri çekmeyi dene
            try {
                // Restoran detaylarını yükle
                const restaurantData = await restaurantService.getRestaurantById(restaurantId);
                setRestaurant(restaurantData);

                // Restoran menüsünü yükle
                const menuData = await restaurantService.getRestaurantMenu(restaurantId);
                setMenuItems(menuData);

                // Kategorileri çıkar
                const uniqueCategories = ['Tümü', ...new Set(menuData.map(item => item.category))];
                setCategories(uniqueCategories);

                // Restoran bilgilerini localStorage'a kaydet (sipariş için)
                localStorage.setItem('restaurantId', restaurantId);
                localStorage.setItem('restaurantName', restaurantData.name || 'Restoran');

                console.log('Restoran detayları başarıyla yüklendi:', restaurantData);
                console.log('Menü başarıyla yüklendi:', menuData);
                console.log('Seçilen restoran ID\'si localStorage\'a kaydedildi:', restaurantId);
            } catch (apiError) {
                console.warn('API\'den veriler yüklenemedi, örnek veriler kullanılıyor:', apiError);

                // API çalışmıyorsa örnek verileri kullan
                const sampleRestaurant = SAMPLE_RESTAURANTS.find(r => r.id === Number(restaurantId));
                const sampleMenu = SAMPLE_MENU_ITEMS[restaurantId] || [];

                if (!sampleRestaurant) {
                    throw new Error('Restoran bulunamadı');
                }

                setRestaurant(sampleRestaurant);
                setMenuItems(sampleMenu);

                // Kategorileri çıkar
                const uniqueCategories = ['Tümü', ...new Set(sampleMenu.map(item => item.category))];
                setCategories(uniqueCategories);

                // Restoran bilgilerini localStorage'a kaydet (örnek veriler için)
                localStorage.setItem('restaurantId', restaurantId);
                localStorage.setItem('restaurantName', sampleRestaurant.name || 'Restoran');

                console.log('Örnek verilerle restoran yüklendi. Seçilen restoran ID\'si localStorage\'a kaydedildi:', restaurantId);
            }

            setError(null);
        } catch (err) {
            console.error('Restoran detayları yüklenirken kritik hata:', err);
            setError('Restoran bilgileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        } finally {
            setLoading(false);
        }
    };

    // Menü filtreleme
    const filteredMenu = selectedCategory === 'Tümü'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Hata!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800">Restoran bulunamadı</h2>
                    <p className="mt-2 text-gray-600">Böyle bir restoran bulunmuyor veya kaldırılmış olabilir.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Restoran Başlık Bölümü */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                    <p className="mt-2 text-gray-600">{restaurant.description}</p>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <StarIcon className="h-5 w-5 text-yellow-400" />
                            <span className="ml-1 text-sm text-gray-600">
                                {restaurant.rating || "Yeni"} {restaurant.totalReviews ? `(${restaurant.totalReviews} değerlendirme)` : ''}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                            <span className="ml-1 text-sm text-gray-600">{restaurant.address || "Adres bilgisi bulunamadı"}</span>
                        </div>
                        <div className="flex items-center">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                            <span className="ml-1 text-sm text-gray-600">{restaurant.phone || "Telefon bilgisi bulunamadı"}</span>
                        </div>
                        <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                            <span className="ml-1 text-sm text-gray-600">{restaurant.workingHours || "Çalışma saatleri bilgisi bulunamadı"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Menü */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'menu'
                                ? 'border-pink-500 text-pink-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Menü
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                                ? 'border-pink-500 text-pink-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Değerlendirmeler
                        </button>
                    </nav>
                </div>

                {activeTab === 'menu' ? (
                    <>
                        {/* Kategori Filtreleme */}
                        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === category
                                        ? 'bg-pink-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Menü Listesi */}
                        {filteredMenu.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Bu kategoride henüz ürün bulunmuyor.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMenu.map((item) => (
                                    <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="h-48 w-full bg-gray-200">
                                            <img
                                                src={item.image || "https://via.placeholder.com/800x600?text=Ürün+Görseli"}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                            <p className="mt-1 text-sm text-gray-500">{item.description || "Açıklama bulunmuyor"}</p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-lg font-medium text-gray-900">{item.price} ₺</span>
                                                <button
                                                    onClick={() => addToCart({ ...item, restaurantId: Number(restaurantId) })}
                                                    className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                                                >
                                                    Sepete Ekle
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Değerlendirmeler</h2>
                        {restaurant.reviews && restaurant.reviews.length > 0 ? (
                            <div className="space-y-6">
                                {restaurant.reviews.map((review) => (
                                    <div key={review.id} className="border-b border-gray-100 pb-4">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{review.user}</span>
                                            <span className="text-sm text-gray-500">{review.date}</span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="mt-2 text-gray-600">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Henüz değerlendirme bulunmuyor.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 