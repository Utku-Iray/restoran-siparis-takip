import axios from 'axios';

// Backend API URL'i
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Bağlantı problemi durumunda daha açıklayıcı log mesajları
const logAxiosError = (error) => {
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        console.error(`
        =====================================================
        API Bağlantı Hatası: ${error.code}
        -----------------------------------------------------
        Bu hata API sunucusuna erişilemediğini gösteriyor.
        
        Olası çözümler:
        1. API sunucunuzun (${API_URL}) çalıştığından emin olun
        2. localStorage ile devam etmek için sayfayı yenileyin
        3. API'yi başlatmadan sadece localStorage ile çalışabilirsiniz
        =====================================================
        `);
    } else if (error.response) {
        // Sunucu cevap döndü, ancak hata kodu döndü
        console.error(`API Hatası: ${error.response.status} - ${error.response.statusText}`);
        console.error('Hata Detayları:', error.response.data);
    } else if (error.request) {
        // İstek yapıldı, ancak sunucudan hiç cevap gelmedi
        console.error('Sunucudan cevap alınamadı');
    } else {
        // İstek yapılırken bir şeyler ters gitti
        console.error('Axios Error:', error.message);
    }
    return error;
};

// Axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Zaman aşımı süresini azaltarak bağlantı problemlerinde daha hızlı hata vermesini sağlayalım
    timeout: 5000, // 5 saniye
});

// İstek öncesi interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Token ekle
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // menu-items endpoint'ini menu_item endpoint'ine çevir
        if (config.url && config.url.includes('menu-items')) {
            config.url = config.url.replace('menu-items', 'menu_item');
            console.log(`URL düzeltildi: ${config.url}`);
        }

        return config;
    },
    (error) => {
        logAxiosError(error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
        }

        logAxiosError(error);
        return Promise.reject(error);
    }
);

export default axiosInstance; 