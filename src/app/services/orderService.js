import axiosInstance from './axiosConfig';

// Test siparişleri için veri saklama süresi (5 saat = 5 * 60 * 60 * 1000 ms)
const ORDER_EXPIRY_TIME = 5 * 60 * 60 * 1000;

export const orderService = {
    async createOrder(orderData) {
        try {
            console.log('Sipariş servisi - Gönderilen veri:', orderData);


            if (!orderData || !orderData.items || !orderData.items.length) {
                throw new Error('Geçersiz sipariş verisi: Sepet boş veya ürün bilgileri eksik');
            }

            try {

                console.log('API isteği gönderiliyor...');
                const response = await axiosInstance.post('/orders', orderData);
                console.log('Sipariş servisi - API yanıtı:', response.data);


                if (response.data && response.data.id) {
                    console.log(`API siparişi başarıyla oluşturuldu. ID: ${response.data.id}`);


                    try {
                        const localOrders = this.getLocalOrders();
                        const apiOrder = {
                            ...response.data,
                            createdAt: response.data.createdAt || new Date().toISOString(),
                            isTestData: false // Bu gerçek bir API siparişi
                        };


                        localOrders.push(apiOrder);
                        localStorage.setItem('localOrders', JSON.stringify(localOrders));


                        localStorage.removeItem('cart');
                        localStorage.setItem('cart', '[]');
                    } catch (localError) {
                        console.warn('API siparişi oluşturuldu fakat yerel kopyalama başarısız:', localError);
                    }

                    return response.data;
                } else {

                    console.warn('API yanıtı geçersiz veya ID bulunamadı:', response.data);
                    console.warn('Yerel sipariş oluşturuluyor (API yanıtı geçersiz)');
                    const localOrder = this.createLocalOrder(orderData);
                    return localOrder;
                }
            } catch (apiError) {
                console.warn('API bağlantısı hatası:', apiError.message);
                console.warn('API hatası nedeniyle yerel sipariş oluşturuluyor');


                const result = this.createLocalOrder(orderData);
                return result;
            }
        } catch (error) {
            console.error('Sipariş oluşturma genel hata:', error.response?.data || error.message || error);


            const errorDetails = {
                message: error.message || 'Bilinmeyen hata',
                response: error.response?.data || 'Yanıt verisi yok',
                status: error.response?.status || 'Durum kodu yok'
            };
            console.error('Hata detayları:', errorDetails);


            throw new Error(`Sipariş oluşturma hatası: ${errorDetails.message}`);
        }
    },


    createLocalOrder(orderData) {
        try {
            const orderId = Date.now();


            const localOrders = this.getLocalOrders();


            const newOrder = {
                id: orderId,
                ...orderData,
                status: 'pending',
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + ORDER_EXPIRY_TIME).toISOString(),
                isTestData: true
            };


            localOrders.push(newOrder);
            localStorage.setItem('localOrders', JSON.stringify(localOrders));


            this.clearCartAfterOrder();

            console.log('Test sipariş oluşturuldu (API yok):', newOrder);
            return newOrder;
        } catch (error) {
            console.error('Yerel sipariş oluşturma hatası:', error);
            throw new Error('Yerel sipariş oluşturulamadı: ' + error.message);
        }
    },


    clearCartAfterOrder() {
        try {
            // 1. doğrudan removeItem ile temizle
            localStorage.removeItem('cart');

            // 2. boş bir array ile set et
            localStorage.setItem('cart', '[]');

            // 3. doğrulama kontrol yap
            const currentCart = localStorage.getItem('cart');
            if (currentCart && currentCart !== '[]') {
                console.warn('Sepet tam olarak temizlenemedi, zorla temizleniyor...');
                localStorage.setItem('cart', '[]');
            }

            console.log('Sipariş servisi: Sepet temizlendi');
            return true;
        } catch (error) {
            console.error('Sepet temizleme hatası:', error);

            // Son çare - başarısız olursa tekrar dene
            try {
                localStorage.setItem('cart', '[]');
            } catch (e) {
                console.error('İkinci temizleme denemesi de başarısız:', e);
            }

            return false;
        }
    },

    // Süresi dolmuş siparişleri temizle
    cleanExpiredOrders() {
        try {
            const localOrders = this.getLocalOrders();
            const now = new Date();

            const validOrders = localOrders.filter(order => {
                if (!order.expiresAt) return true;

                const expiryDate = new Date(order.expiresAt);
                return expiryDate > now;
            });

            if (validOrders.length !== localOrders.length) {
                console.log(`${localOrders.length - validOrders.length} süresi dolmuş sipariş temizlendi`);
                localStorage.setItem('localOrders', JSON.stringify(validOrders));
            }

            return validOrders;
        } catch (error) {
            console.error('Süresi geçmiş siparişleri temizleme hatası:', error);
            return [];
        }
    },

    // LocalStorage'dan siparişleri al
    getLocalOrders() {
        try {
            const ordersStr = localStorage.getItem('localOrders');
            if (!ordersStr) return [];

            return JSON.parse(ordersStr);
        } catch (error) {
            console.error('Yerel siparişleri okuma hatası:', error);
            return [];
        }
    },

    async getRestaurantOrders() {
        try {
            console.log('Restoran siparişleri isteniyor...');
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
            }

            const user = JSON.parse(userStr);
            console.log('Giriş yapmış kullanıcı:', user);
            console.log('Kullanılan token:', token);

            // İstek detaylarını logla
            console.log('GET isteği yapılıyor:', '/orders/restaurant');
            console.log('Headers:', {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            });

            try {
                const response = await axiosInstance.get('/orders/restaurant');
                console.log('Restoran siparişleri ham yanıt:', response);
                console.log('Restoran siparişleri yanıtı (data):', response.data);
                console.log('Toplam sipariş sayısı:', response.data?.length || 0);

                if (!response.data) {
                    throw new Error('Sunucudan geçersiz yanıt alındı');
                }

                // Siparişleri tarihe göre sırala (en yeni en üstte)
                const sortedOrders = response.data.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                // Sıralanmış siparişleri logla
                console.log('Sıralanmış siparişler:', sortedOrders);

                return sortedOrders;
            } catch (apiError) {
                console.warn('API bağlantısı başarısız, yerel sipariş verilerini kullanıyor:', apiError.message);

                // API bağlantısı yoksa, localStorage'daki siparişleri getir
                // Önce süresi geçen siparişleri temizle
                this.cleanExpiredOrders();

                // Giriş yapmış olan restorana ait siparişleri filtrele
                const restaurantId = parseInt(localStorage.getItem('restaurantId')) || user.restaurantId;

                if (!restaurantId) {
                    console.error('Restoran ID bulunamadı');
                    return [];
                }

                const localOrders = this.getLocalOrders().filter(order =>
                    order.restaurantId === restaurantId
                );

                // Siparişleri tarihe göre sırala (en yeni en üstte)
                const sortedOrders = localOrders.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                console.log(`Yerel depolamadan ${sortedOrders.length} restoran siparişi yüklendi (Test verisi)`);
                return sortedOrders;
            }
        } catch (error) {
            console.error('Restoran siparişleri yüklenirken hata detayı:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });

            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
            }
            throw error;
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            try {
                const response = await axiosInstance.put(`/orders/${orderId}/status`, { status });
                return response.data;
            } catch (apiError) {
                console.warn('API bağlantısı başarısız, yerel sipariş durumu güncelleniyor:', apiError.message);

                // Yerel siparişin durumunu güncelle
                return this.updateLocalOrderStatus(orderId, status);
            }
        } catch (error) {
            console.error('Sipariş durumu güncellenirken hata:', error);
            throw error;
        }
    },

    // Yerel sipariş durumunu güncelle
    updateLocalOrderStatus(orderId, status) {
        try {
            const localOrders = this.getLocalOrders();

            const updatedOrders = localOrders.map(order => {
                if (order.id === orderId) {
                    return { ...order, status };
                }
                return order;
            });

            localStorage.setItem('localOrders', JSON.stringify(updatedOrders));

            // Güncellenen siparişi döndür
            const updatedOrder = updatedOrders.find(order => order.id === orderId);
            console.log(`Yerel sipariş #${orderId} durumu güncellendi: ${status} (Test verisi)`);

            return updatedOrder;
        } catch (error) {
            console.error('Yerel sipariş durumu güncelleme hatası:', error);
            throw new Error('Sipariş durumu güncellenemedi');
        }
    },

    async getOrderById(orderId) {
        try {
            try {
                const response = await axiosInstance.get(`/orders/${orderId}`);
                return response.data;
            } catch (apiError) {
                console.warn('API bağlantısı başarısız, yerel sipariş detayını getiriyor:', apiError.message);

                // Yerel siparişi getir
                const localOrders = this.getLocalOrders();
                const order = localOrders.find(o => o.id === orderId);

                if (!order) {
                    throw new Error('Sipariş bulunamadı');
                }

                console.log(`Yerel depolamadan sipariş #${orderId} detayları yüklendi (Test verisi)`);
                return order;
            }
        } catch (error) {
            console.error('Sipariş detayları yüklenirken hata:', error);
            throw error;
        }
    },

    // Kullanıcının siparişlerini getir (müşteri sipariş geçmişi)
    async getUserOrders() {
        try {
            console.log('Kullanıcı siparişleri isteniyor...');

            // Kullanıcı oturum bilgilerini kontrol et
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                throw new Error('Oturum bulunamadı. Lütfen giriş yapın.');
            }

            const user = JSON.parse(userStr);
            console.log('Kullanıcı siparişleri için kullanıcı:', user.id, user.name);

            try {
                // Önce API'den veri almayı dene
                console.log('API\'den kullanıcı siparişleri alınıyor...');
                const response = await axiosInstance.get(`/orders/user/${user.id}`);

                if (response.data && Array.isArray(response.data)) {
                    console.log(`API'den ${response.data.length} kullanıcı siparişi alındı`);

                    // Siparişleri tarihe göre sırala (en yeni en üstte)
                    const sortedOrders = response.data.sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );

                    return sortedOrders;
                } else {
                    console.warn('API geçersiz veri döndürdü:', response.data);
                    throw new Error('Geçersiz API yanıtı');
                }
            } catch (apiError) {
                console.warn('API bağlantısı başarısız, yerel siparişler kullanılacak:', apiError.message);

                // API bağlantısı yoksa localStorage'dan siparişleri getir
                // Önce süresi dolmuş siparişleri temizle
                this.cleanExpiredOrders();

                // Kullanıcıya ait siparişleri filtrele
                const localOrders = this.getLocalOrders().filter(order =>
                    order.userId === user.id
                );

                console.log(`Yerel depolamadan ${localOrders.length} kullanıcı siparişi bulundu`);

                // Yeterli test verisi yoksa örnek veriler oluştur
                if (localOrders.length === 0) {
                    console.log('Hiç sipariş bulunamadı, örnek veriler gösteriliyor');
                    return this.getExampleUserOrders(user.id);
                }

                // Siparişleri tarihe göre sırala
                return localOrders.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
            }
        } catch (error) {
            console.error('Kullanıcı siparişleri yüklenirken hata:', error);

            // Hata durumunda örnek verileri göster
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    console.log('Hata durumunda örnek siparişler gösteriliyor');
                    return this.getExampleUserOrders(user.id);
                }
            } catch (e) {
                console.error('Örnek sipariş oluşturma hatası:', e);
            }

            // Her türlü hata durumunda boş liste döndür
            return [];
        }
    },

    // Örnek kullanıcı siparişleri oluştur (hiç sipariş yoksa gösterilir)
    getExampleUserOrders(userId) {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);

        return [
            {
                id: `sample-${Date.now()}-1`,
                userId: userId,
                restaurantId: 1,
                restaurant: {
                    id: 1,
                    name: "Lezzet Durağı"
                },
                status: "preparing",
                createdAt: now.toISOString(),
                totalAmount: 120,
                items: [
                    {
                        id: 1,
                        name: "Adana Kebap",
                        price: 120,
                        quantity: 1
                    }
                ],
                customerName: "Test Müşteri",
                isTestData: true,
                statusText: "Hazırlanıyor",
                estimatedDelivery: "30 dakika içinde"
            },
            {
                id: `sample-${Date.now()}-2`,
                userId: userId,
                restaurantId: 2,
                restaurant: {
                    id: 2,
                    name: "Pizza Palace"
                },
                status: "delivered",
                createdAt: yesterday.toISOString(),
                deliveredAt: yesterday.toISOString(),
                totalAmount: 90,
                items: [
                    {
                        id: 5,
                        name: "Margarita Pizza",
                        price: 90,
                        quantity: 1
                    }
                ],
                customerName: "Test Müşteri",
                isTestData: true,
                statusText: "Teslim Edildi"
            },
            {
                id: `sample-${Date.now()}-3`,
                userId: userId,
                restaurantId: 3,
                restaurant: {
                    id: 3,
                    name: "Burger House"
                },
                status: "cancelled",
                createdAt: lastWeek.toISOString(),
                cancelledAt: lastWeek.toISOString(),
                totalAmount: 75,
                items: [
                    {
                        id: 10,
                        name: "Cheeseburger Menü",
                        price: 75,
                        quantity: 1
                    }
                ],
                customerName: "Test Müşteri",
                isTestData: true,
                statusText: "İptal Edildi"
            }
        ];
    }
}; 