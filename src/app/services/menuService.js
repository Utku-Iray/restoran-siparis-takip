import axiosInstance from './axiosConfig';

// Geçici olarak localStorage'da menü öğelerini saklamak için yardımcı fonksiyonlar
const getStoredMenuItems = () => {
    if (typeof window === 'undefined') return [];

    const storedItems = localStorage.getItem('menuItems');
    return storedItems ? JSON.parse(storedItems) : [];
};

const storeMenuItems = (items) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('menuItems', JSON.stringify(items));
    console.log('Menü öğeleri localStorage\'a kaydedildi:', items.length);
};

export const menuService = {
    getAllMenuItems: async () => {
        try {
            try {
                // Önce backend'den veri almayı dene
                const response = await axiosInstance.get('/menu');
                const items = response.data.map(item => ({
                    ...item,
                    price: parseFloat(item.price)
                }));

                // Restoran bilgilerini localStorage'a kaydet
                if (items.length > 0) {
                    const restaurantId = items[0].restaurantId;
                    const restaurantName = items[0].restaurantName || 'Restoran';
                    localStorage.setItem('restaurantId', restaurantId);
                    localStorage.setItem('restaurantName', restaurantName);
                }

                // Menü öğelerini localStorage'a kaydet
                storeMenuItems(items);
                return items;
            } catch (apiError) {
                console.warn('API\'den veri alınamadı, localStorage\'dan veri okunuyor:', apiError);

                // API'den veri alınamazsa, localStorage'dan oku
                const storedItems = getStoredMenuItems();
                console.log('localStorage\'dan menü öğeleri yüklendi:', storedItems.length);
                return storedItems;
            }
        } catch (error) {
            console.error('Menü öğeleri alınırken hata:', error);
            return []; // Hata durumunda boş dizi döndür
        }
    },

    createMenuItem: async (menuItem) => {
        try {
            try {
                // Önce backend'e göndermeyi dene
                const response = await axiosInstance.post('/menu', {
                    ...menuItem,
                    price: parseFloat(menuItem.price)
                });

                // Başarılı olursa, localStorage'ı güncelle
                const storedItems = getStoredMenuItems();
                storeMenuItems([...storedItems, response.data]);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);

                // API'ye gönderilemezse, localStorage'a kaydet
                const newItem = {
                    ...menuItem,
                    id: `local-${Date.now()}`,
                    price: parseFloat(menuItem.price),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                const storedItems = getStoredMenuItems();
                storeMenuItems([...storedItems, newItem]);

                return newItem;
            }
        } catch (error) {
            console.error('Menü öğesi oluşturulurken hata:', error);
            throw error;
        }
    },

    updateMenuItem: async (id, menuItem) => {
        try {
            try {
                // Önce backend'e göndermeyi dene
                const response = await axiosInstance.patch(`/menu/${id}`, {
                    ...menuItem,
                    price: parseFloat(menuItem.price)
                });

                // Başarılı olursa, localStorage'ı güncelle
                const storedItems = getStoredMenuItems();
                const updatedItems = storedItems.map(item =>
                    item.id === id ? response.data : item
                );
                storeMenuItems(updatedItems);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);

                // API'ye gönderilemezse, localStorage'u güncelle
                const storedItems = getStoredMenuItems();
                const updatedItem = {
                    ...menuItem,
                    id,
                    price: parseFloat(menuItem.price),
                    updatedAt: new Date().toISOString()
                };

                const updatedItems = storedItems.map(item =>
                    item.id === id ? updatedItem : item
                );
                storeMenuItems(updatedItems);

                return updatedItem;
            }
        } catch (error) {
            console.error('Menü öğesi güncellenirken hata:', error);
            throw error;
        }
    },

    deleteMenuItem: async (id) => {
        try {
            try {
                // Önce backend'e göndermeyi dene
                const response = await axiosInstance.delete(`/menu/${id}`);

                // Başarılı olursa, localStorage'ı güncelle
                const storedItems = getStoredMenuItems();
                const remainingItems = storedItems.filter(item => item.id !== id);
                storeMenuItems(remainingItems);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye silme isteği gönderilemedi, localStorage\'dan siliniyor:', apiError);

                // API'ye gönderilemezse, localStorage'dan sil
                const storedItems = getStoredMenuItems();
                const remainingItems = storedItems.filter(item => item.id !== id);
                storeMenuItems(remainingItems);

                return { success: true };
            }
        } catch (error) {
            console.error('Menü öğesi silinirken hata:', error);
            throw error;
        }
    },

    toggleAvailability: async (id) => {
        try {
            try {
                // Önce backend'e göndermeyi dene
                const response = await axiosInstance.patch(`/menu/${id}/toggle-availability`);

                // Başarılı olursa, localStorage'ı güncelle
                const storedItems = getStoredMenuItems();
                const updatedItems = storedItems.map(item => {
                    if (item.id === id) {
                        return {
                            ...item,
                            isAvailable: !item.isAvailable
                        };
                    }
                    return item;
                });
                storeMenuItems(updatedItems);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);

                // API'ye gönderilemezse, localStorage'u güncelle
                const storedItems = getStoredMenuItems();
                const updatedItems = storedItems.map(item => {
                    if (item.id === id) {
                        return {
                            ...item,
                            isAvailable: !item.isAvailable,
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return item;
                });
                storeMenuItems(updatedItems);

                const updatedItem = updatedItems.find(item => item.id === id);
                return updatedItem || { success: true };
            }
        } catch (error) {
            console.error('Menü öğesi durumu güncellenirken hata:', error);
            throw error;
        }
    }
}; 