import axiosInstance from './axiosConfig';

// Geçici olarak localStorage'da menü öğelerini saklamak için yardımcı fonksiyonlar
const getStoredMenuItems = (filterByRestaurantId = null) => {
    if (typeof window === 'undefined') return [];

    const storedItems = localStorage.getItem('menuItems');
    const items = storedItems ? JSON.parse(storedItems) : [];

    console.log(`localStorage'dan ${items.length} menü öğesi yüklendi`);

    // Son güncelleme zamanını kontrol et
    const lastUpdatedStr = localStorage.getItem('menuItemsLastUpdated');

    if (lastUpdatedStr) {
        const lastUpdated = new Date(lastUpdatedStr);
        const now = new Date();
        const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);

        // Eğer son güncellemeden bu yana 24 saatten fazla geçtiyse, verileri temizle
        if (hoursDiff > 24) {
            console.log('Menü öğeleri 24 saatten eski, otomatik temizleniyor');
            clearMenuItemsCache();
            return [];
        }

        console.log(`Menü öğeleri ${hoursDiff.toFixed(2)} saat önce güncellendi`);
    }

    // Eğer restaurantId belirtildiyse, filtreleme yap
    if (filterByRestaurantId) {
        console.log(`Menü öğeleri restaurantId=${filterByRestaurantId} için filtreleniyor`);

        // RestaurantId string veya sayı olabilir, esnek kontrol yapalım
        const strRestaurantId = String(filterByRestaurantId);

        // RestaurantId'ye göre filtreleme yap
        const filteredItems = items.filter(item => {
            // item.restaurantId null veya undefined olabilir
            if (!item.restaurantId) return false;

            // String olarak karşılaştır
            return String(item.restaurantId) === strRestaurantId;
        });

        console.log(`Filtreleme sonrası ${filteredItems.length} menü öğesi kaldı`);
        return filteredItems;
    }

    return items;
};

const storeMenuItems = (items) => {
    if (typeof window === 'undefined') return;

    // Null kontrolü ekleyelim
    const validItems = Array.isArray(items) ? items : [];

    // Menü öğelerini localStorage'a kaydet
    localStorage.setItem('menuItems', JSON.stringify(validItems));
    // Son güncelleme zamanını kaydet
    localStorage.setItem('menuItemsLastUpdated', new Date().toISOString());
    console.log(`${validItems.length} menü öğesi localStorage'a kaydedildi`);
};

// localStorage'daki eski verileri temizleme fonksiyonu
const clearMenuItemsCache = () => {
    console.log('clearMenuItemsCache çağrıldı');

    if (typeof window === 'undefined') {
        console.warn('window tanımlı değil, işlem iptal ediliyor');
        return;
    }

    try {
        localStorage.removeItem('menuItems');
        localStorage.removeItem('menuItemsLastUpdated');
        console.log('Menü öğeleri önbelleği temizlendi');

        // Başarıyla temizlendiğinde geri dönüş değeri
        return { success: true, message: 'Önbellek başarıyla temizlendi' };
    } catch (error) {
        console.error('Önbellek temizlenirken hata oluştu:', error);
        throw error;
    }
};

