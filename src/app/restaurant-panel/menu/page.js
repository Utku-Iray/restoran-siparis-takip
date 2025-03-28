'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { menuItemService } from '../../services/menuItemService';
import { fixImageUrl, prepareImageForDB } from '../../services/axiosConfig';

export default function MenuPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        imageUrl: '',
        isAvailable: true
    });

    useEffect(() => {
        if (!loading && (!user || user.role !== 'restaurant')) {
            router.push('/auth/login');
        }

        if (user && user.restaurantId) {
            localStorage.setItem('restaurantId', user.restaurantId);
            console.log("useEffect: restaurantId localStorage'a kaydedildi:", user.restaurantId);
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            loadMenuItems();
        }
    }, [user]);

    const loadMenuItems = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log("loadMenuItems çalıştırılıyor, kullanıcı:", user);

            let restaurantId = null;

            if (user && user.restaurantId) {
                restaurantId = user.restaurantId;
                console.log("restaurantId user nesnesinden alındı:", restaurantId);
            }
            else if (user && user.id) {
                restaurantId = user.id;
                console.log("restaurantId user.id'den alındı:", restaurantId);
            }
            else {
                restaurantId = localStorage.getItem('restaurantId');
                console.log("restaurantId localStorage'dan alındı:", restaurantId);
            }

            if (!restaurantId) {
                console.warn("restaurantId hiçbir kaynaktan bulunamadı, filtresiz yükleniyor");

                try {
                    const items = await menuItemService.getAllMenuItems();
                    setMenuItems(items);
                    console.log("Tüm menü öğeleri yüklendi (filtresiz):", items.length);
                } catch (err) {
                    console.warn('Filtresiz menü öğeleri yüklenemedi:', err);
                    setMenuItems([]);
                }
            } else {
                console.log(`restaurantId=${restaurantId} ile menü öğeleri getiriliyor`);

                try {
                    const items = await menuItemService.getMenuItems(restaurantId);
                    console.log("Menü öğeleri restaurantId ile yüklendi:", items.length);
                    setMenuItems(items);

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('restaurantId', restaurantId);
                        console.log("restaurantId localStorage'a kaydedildi:", restaurantId);
                    }
                } catch (err) {
                    console.warn('Menü öğeleri yüklenemedi:', err);
                    setMenuItems([]);
                }
            }
        } catch (err) {
            console.error('Menü yüklenirken hata:', err);
            setError('Menü öğeleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const { files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            console.log('Seçilen dosya:', file.name, 'boyut:', (file.size / 1024).toFixed(2), 'KB');

            if (file.size > 5 * 1024 * 1024) {
                setError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
                return;
            }

            const fileName = file.name.toLowerCase();
            const imageUrl = `/image/${fileName}`;

            setFormData(prev => ({
                ...prev,
                imageUrl: imageUrl
            }));

            console.log('ImageUrl ayarlandı:', imageUrl);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setCurrentItem(item);
            setFormData({
                name: item.name || '',
                price: item.price ? item.price.toString() : '',
                description: item.description || '',
                category: item.category || '',
                imageUrl: item.imageurl || item.imageUrl || '',
                isAvailable: item.isAvailable !== false
            });
        } else {
            setCurrentItem(null);
            setFormData({
                name: '',
                price: '',
                description: '',
                category: '',
                imageUrl: '',
                isAvailable: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!formData.name || !formData.price || !formData.category) {
                setError('Lütfen zorunlu alanları doldurun (Ürün Adı, Fiyat, Kategori)');
                return;
            }

            let restaurantId = null;

            if (user && user.restaurantId) {
                restaurantId = user.restaurantId;
                console.log('handleSubmit: restaurantId user.restaurantId değerinden alındı:', restaurantId);
            }
            else if (user && user.id) {
                restaurantId = user.id;
                console.log('handleSubmit: restaurantId user.id değerinden alındı:', restaurantId);
            }
            else {
                restaurantId = localStorage.getItem('restaurantId');
                console.log('handleSubmit: restaurantId localStorage\'dan alındı:', restaurantId);
            }

            if (!restaurantId) {
                console.error('handleSubmit: restaurantId hiçbir kaynaktan bulunamadı, işlem yapılamıyor');
                setError('Restoran bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
                return;
            }

            const imageUrl = prepareImageForDB(formData.imageUrl);
            console.log('Backend için hazırlanan imageUrl:', imageUrl);

            const itemData = {
                ...formData,
                price: parseFloat(formData.price),
                restaurantId: restaurantId,
                imageUrl: imageUrl
            };

            console.log('Gönderilecek veri:', itemData);

            // API'ye gönderilecek veri
            let result;

            if (currentItem) {
                // Mevcut öğeyi güncelle
                try {
                    result = await menuItemService.updateMenuItem(currentItem.id, itemData);
                    setMenuItems(prev =>
                        prev.map(item => item.id === currentItem.id ? result : item)
                    );
                    setSuccess('Menü öğesi başarıyla güncellendi.');
                } catch (err) {
                    console.warn('API güncellemesi başarısız:', err);
                    setError('Menü öğesi güncellenirken bir hata oluştu.');
                }
            } else {
                // Yeni öğe ekle
                try {
                    result = await menuItemService.createMenuItem(itemData);
                    setMenuItems(prev => [...prev, result]);
                    setSuccess('Yeni menü öğesi başarıyla eklendi.');
                } catch (err) {
                    console.warn('API eklemesi başarısız:', err);
                    setError('Yeni menü öğesi eklenirken bir hata oluştu.');
                }
            }

            closeModal();
        } catch (err) {
            console.error('Form gönderilirken hata:', err);
            setError('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu menü öğesini silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            // Tüm restaurantId kaynaklarını kontrol et
            let restaurantId = null;

            // 1. Kaynak: user.restaurantId (öncelikli)
            if (user && user.restaurantId) {
                restaurantId = user.restaurantId;
                console.log('handleDelete: restaurantId user.restaurantId değerinden alındı:', restaurantId);
            }
            // 2. Kaynak: user.id (bazı API'ler id'yi kullanıyor)
            else if (user && user.id) {
                restaurantId = user.id;
                console.log('handleDelete: restaurantId user.id değerinden alındı:', restaurantId);
            }
            // 3. Kaynak: localStorage
            else {
                restaurantId = localStorage.getItem('restaurantId');
                console.log('handleDelete: restaurantId localStorage\'dan alındı:', restaurantId);
            }

            if (!restaurantId) {
                console.error('handleDelete: restaurantId hiçbir kaynaktan bulunamadı, yine de silme işlemi denenecek');
            }

            console.log(`handleDelete: Menü öğesi siliniyor, id=${id}, restaurantId=${restaurantId}`);

            await menuItemService.deleteMenuItem(id, restaurantId);
            setMenuItems(prev => prev.filter(item => item.id !== id));
            setSuccess('Menü öğesi başarıyla silindi.');
        } catch (err) {
            console.error('Silme işlemi sırasında hata:', err);
            setError('Silme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const clearCache = async () => {
        try {
            setError(null);
            setSuccess('');

            // Tüm menü önbelleğini temizle
            await menuItemService.clearCache();

            setSuccess('Önbellek başarıyla temizlendi! Sayfa yenileniyor...');

            // 1.5 saniye sonra sayfayı yenile
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Önbellek temizlenirken hata:', error);
            setError('Önbellek temizlenirken bir hata oluştu');
        }
    };

    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    // Kategorilere göre menü öğelerini grupla
    const categorizedItems = menuItems.reduce((acc, item) => {
        const category = item.category || 'Diğer';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-100 pt-36">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Menü Yönetimi</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => router.push('/restaurant-panel')}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Geri Dön
                            </button>
                            <button
                                onClick={() => openModal()}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Yeni Ürün Ekle
                            </button>
                            <button
                                onClick={clearCache}
                                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200 flex items-center text-sm relative group"
                                title="Önbelleği temizler ve güncel verileri getirir"
                            >
                                <span className="mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </span>
                                Önbelleği Temizle
                                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                    Menü verilerindeki sorunları giderir
                                </span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Hata! </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Başarılı! </strong>
                            <span className="block sm:inline">{success}</span>
                        </div>
                    )}

                    {menuItems.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 mb-4">Henüz menünüzde ürün bulunmuyor.</p>
                            <button
                                onClick={() => openModal()}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                İlk Ürünü Ekle
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(categorizedItems).map(([category, items]) => (
                                <div key={category} className="border-b pb-6 last:border-b-0 last:pb-0">
                                    <h2 className="text-xl font-semibold mb-4">{category}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {items.map(item => (
                                            <div key={item.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                                {(item.imageurl || item.imageUrl) && (
                                                    <div className="h-48 overflow-hidden">
                                                        <img
                                                            src={fixImageUrl(item.imageurl || item.imageUrl)}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = '/image/default-food.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                                        <span className="font-semibold text-red-600">
                                                            {typeof item.price === 'number'
                                                                ? item.price.toFixed(2)
                                                                : item.price} TL
                                                        </span>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                                    )}
                                                    <div className="flex items-center justify-between mt-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.isAvailable !== false
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {item.isAvailable !== false ? 'Mevcut' : 'Tükendi'}
                                                        </span>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => openModal(item)}
                                                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                            >
                                                                Düzenle
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                            >
                                                                Sil
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Ürün Ekleme/Düzenleme Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {currentItem ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Ürün Adı*
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Fiyat (TL)*
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategori*
                                </label>
                                <input
                                    type="text"
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Açıklama
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
                                    Ürün Görseli
                                </label>
                                {formData.imageUrl && (
                                    <div className="mb-2">
                                        <img
                                            src={fixImageUrl(formData.imageUrl)}
                                            alt="Ürün Görseli"
                                            className="h-48 w-full object-cover rounded-md"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/image/default-food.jpg';
                                            }}
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="imageFile"
                                    name="imageFile"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    name="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                                    Ürün mevcut mu?
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    {currentItem ? 'Güncelle' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 