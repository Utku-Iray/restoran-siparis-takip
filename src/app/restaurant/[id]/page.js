'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { StarIcon, MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/solid';
import { restaurantService } from '@/app/services/restaurantService';

export default function RestaurantPage() {
    const params = useParams();
    const router = useRouter();
    const restaurantId = params.id;
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [activeTab, setActiveTab] = useState('menu');
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState(['Tümü']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (restaurantId) {
            loadRestaurantDetails();
        }
    }, [restaurantId]);

    const loadRestaurantDetails = async () => {
        try {
            setLoading(true);
            console.log(`Restoran detayları yükleniyor. ID: ${restaurantId}`);

            try {
                const restaurantData = await restaurantService.getRestaurantById(restaurantId);
                console.log("Restoran detayları başarıyla yüklendi:", restaurantData);

                setRestaurant({
                    ...restaurantData,
                    image: restaurantData.image || restaurantData.imageUrl || "/image/default-restaurant.jpg",
                });

                if (typeof window !== 'undefined') {
                    localStorage.setItem('restaurantId', restaurantId);
                    localStorage.setItem('restaurantName', restaurantData.name);
                    console.log("Restoran ID'si localStorage'a kaydedildi:", restaurantId);
                }

                try {
                    const menuData = await restaurantService.getRestaurantMenu(restaurantId);
                    console.log("Menü başarıyla yüklendi, ürün sayısı:", menuData.length);
                    setMenuItems(menuData);

                    if (menuData && menuData.length > 0) {
                        const uniqueCategories = [...new Set(menuData.map(item => item.category))];
                        setCategories(['Tümü', ...uniqueCategories]);
                    }
                } catch (menuError) {
                    console.warn('Menü yüklenirken hata:', menuError);

                    setMenuItems([]);
                    setCategories(['Tümü']);

                    setError(null);
                }
            } catch (apiError) {
                console.error('Restoran detayları yüklenirken hata:', apiError);
                setError('Restoran bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
            }

        } catch (err) {
            console.error('Restoran detayları yüklenirken kritik hata:', err);
            setError('Restoran detayları yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        } finally {
            setLoading(false);
        }
    };

    const filteredMenu = selectedCategory === 'Tümü'
        ? menuItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : menuItems.filter(item =>
            item.category === selectedCategory &&
            (
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );

    const handleAddToCart = (item) => {
        if (!user) {

            const returnUrl = `/restaurant/${restaurantId}`;
            localStorage.setItem('returnUrl', returnUrl);
            router.push('/auth/login');
            return;
        }

        addToCart({ ...item, restaurantId: Number(restaurantId) });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
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
        <div className="min-h-screen bg-gray-50 pt-32">
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
                <div className="border-b border-gray-200 mb-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'menu'
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Menü
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Değerlendirmeler
                        </button>
                    </nav>
                </div>

                {activeTab === 'menu' ? (
                    <>
                        <div className="mb-8">
                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Menüde ara..."
                                        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex space-x-4 overflow-x-auto pb-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === category
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredMenu.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500">
                                    {searchTerm
                                        ? `"${searchTerm}" için menüde sonuç bulunamadı.`
                                        : `${selectedCategory} kategorisinde henüz ürün bulunmuyor.`
                                    }
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="mt-4 text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Aramayı temizle
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMenu.map((item) => (
                                    <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="h-48 w-full bg-gray-200">
                                            <img
                                                src={item.image || "/image/default-restaurant.jpg"}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = "/image/default-restaurant.jpg";
                                                }}
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                            <p className="mt-1 text-sm text-gray-500">{item.description || "Açıklama bulunmuyor"}</p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-lg font-medium text-gray-900">{item.price} ₺</span>
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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