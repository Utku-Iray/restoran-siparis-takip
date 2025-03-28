import axiosInstance from './axiosConfig';


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

                const response = await axiosInstance.get('/menu');
                const items = response.data.map(item => ({
                    ...item,
                    price: parseFloat(item.price)
                }));


                if (items.length > 0) {
                    const restaurantId = items[0].restaurantId;
                    const restaurantName = items[0].restaurantName || 'Restoran';
                    localStorage.setItem('restaurantId', restaurantId);
                    localStorage.setItem('restaurantName', restaurantName);
                }


                storeMenuItems(items);
                return items;
            } catch (apiError) {
                console.warn('API\'den veri alınamadı, localStorage\'dan veri okunuyor:', apiError);

                const storedItems = getStoredMenuItems();
                console.log('localStorage\'dan menü öğeleri yüklendi:', storedItems.length);
                return storedItems;
            }
        } catch (error) {
            console.error('Menü öğeleri alınırken hata:', error);
            return [];
        }
    },

    createMenuItem: async (menuItem) => {
        try {
            try {

                const response = await axiosInstance.post('/menu', {
                    ...menuItem,
                    price: parseFloat(menuItem.price)
                });


                const storedItems = getStoredMenuItems();
                storeMenuItems([...storedItems, response.data]);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);


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

                const response = await axiosInstance.patch(`/menu/${id}`, {
                    ...menuItem,
                    price: parseFloat(menuItem.price)
                });


                const storedItems = getStoredMenuItems();
                const updatedItems = storedItems.map(item =>
                    item.id === id ? response.data : item
                );
                storeMenuItems(updatedItems);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);


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

                const response = await axiosInstance.delete(`/menu/${id}`);


                const storedItems = getStoredMenuItems();
                const remainingItems = storedItems.filter(item => item.id !== id);
                storeMenuItems(remainingItems);

                return response.data;
            } catch (apiError) {
                console.warn('API\'ye silme isteği gönderilemedi, localStorage\'dan siliniyor:', apiError);


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

                const response = await axiosInstance.patch(`/menu/${id}/toggle-availability`);


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