import axiosInstance from './axiosConfig';


const getStoredMenuItems = (filterByRestaurantId = null) => {
    if (typeof window === 'undefined') return [];

    const storedItems = localStorage.getItem('menuItems');
    const items = storedItems ? JSON.parse(storedItems) : [];

    console.log(`localStorage'dan ${items.length} menü öğesi yüklendi`);


    const lastUpdatedStr = localStorage.getItem('menuItemsLastUpdated');

    if (lastUpdatedStr) {
        const lastUpdated = new Date(lastUpdatedStr);
        const now = new Date();
        const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);


        if (hoursDiff > 24) {
            console.log('Menü öğeleri 24 saatten eski, otomatik temizleniyor');
            clearMenuItemsCache();
            return [];
        }

        console.log(`Menü öğeleri ${hoursDiff.toFixed(2)} saat önce güncellendi`);
    }


    if (filterByRestaurantId) {
        console.log(`Menü öğeleri restaurantId=${filterByRestaurantId} için filtreleniyor`);


        const strRestaurantId = String(filterByRestaurantId);


        const filteredItems = items.filter(item => {

            if (!item.restaurantId) return false;


            return String(item.restaurantId) === strRestaurantId;
        });

        console.log(`Filtreleme sonrası ${filteredItems.length} menü öğesi kaldı`);
        return filteredItems;
    }

    return items;
};

const storeMenuItems = (items) => {
    if (typeof window === 'undefined') return;


    const validItems = Array.isArray(items) ? items : [];


    localStorage.setItem('menuItems', JSON.stringify(validItems));

    localStorage.setItem('menuItemsLastUpdated', new Date().toISOString());
    console.log(`${validItems.length} menü öğesi localStorage'a kaydedildi`);
};


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


        return { success: true, message: 'Önbellek başarıyla temizlendi' };
    } catch (error) {
        console.error('Önbellek temizlenirken hata oluştu:', error);
        throw error;
    }
};


