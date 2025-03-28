'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { restaurantService } from '../services/restaurantService';



export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [usingApiData, setUsingApiData] = useState(false);

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        try {
            setLoading(true);
            console.log("Tüm restoranlar yükleniyor...");

            try {
                const data = await restaurantService.getAllRestaurants();
                console.log("Restoranlar başarıyla yüklendi:", data);

                if (data && data.length > 0) {
                    const formattedData = data.map(restaurant => ({
                        ...restaurant,
                        image: restaurant.imageUrl || '/image/default-restaurant.jpg', // imageUrl -> image uyumluluğu
                        cuisine: restaurant.cuisine || "Çeşitli Lezzetler",
                        address: restaurant.address || "Adres bilgisi bulunamadı",
                        deliveryTime: restaurant.deliveryTime || "30-45 dk",
                        minOrder: restaurant.minOrder || 0
                    }));

                    setRestaurants(formattedData);
                    setUsingApiData(localStorage.getItem('token') ? true : false);
                } else {
                    console.log("Hiç restoran bulunamadı");
                    setRestaurants([]);
                    setUsingApiData(false);
                }
            } catch (apiError) {
                console.warn('API\'den veriler yüklenemedi:', apiError);
                setRestaurants([]);
                setUsingApiData(false);
            }

            setError(null);
        } catch (err) {
            console.error('Restoranlar yüklenirken kritik hata:', err);
            setError('Restoranlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        } finally {
            setLoading(false);
        }
    };

    // Arama fonksiyonu
    const filteredRestaurants = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (restaurant.description && restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Hata!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Restoranlar</h1>

                    {/* Arama Alanı */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Restoran veya mutfak ara..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {usingApiData && restaurants.length > 0 && (
                    <div className="mb-6 text-center">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            API verisi kullanılıyor
                        </span>
                    </div>
                )}

                {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">
                            {searchTerm ? `"${searchTerm}" için sonuç bulunamadı.` : "Henüz hiç restoran bulunmuyor."}
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
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredRestaurants.map((restaurant) => (
                            <Link
                                key={restaurant.id}
                                href={`/restaurant/${restaurant.id}`}
                                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="relative h-48">
                                    <img
                                        src={restaurant.image || restaurant.imageUrl || "/image/default-restaurant.jpg"}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover rounded-t-lg"
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                                        <div className="flex items-center">
                                            <StarIcon className="h-5 w-5 text-yellow-400" />
                                            <span className="ml-1 text-sm text-gray-600">{restaurant.rating || "Yeni"}</span>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{restaurant.cuisine || restaurant.description || "Çeşitli Lezzetler"}</p>
                                    <div className="mt-4 flex items-center text-sm text-gray-500">
                                        <MapPinIcon className="h-4 w-4 mr-1" />
                                        <span>{restaurant.address || "Adres bilgisi bulunamadı"}</span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Minimum Sipariş: {restaurant.minOrder || "0"} ₺</span>
                                        <span className="text-gray-500">{restaurant.deliveryTime || "30-45 dk"}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 