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

// Sample veriler - API bağlantısı olmadığında kullanılacak
const sampleRestaurants = [
    {
        id: 1,
        name: "Lezzet Dünyası",
        description: "Türk ve dünya mutfağından seçkin lezzetler",
        rating: 4.5,
        imageUrl: '/image/restaurant1.jpg',
        cuisine: "Türk Mutfağı",
        deliveryTime: "30-45 dk"
    },
    {
        id: 2,
        name: "Pizza Express",
        description: "En lezzetli İtalyan pizzaları",
        rating: 4.2,
        imageUrl: '/image/restaurant2.jpg',
        cuisine: "İtalyan Mutfağı",
        deliveryTime: "25-40 dk"
    },
    {
        id: 3,
        name: "Sushi Master",
        description: "Autentik Japon lezzetleri",
        rating: 4.8,
        imageUrl: '/image/restaurant3.jpg',
        cuisine: "Japon Mutfağı",
        deliveryTime: "35-50 dk"
    }
];

export const restaurantService = {
    // Tüm restoranları getir
    getAllRestaurants: async () => {
        if (typeof window === 'undefined') {
            return sampleRestaurants;
        }

        try {
            // Token kontrolü
            const token = localStorage.getItem('token');

            // Eğer token varsa, API'den restoranları çek
            if (token) {
                console.log('Token bulundu, restoranlar API\'den yükleniyor...');
                try {
                    const response = await axiosInstance.get('/restaurants');
                    console.log('Restoranlar başarıyla alındı:', response.data);
                    return response.data;
                } catch (error) {
                    console.warn('Giriş yapılmış olmasına rağmen API hatası:', error);
                    return sampleRestaurants;
                }
            } else {
                console.log('Token bulunamadı, örnek veriler kullanılıyor');
                return sampleRestaurants;
            }
        } catch (error) {
            console.error('Restoranlar alınırken hata:', error);
            return sampleRestaurants;
        }
    },

    getRestaurantById: async (id) => {
        try {
            // Token kontrolü
            const token = localStorage?.getItem('token');

            if (token) {
                try {
                    const response = await axiosInstance.get(`/restaurants/${id}`);
                    return response.data;
                } catch (apiError) {
                    console.warn(`Restoran (ID: ${id}) bilgileri API'den alınamadı:`, apiError);

                    // Tek bir restoran için örnek veri
                    return sampleRestaurants.find(r => r.id.toString() === id.toString()) || {
                        id: id,
                        name: "Örnek Restoran",
                        description: "API bağlantısı olmadığında gösterilen örnek restoran",
                        rating: 4.0,
                        imageUrl: '/image/default-restaurant.jpg',
                        cuisine: "Karma Mutfak",
                        deliveryTime: "30-45 dk"
                    };
                }
            } else {
                const restaurant = sampleRestaurants.find(r => r.id.toString() === id.toString());
                if (restaurant) {
                    return restaurant;
                }

                return {
                    id: id,
                    name: "Örnek Restoran",
                    description: "API bağlantısı olmadığında gösterilen örnek restoran",
                    rating: 4.0,
                    imageUrl: '/image/default-restaurant.jpg',
                    cuisine: "Karma Mutfak",
                    deliveryTime: "30-45 dk"
                };
            }
        } catch (error) {
            console.error(`Restoran bilgileri alınırken hata:`, error);
            throw error;
        }
    },

    getRestaurantMenu: async (id) => {
        if (typeof window === 'undefined') {
            return [];
        }

        const sampleMenuItems = {
            1: [
                {
                    id: 101,
                    name: "Adana Kebap",
                    description: "Özel baharatlarla hazırlanmış el yapımı kebap",
                    price: 120,
                    image: "/image/kebap.jpg",
                    category: "Ana Yemekler",
                    restaurantId: 1
                },
                {
                    id: 102,
                    name: "Mercimek Çorbası",
                    description: "Geleneksel tarif ile hazırlanmış mercimek çorbası",
                    price: 45,
                    image: "/image/mercimek-corbasi.jpg",
                    category: "Çorbalar",
                    restaurantId: 1
                },
                {
                    id: 103,
                    name: "İçli Köfte",
                    description: "Ev yapımı lezzetli içli köfte",
                    price: 35,
                    image: "/image/icli-kofte.jpg",
                    category: "Mezeler",
                    restaurantId: 1
                }
            ],
            2: [
                {
                    id: 201,
                    name: "Margarita Pizza",
                    description: "Domates, mozzarella ve fesleğen ile",
                    price: 90,
                    image: "/image/pizza.jpg",
                    category: "Pizzalar",
                    restaurantId: 2
                },
                {
                    id: 202,
                    name: "Spagetti Bolonez",
                    description: "Özel soslu spagetti",
                    price: 75,
                    image: "/image/makarna.jpg",
                    category: "Makarnalar",
                    restaurantId: 2
                }
            ],
            3: [
                {
                    id: 301,
                    name: "Karışık Sushi Tabağı",
                    description: "8 adet farklı çeşitlerden oluşan tabak",
                    price: 180,
                    image: "/image/sushi.jpg",
                    category: "Sushi",
                    restaurantId: 3
                },
                {
                    id: 302,
                    name: "Kahvaltı Tabağı",
                    description: "Zengin içerikli kahvaltı tabağı",
                    price: 95,
                    image: "/image/kahvalti.jpg",
                    category: "Kahvaltı",
                    restaurantId: 3
                }
            ]
        };

        try {
            const token = localStorage?.getItem('token');

            if (token) {
                try {
                    const response = await axiosInstance.get(`/menu/restaurant/${id}`);
                    const items = response.data.map(item => ({
                        ...item,
                        price: parseFloat(item.price)
                    }));
                    console.log(`Restoran (ID: ${id}) menüsü API'den yüklendi:`, items.length, "adet ürün");
                    return items;
                } catch (apiError) {
                    console.warn(`Restoran (ID: ${id}) menüsü API'den alınamadı, örnek menü kullanılıyor:`, apiError);

                    const menuId = id.toString();
                    if (sampleMenuItems[menuId]) {
                        return sampleMenuItems[menuId];
                    }

                    return [
                        {
                            id: 999,
                            name: "Örnek Yemek",
                            description: "API bağlantısı olmadığından örnek yemek gösteriliyor",
                            price: 50,
                            image: "/image/default-restaurant.jpg",
                            category: "Genel",
                            restaurantId: parseInt(id)
                        }
                    ];
                }
            } else {
                console.log(`Token bulunamadı, restoran (ID: ${id}) için örnek menü kullanılıyor`);
                const menuId = id.toString();
                if (sampleMenuItems[menuId]) {
                    return sampleMenuItems[menuId];
                }

                return [
                    {
                        id: 999,
                        name: "Örnek Yemek",
                        description: "API bağlantısı olmadığından örnek yemek gösteriliyor",
                        price: 50,
                        image: "/image/default-restaurant.jpg",
                        category: "Genel",
                        restaurantId: parseInt(id)
                    }
                ];
            }
        } catch (error) {
            console.error(`Restoran menüsü alınırken hata (ID: ${id}):`, error);
            return [];
        }
    },

    updateRestaurant: async (restaurantData) => {
        try {
            try {
                console.log(`Restoran bilgileri güncelleniyor:`, restaurantData);
                const response = await axiosInstance.patch('/restaurants', restaurantData);

                storeRestaurantData(restaurantData);
                return response.data;
            } catch (apiError) {
                console.warn('API\'ye veri gönderilemedi, localStorage\'a kaydediliyor:', apiError);


                storeRestaurantData(restaurantData);
                return restaurantData;
            }
        } catch (error) {
            console.error(`Restoran bilgileri güncellenirken hata:`, error);
            throw error;
        }
    }
}; 