const resetAllData = () => {
    console.log('resetAllData çağrıldı - Tüm veriler sıfırlanıyor');

    if (typeof window === 'undefined') {
        console.warn('window tanımlı değil, işlem iptal ediliyor');
        return;
    }

    try {

        localStorage.removeItem('menuItems');

        localStorage.removeItem('menuItemsLastUpdated');

        // Diğer ilgili verileri de temizle
        localStorage.removeItem('orders');


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


if (typeof window !== 'undefined') {
    const currentItems = getStoredMenuItems();
    console.log(`Başlangıçta localStorage'dan ${currentItems.length} menü öğesi bulundu`);


    if (currentItems.length === 0) {
        const sampleMenuItem = {
            id: 'sample-1',
            name: 'Köfte',
            description: 'Enfes ızgara köfte, yanında patates kızartması ve salata ile servis edilir.',
            price: 85.00,
            category: 'Ana Yemek',
            imageUrl: '/image/kofte.jpg',
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

    getMenuItems: async (restaurantId) => {
        console.log(`getMenuItems çağrıldı, restaurantId: ${restaurantId}`);

        if (!restaurantId) {
            console.warn('restaurantId tanımlanmamış, getAllMenuItems çağrılıyor');
            return menuItemService.getAllMenuItems();
        }

        try {

            try {

                let response;
                let endpoint = '';
                let success = false;


                const endpoints = [
                    `/menu-items`,                             // Doğru menü-öğeleri endpoint'i
                    `/menu-items?restaurantId=${restaurantId}` // Filtreleme için query parametresi
                ];

                for (let i = 0; i < endpoints.length; i++) {
                    try {
                        endpoint = endpoints[i];
                        console.log(`API denemesi ${i + 1}: ${endpoint}`);
                        response = await axiosInstance.get(endpoint);


                        if (response && response.data) {
                            success = true;
                            console.log(`API başarılı: ${endpoint}`);
                            break;
                        }
                    } catch (e) {
                        console.warn(`Endpoint ${endpoint} başarısız:`, e.message);

                    }
                }

                if (!success) {

                    throw new Error("Hiçbir API endpoint'i yanıt vermedi");
                }

                console.log('API yanıtı:', response.data);

                let items = response.data;


                if (endpoint === '/menu-items') {
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


                console.log(`API'den ${items.length} menü öğesi alındı, localStorage'a kaydediliyor`);


                const currentItems = getStoredMenuItems();
                const updatedItems = currentItems.filter(item =>
                    !item.restaurantId || String(item.restaurantId) !== String(restaurantId)
                ).concat(items);

                storeMenuItems(updatedItems);
                return items;
            } catch (apiError) {
                console.warn('API\'den veri alınamadı, localStorage\'dan veri okunuyor:', apiError);


                const filteredItems = getStoredMenuItems(restaurantId);
                console.log(`localStorage'dan ${filteredItems.length} filtrelenmiş menü öğesi yüklendi`);
                return filteredItems;
            }
        } catch (error) {
            console.error(`Menü öğeleri alınırken hata (Restoran ID: ${restaurantId}):`, error);
            return [];
        }
    },


    getAllMenuItems: async () => {
        console.log('getAllMenuItems çağrıldı - tüm menü öğeleri getiriliyor');

        try {

            try {

                console.log('API denemesi: /menu-items');
                const response = await axiosInstance.get('/menu-items');

                if (!response || !response.data) {
                    throw new Error("API yanıt vermedi");
                }

                console.log('API yanıtı:', response.data);

                const items = response.data.map(item => ({
                    ...item,
                    price: parseFloat(item.price)
                }));


                console.log(`API'den ${items.length} menü öğesi alındı, localStorage'a kaydediliyor (filtresiz)`);
                storeMenuItems(items);
                return items;
            } catch (apiError) {
                console.warn('API\'den veri alınamadı, localStorage\'dan tüm veriler okunuyor:', apiError);


                const storedItems = getStoredMenuItems();
                console.log(`localStorage'dan ${storedItems.length} menü öğesi yüklendi (filtresiz)`);
                return storedItems;
            }
        } catch (error) {
            console.error('Tüm menü öğeleri alınırken hata:', error);
            return [];
        }
    },


    createMenuItem: async (menuItemData) => {
        try {
            console.log(`createMenuItem çağrıldı, veri:`, menuItemData);


            const formattedData = {
                ...menuItemData,

                imageUrl: menuItemData.imageUrl ? menuItemData.imageUrl : '/image/default-food.jpg',

                restaurantId: menuItemData.restaurantId ||
                    (typeof window !== 'undefined' ? localStorage.getItem('restaurantId') : null)
            };

            console.log(`Düzenlenmiş veri:`, formattedData);


            try {

                console.log('API POST denemesi: /menu-items');
                const response = await axiosInstance.post('/menu-items', formattedData);

                if (!response || !response.data) {
                    throw new Error("API yanıt vermedi");
                }

                console.log('API yanıtı:', response.data);


                const currentItems = getStoredMenuItems();
                const updatedItems = [...currentItems, response.data];
                storeMenuItems(updatedItems);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);


                const currentItems = getStoredMenuItems();


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


    updateMenuItem: async (id, menuItemData) => {
        try {
            console.log(`updateMenuItem çağrıldı, ID: ${id}, veri:`, menuItemData);


            const formattedData = {
                ...menuItemData,

                imageUrl: menuItemData.imageUrl ? menuItemData.imageUrl : '/image/default-food.jpg',

                restaurantId: menuItemData.restaurantId ||
                    (typeof window !== 'undefined' ? localStorage.getItem('restaurantId') : null)
            };

            console.log(`Düzenlenmiş veri:`, formattedData);


            try {

                console.log(`API PATCH denemesi: /menu-items/${id}`);
                const response = await axiosInstance.patch(`/menu-items/${id}`, formattedData);

                if (!response || !response.data) {
                    throw new Error("API yanıt vermedi");
                }

                console.log('API yanıtı:', response.data);


                const currentItems = getStoredMenuItems();
                const updatedItems = currentItems.map(item =>
                    item.id === id ? { ...response.data } : item
                );
                storeMenuItems(updatedItems);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);


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


    deleteMenuItem: async (id, restaurantId) => {
        try {

            try {

                console.log(`API DELETE denemesi: /menu-items/${id}`);
                const response = await axiosInstance.delete(`/menu-items/${id}`);
                console.log(`API DELETE başarılı: /menu-items/${id}`);


                const currentItems = getStoredMenuItems();
                const updatedItems = currentItems.filter(item => item.id !== id);
                storeMenuItems(updatedItems);

                return true;
            } catch (apiError) {
                console.warn('API\'ye silme isteği gönderilemedi, localStorage\'dan siliniyor:', apiError);


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


    clearCache: clearMenuItemsCache,


    resetAllData
};