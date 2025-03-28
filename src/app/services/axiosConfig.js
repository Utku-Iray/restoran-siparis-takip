import axios from 'axios';

// Backend API URL'i
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const fixImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    if (url.startsWith('data:image/')) {
        return url;
    }

    if (url.startsWith('/')) {

        return url;
    }

    return `/image/${url}`;
};

export const prepareImageForDB = (imageUrl) => {
    if (!imageUrl) return null;

    if (imageUrl.startsWith('data:image/')) {
        return imageUrl;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    if (imageUrl.startsWith('/')) {
        if (imageUrl.startsWith('/image/')) {
            return imageUrl.substring(1); // /image/sushi.jpg -> image/sushi.jpg
        }
        return imageUrl.substring(1);
    }

    if (imageUrl.startsWith('image/')) {
        return imageUrl; // Zaten doğru formatsa olduğu gibi bırak
    }

    return `image/${imageUrl}`;
};

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
        console.error(`API Hatası: ${error.response.status} - ${error.response.statusText}`);
        console.error('Hata Detayları:', error.response.data);
    } else if (error.request) {

        console.error('Sunucudan cevap alınamadı');
    } else {

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

    timeout: 5000, // 5 saniye
});

axiosInstance.interceptors.request.use(
    (config) => {

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
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
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                console.error('Kimlik doğrulama hatası: 401 Yetkisiz erişim');

            }
        }

        logAxiosError(error);
        return Promise.reject(error);
    }
);

export const checkApiHealth = async () => {
    try {

        const response = await axiosInstance.get('/health', { timeout: 5000 });
        return response.status === 200;
    } catch (error) {
        console.warn('API sağlık kontrolü başarısız:', error.message);
        return false;
    }
};

export default axiosInstance; 