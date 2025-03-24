'use client';

import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { StarIcon } from '@heroicons/react/20/solid';
import { MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';

// Örnek veri - Backend entegrasyonunda değiştirilecek
const SAMPLE_RESTAURANT = {
    id: 1,
    name: "Lezzet Durağı",
    description: "Geleneksel Türk mutfağının en seçkin lezzetleri",
    rating: 4.5,
    totalReviews: 128,
    address: "Atatürk Cad. No: 123, İstanbul",
    phone: "0212 345 67 89",
    workingHours: "10:00 - 22:00",
    categories: ["Kebap", "Pide", "Lahmacun", "İçecekler"],
    menu: [
        {
            id: 1,
            name: "Adana Kebap",
            description: "Özel baharatlarla hazırlanmış el yapımı kebap",
            price: 120,
            image: "/images/adana-kebap.jpg",
            category: "Kebap"
        },
        {
            id: 2,
            name: "Karışık Pide",
            description: "Kaşar, sucuk, pastırma ve kuşbaşı ile",
            price: 90,
            image: "/images/karisik-pide.jpg",
            category: "Pide"
        }
    ],
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
};

export default function RestaurantPage({ params }) {
    const { addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' veya 'reviews'

    // Menü filtreleme
    const filteredMenu = selectedCategory === 'Tümü'
        ? SAMPLE_RESTAURANT.menu
        : SAMPLE_RESTAURANT.menu.filter(item => item.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Restoran Başlık Bölümü */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900">{SAMPLE_RESTAURANT.name}</h1>
                    <p className="mt-2 text-gray-600">{SAMPLE_RESTAURANT.description}</p>

                    <div className="mt-4 flex items-center space-x-4">
                        <div className="flex items-center">
                            <StarIcon className="h-5 w-5 text-yellow-400" />
                            <span className="ml-1 text-sm text-gray-600">
                                {SAMPLE_RESTAURANT.rating} ({SAMPLE_RESTAURANT.totalReviews} değerlendirme)
                            </span>
                        </div>
                        <div className="flex items-center">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                            <span className="ml-1 text-sm text-gray-600">{SAMPLE_RESTAURANT.address}</span>
                        </div>
                        <div className="flex items-center">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                            <span className="ml-1 text-sm text-gray-600">{SAMPLE_RESTAURANT.phone}</span>
                        </div>
                        <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                            <span className="ml-1 text-sm text-gray-600">{SAMPLE_RESTAURANT.workingHours}</span>
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
                            <button
                                onClick={() => setSelectedCategory('Tümü')}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === 'Tümü'
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Tümü
                            </button>
                            {SAMPLE_RESTAURANT.categories.map((category) => (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMenu.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="h-48 w-full bg-gray-200">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-lg font-medium text-gray-900">{item.price} ₺</span>
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                                            >
                                                Sepete Ekle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    // Değerlendirmeler
                    <div className="space-y-6">
                        {SAMPLE_RESTAURANT.reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-500">{review.user[0]}</span>
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{review.user}</p>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon
                                                        key={i}
                                                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                                <p className="mt-4 text-gray-600">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 