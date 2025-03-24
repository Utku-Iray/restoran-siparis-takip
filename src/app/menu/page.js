'use client'

import { useState } from 'react'
import { useCart } from '../context/CartContext'

// Örnek veri - Backend entegrasyonunda değiştirilecek
const SAMPLE_CATEGORIES = [
    "Tümü",
    "Ana Yemekler",
    "Çorbalar",
    "Salatalar",
    "İçecekler",
    "Tatlılar"
];

const SAMPLE_MENU_ITEMS = [
    {
        id: 1,
        name: "Köfte",
        description: "Izgara köfte, yanında pilav ve salata ile",
        price: 120,
        category: "Ana Yemekler",
        image: "/images/kofte.jpg",
        preparationTime: "20 dk",
        calories: "450 kcal"
    },
    // Diğer örnek ürünler backend entegrasyonunda eklenecek
];

export default function MenuPage() {
    const [selectedCategory, setSelectedCategory] = useState("Tümü");
    const [searchQuery, setSearchQuery] = useState("");
    const { addToCart } = useCart();

    const filteredItems = SAMPLE_MENU_ITEMS.filter(item => {
        const matchesCategory = selectedCategory === "Tümü" || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Başlık */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Menümüz</h1>
                    <p className="text-lg text-gray-600">Birbirinden lezzetli yemeklerimizi keşfedin</p>
                </div>

                {/* Arama ve Filtreleme */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Yemek ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
                        {SAMPLE_CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                                    ${selectedCategory === category
                                        ? 'bg-pink-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menü Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative h-48">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                                    {item.preparationTime}
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                    <span className="text-lg font-bold text-pink-600">{item.price} ₺</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">{item.calories}</span>
                                    <button
                                        onClick={() => addToCart(item)}
                                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                    >
                                        Sepete Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sonuç bulunamadı */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 