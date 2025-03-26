import axiosInstance from './axiosConfig';

export const orderService = {
    async createOrder(orderData) {
        try {
            console.log('Sipariş servisi - Gönderilen veri:', orderData);
            const response = await axiosInstance.post('/orders', orderData);
            console.log('Sipariş servisi - Yanıt:', response.data);
            return response.data;
        } catch (error) {
            console.error('Sipariş servisi - Hata:', error.response?.data || error);
            throw error;
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
            const response = await axiosInstance.put(`/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Sipariş durumu güncellenirken hata:', error);
            throw error;
        }
    },

    async getOrderById(orderId) {
        try {
            const response = await axiosInstance.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Sipariş detayları yüklenirken hata:', error);
            throw error;
        }
    }
}; 