// Tüm verileri sıfırlama ve yeniden başlatma fonksiyonu
const resetAllData = () => {
    console.log('resetAllData çağrıldı - Tüm veriler sıfırlanıyor');

    if (typeof window === 'undefined') {
        console.warn('window tanımlı değil, işlem iptal ediliyor');
        return;
    }

    try {
        // Menü öğelerini temizle
        localStorage.removeItem('menuItems');
        // Son güncelleme zamanını temizle
        localStorage.removeItem('menuItemsLastUpdated');

        // Diğer ilgili verileri de temizle
        localStorage.removeItem('orders');

        // Varsayılan örnek menü öğesi ekle
        const sampleMenuItem = {
            id: 'sample-1',
            name: 'Köfte',
            description: 'Enfes ızgara köfte, yanında patates kızartması ve salata ile servis edilir.',
            price: 85.00,
            category: 'Ana Yemek',
            imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/kebab-1238661_1280.jpg',
            isAvailable: true,
            restaurantId: typeof window !== 'undefined' ? localStorage.getItem('restaurantId') : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        storeMenuItems([sampleMenuItem]);
        console.log('Örnek menü öğesi eklendi');

        console.log('Tüm veriler başarıyla sıfırlandı');
        return { success: true, message: 'Tüm veriler başarıyla sıfırlandı' };
    } catch (error) {
        console.error('Veriler sıfırlanırken hata oluştu:', error);
        throw error;
    }
};

// İlk çalıştırmada otomatik olarak çağrılacak
if (typeof window !== 'undefined') {
    const currentItems = getStoredMenuItems();
    console.log(`Başlangıçta localStorage'dan ${currentItems.length} menü öğesi bulundu`);

    // Eğer hiç menü öğesi yoksa, örnek bir menü öğesi ekleyelim
    if (currentItems.length === 0) {
        const sampleMenuItem = {
            id: 'sample-1',
            name: 'Köfte',
            description: 'Enfes ızgara köfte, yanında patates kızartması ve salata ile servis edilir.',
            price: 85.00,
            category: 'Ana Yemek',
            imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/kebab-1238661_1280.jpg',
            isAvailable: true,
            restaurantId: localStorage.getItem('restaurantId'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        storeMenuItems([sampleMenuItem]);
        console.log('İlk başlangıçta örnek menü öğesi eklendi');
    }
}

export const menuItemService = {
    // Bir restoranın tüm menü öğelerini getir
    getMenuItems: async (restaurantId) => {
        console.log(`getMenuItems çağrıldı, restaurantId: ${restaurantId}`);

        if (!restaurantId) {
            console.warn('restaurantId tanımlanmamış, getAllMenuItems çağrılıyor');
            return menuItemService.getAllMenuItems();
        }

        try {
            // Önce API'den veri almayı dene
            try {
                // Basitleştirilmiş endpoint kullanımı - sadece çalışan endpoint'leri dene
                let response;
                let endpoint = '';
                let success = false;

                // Endpoint alternatifleri - sırayla denenecek (sadece çalışan endpoint'ler)
                const endpoints = [
                    `/menu`,                                     // Ana endpoint - bu genellikle çalışıyor
                    `/menu/restaurant/${restaurantId}`           // Backup endpoint
                ];

                for (let i = 0; i < endpoints.length; i++) {
                    try {
                        endpoint = endpoints[i];
                        console.log(`API denemesi ${i + 1}: ${endpoint}`);
                        response = await axiosInstance.get(endpoint);

                        // Cevap alındıysa döngüden çık
                        if (response && response.data) {
                            success = true;
                            console.log(`API başarılı: ${endpoint}`);
                            break;
                        }
                    } catch (e) {
                        console.warn(`Endpoint ${endpoint} başarısız:`, e.message);
                        // Devam et, sonraki endpoint'i dene
                    }
                }

                if (!success) {
                    // Tüm denemeler başarısız oldu, hata fırlat
                    throw new Error("Hiçbir API endpoint'i yanıt vermedi");
                }

                console.log('API yanıtı:', response.data);

                let items = response.data;

                // Son endpoint (tüm menü) kullanıldıysa, restaurantId filtresi uygula
                if (endpoint === '/menu') {
                    console.log('Tüm menü verisi alındı, restaurantId ile filtreleniyor');
                    items = items.filter(item => {
                        if (!item.restaurantId) return false;
                        return String(item.restaurantId) === String(restaurantId);
                    });
                    console.log(`Filtreleme sonrası ${items.length} öğe kaldı`);
                }

                // Fiyat alanlarını sayıya çevir
                items = items.map(item => ({
                    ...item,
                    price: parseFloat(item.price)
                }));

                // Başarılı olursa, localStorage'a kaydet ve döndür
                console.log(`API'den ${items.length} menü öğesi alındı, localStorage'a kaydediliyor`);

                // API'den gelen verileri kaydederken, mevcut öğeleri restaurantId'ye göre filtrelemeden kaydet
                const currentItems = getStoredMenuItems();
                const updatedItems = currentItems.filter(item =>
                    !item.restaurantId || String(item.restaurantId) !== String(restaurantId)
                ).concat(items);

                storeMenuItems(updatedItems);
                return items;
            } catch (apiError) {
                console.warn('API\'den veri alınamadı, localStorage\'dan veri okunuyor:', apiError);

                // API'den veri alınamazsa, localStorage'dan oku ve restaurantId ile filtrele
                const filteredItems = getStoredMenuItems(restaurantId);
                console.log(`localStorage'dan ${filteredItems.length} filtrelenmiş menü öğesi yüklendi`);
                return filteredItems;
            }
        } catch (error) {
            console.error(`Menü öğeleri alınırken hata (Restoran ID: ${restaurantId}):`, error);
            return [];
        }
    },

    // TÜM menü öğelerini getir (filtreleme olmadan)
    getAllMenuItems: async () => {
        console.log('getAllMenuItems çağrıldı - tüm menü öğeleri getiriliyor');

        try {
            // Önce API'den veri almayı dene
            try {
                // Basitleştirilmiş endpoint kullanımı
                console.log('API denemesi: /menu');
                const response = await axiosInstance.get('/menu');

                if (!response || !response.data) {
                    throw new Error("API yanıt vermedi");
                }

                console.log('API yanıtı:', response.data);

                const items = response.data.map(item => ({
                    ...item,
                    price: parseFloat(item.price)
                }));

                // Başarılı olursa, localStorage'a kaydet ve döndür
                console.log(`API'den ${items.length} menü öğesi alındı, localStorage'a kaydediliyor (filtresiz)`);
                storeMenuItems(items);
                return items;
            } catch (apiError) {
                console.warn('API\'den veri alınamadı, localStorage\'dan tüm veriler okunuyor:', apiError);

                // API'den veri alınamazsa, localStorage'dan filtresiz oku 
                const storedItems = getStoredMenuItems(); // filtresiz çağrı
                console.log(`localStorage'dan ${storedItems.length} menü öğesi yüklendi (filtresiz)`);
                return storedItems;
            }
        } catch (error) {
            console.error('Tüm menü öğeleri alınırken hata:', error);
            return [];
        }
    },

    // Yeni menü öğesi oluştur
    createMenuItem: async (menuItemData) => {
        try {
            console.log(`createMenuItem çağrıldı, veri:`, menuItemData);

            // RestaurantId'nin düzgün formatta olduğundan emin ol
            const formattedData = {
                ...menuItemData,
                // RestaurantId yoksa boş string yerine user.restaurantId kullanmak için kontrol ekle
                restaurantId: menuItemData.restaurantId ||
                    (typeof window !== 'undefined' ? localStorage.getItem('restaurantId') : null)
            };

            console.log(`Düzenlenmiş veri:`, formattedData);

            // Önce API'ye veri göndermeyi dene
            try {
                // Basitleştirilmiş endpoint kullanımı
                console.log('API POST denemesi: /menu');
                const response = await axiosInstance.post('/menu', formattedData);

                if (!response || !response.data) {
                    throw new Error("API yanıt vermedi");
                }

                console.log('API yanıtı:', response.data);

                // Başarılı olursa, localStorage'ı güncelle ve döndür
                const currentItems = getStoredMenuItems();
                const updatedItems = [...currentItems, response.data];
                storeMenuItems(updatedItems);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);

                // API'ye veri gönderilemezse, localStorage'a kaydet
                const currentItems = getStoredMenuItems();

                // Geçici ID oluştur
                const newItem = {
                    ...formattedData,
                    id: `temp-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                console.log('localStorage\'a kaydedilecek yeni öğe:', newItem);
                const updatedItems = [...currentItems, newItem];
                storeMenuItems(updatedItems);

                return newItem;
            }
        } catch (error) {
            console.error('Menü öğesi oluşturulurken hata:', error);
            throw error;
        }
    },

    // Menü öğesini güncelle
    updateMenuItem: async (id, menuItemData) => {
        try {
            console.log(`updateMenuItem çağrıldı, ID: ${id}, veri:`, menuItemData);

            // RestaurantId'nin düzgün formatta olduğundan emin ol
            const formattedData = {
                ...menuItemData,
                // RestaurantId yoksa boş string yerine user.restaurantId kullanmak için kontrol ekle
                restaurantId: menuItemData.restaurantId ||
                    (typeof window !== 'undefined' ? localStorage.getItem('restaurantId') : null)
            };

            console.log(`Düzenlenmiş veri:`, formattedData);

            // Önce API'ye veri göndermeyi dene
            try {
                // Basitleştirilmiş endpoint kullanımı
                console.log(`API PATCH denemesi: /menu/${id}`);
                const response = await axiosInstance.patch(`/menu/${id}`, formattedData);

                if (!response || !response.data) {
                    throw new Error("API yanıt vermedi");
                }

                console.log('API yanıtı:', response.data);

                // Başarılı olursa, localStorage'ı güncelle ve döndür
                const currentItems = getStoredMenuItems();
                const updatedItems = currentItems.map(item =>
                    item.id === id ? { ...response.data } : item
                );
                storeMenuItems(updatedItems);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);

                // API'ye veri gönderilemezse, localStorage'a kaydet
                const currentItems = getStoredMenuItems();

                const updatedItem = {
                    ...formattedData,
                    id,
                    updatedAt: new Date().toISOString()
                };

                console.log('localStorage\'da güncellenecek öğe:', updatedItem);
                const updatedItems = currentItems.map(item =>
                    item.id === id ? updatedItem : item
                );
                storeMenuItems(updatedItems);

                return updatedItem;
            }
        } catch (error) {
            console.error(`Menü öğesi güncellenirken hata (ID: ${id}):`, error);
            throw error;
        }
    },

    // Menü öğesini sil
    deleteMenuItem: async (id, restaurantId) => {
        try {
            // Önce API'ye istek göndermeyi dene
            try {
                // Basitleştirilmiş endpoint kullanımı
                console.log(`API DELETE denemesi: /menu/${id}`);
                const response = await axiosInstance.delete(`/menu/${id}`);
                console.log(`API DELETE başarılı: /menu/${id}`);

                // Başarılı olursa, localStorage'ı güncelle
                const currentItems = getStoredMenuItems();
                const updatedItems = currentItems.filter(item => item.id !== id);
                storeMenuItems(updatedItems);

                return true;
            } catch (apiError) {
                console.warn('API\'ye silme isteği gönderilemedi, localStorage\'dan siliniyor:', apiError);

                // API'ye istek gönderilemezse, localStorage'dan sil
                const currentItems = getStoredMenuItems();
                const updatedItems = currentItems.filter(item => item.id !== id);
                storeMenuItems(updatedItems);

                return true;
            }
        } catch (error) {
            console.error(`Menü öğesi silinirken hata (ID: ${id}):`, error);
            throw error;
        }
    },

    // Önbelleği temizleme metodu
    clearCache: clearMenuItemsCache,

    // Tüm verileri sıfırlama metodu
    resetAllData
}; 