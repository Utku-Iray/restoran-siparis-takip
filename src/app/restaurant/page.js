'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { restaurantService } from '../services/restaurantService';

// Geçici örnek veriler
const SAMPLE_RESTAURANTS = [
    {
        id: 1,
        name: "Lezzet Dünyası",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
        rating: 4.5,
        cuisine: "Türk Mutfağı",
        address: "Atatürk Cad. No:123, İstanbul",
        deliveryTime: "30-45 dk",
        minOrder: 50
    },
    {
        id: 2,
        name: "Pizza Express",
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
        rating: 4.2,
        cuisine: "İtalyan Mutfağı",
        address: "İstiklal Cad. No:456, İstanbul",
        deliveryTime: "25-40 dk",
        minOrder: 60
    },
    {
        id: 3,
        name: "Sushi Master",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
        rating: 4.8,
        cuisine: "Japon Mutfağı",
        address: "Bağdat Cad. No:789, İstanbul",
        deliveryTime: "35-50 dk",
        minOrder: 100
    }
];

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        try {
            setLoading(true);

            // Backend'den veri çekmeyi dene
            try {
                const data = await restaurantService.getAllRestaurants();
                setRestaurants(data);
                console.log('Restoranlar başarıyla yüklendi:', data);
            } catch (apiError) {
                console.warn('API\'den veriler yüklenemedi, örnek veriler kullanılıyor:', apiError);
                // API çalışmıyorsa örnek verileri kullan
                setRestaurants(SAMPLE_RESTAURANTS);
            }

            setError(null);
        } catch (err) {
            console.error('Restoranlar yüklenirken kritik hata:', err);
            setError('Restoranlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
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
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Restoranlar</h1>

                {restaurants.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Henüz hiç restoran bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {restaurants.map((restaurant) => (
                            <Link
                                key={restaurant.id}
                                href={`/restaurant/${restaurant.id}`}
                                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="relative h-48">
                                    <img
                                        src={restaurant.image || "https://via.placeholder.com/800x600?text=Restoran"}
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