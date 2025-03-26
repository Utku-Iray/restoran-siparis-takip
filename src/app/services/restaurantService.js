import axiosInstance from './axiosConfig';

// Geçici olarak localStorage'dan veri almak için yardımcı fonksiyon
const getStoredRestaurantData = () => {
    if (typeof window === 'undefined') return null;

    const storedData = localStorage.getItem('restaurantData');
    return storedData ? JSON.parse(storedData) : null;
};

// Geçici olarak localStorage'a veri kaydetmek için yardımcı fonksiyon
const storeRestaurantData = (data) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('restaurantData', JSON.stringify(data));
};

export const restaurantService = {
    // Tüm restoranları getir
    getAllRestaurants: async () => {
        try {
            const response = await axiosInstance.get('/restaurants');
            return response.data;
        } catch (error) {
            console.error('Restoranlar alınırken hata:', error);
            throw error;
        }
    },

    // Bir restoranın detaylarını getir
    getRestaurantById: async () => {
        try {
            // Önce backend API'den veri almayı dene
            try {
                const response = await axiosInstance.get('/restaurants');
                // Başarılı olursa, localStorage'a kaydet ve döndür
                storeRestaurantData(response.data);
                return response.data;
            } catch (apiError) {
                console.warn('API\'den veri alınamadı, localStorage\'dan veri okunuyor:', apiError);

                // API'den veri alınamazsa, localStorage'dan oku
                const storedData = getStoredRestaurantData();
                if (storedData) {
                    console.log('localStorage\'dan veri yüklendi:', storedData);
                    return storedData;
                }

                // Eğer localStorage'da da veri yoksa, API hatasını fırlat
                throw apiError;
            }
        } catch (error) {
            console.error(`Restoran bilgileri alınırken hata:`, error);
            throw error;
        }
    },

    // Bir restoranın menü öğelerini getir
    getRestaurantMenu: async (id) => {
        try {
            const response = await axiosInstance.get(`/menu/restaurant/${id}`);
            const items = response.data.map(item => ({
                ...item,
                price: parseFloat(item.price)
            }));
            return items;
        } catch (error) {
            console.error(`Restoran menüsü alınırken hata (ID: ${id}):`, error);
            throw error;
        }
    },

    // Restoran bilgilerini güncelle
    updateRestaurant: async (restaurantData) => {
        try {
            // Önce backend API'ye veri göndermeyi dene
            try {
                console.log(`Restoran bilgileri güncelleniyor:`, restaurantData);
                const response = await axiosInstance.patch('/restaurants', restaurantData);

                // Başarılı olursa, localStorage'a kaydet ve döndür
                storeRestaurantData(restaurantData);
                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);

                // API'ye veri gönderilemezse, localStorage'a kaydet
                storeRestaurantData(restaurantData);
                return restaurantData; // Başarılı bir cevap simüle et
            }
        } catch (error) {
            console.error(`Restoran bilgileri güncellenirken hata:`, error);
            throw error;
        }
    }
}; 