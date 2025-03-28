'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { menuItemService } from '../services/menuItemService'

const CATEGORIES = [
    "Tümü",
    "Ana Yemekler",
    "Çorbalar",
    "Salatalar",
    "İçecekler",
    "Tatlılar"
];

export default function MenuPage() {
    const [selectedCategory, setSelectedCategory] = useState("Tümü");
    const [searchQuery, setSearchQuery] = useState("");
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        loadMenuItems();
    }, []);

    const loadMenuItems = async () => {
        try {
            setLoading(true);
            console.log("Müşteri menü sayfasında tüm menü öğeleri yükleniyor...");

            const items = await menuItemService.getAllMenuItems();
            console.log(`Toplam ${items.length} menü öğesi yüklendi`);
            setMenuItems(items);

            if (items.length > 0) {
                const restaurantId = items[0].restaurantId;
                const restaurantName = items[0].restaurantName || 'Restoran';
                localStorage.setItem('restaurantId', restaurantId);
                localStorage.setItem('restaurantName', restaurantName);
                console.log(`Restoran bilgileri kaydedildi. ID: ${restaurantId}, Ad: ${restaurantName}`);
            }

            setError(null);
        } catch (err) {
            console.error('Menü yüklenirken hata:', err);
            setError('Menü yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === "Tümü" || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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
                        {CATEGORIES.map((category) => (
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
                                    src={item.imageUrl || item.image || '/images/default-food.jpg'}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                                    {item.preparationTime || '15-20 dk'}
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                    <span className="text-lg font-bold text-pink-600">
                                        {typeof item.price === 'number' ? item.price.toFixed(2) : item.price} ₺
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    {item.description || 'Lezzetli yemek, detaylar için tıklayın.'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">{item.category || 'Diğer'}</span>
                                    <button
                                        onClick={() => addToCart(item)}
                                        className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                                        disabled={item.isAvailable === false}
                                    >
                                        {item.isAvailable === false ? 'Tükendi' : 'Sepete Ekle'}
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