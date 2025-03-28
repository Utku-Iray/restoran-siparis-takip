'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

// Örnek kullanıcılar - API bağlantısı olmadığında kullanılacak
const SAMPLE_USERS = [
    // Restoran kullanıcıları - restoranService'teki restoranlar ile eşleşiyor
    {
        id: 1,
        email: "restaurant1@example.com",
        password: "password",
        name: "Lezzet Dünyası",
        role: "restaurant",
        restaurantId: 1
    },
    {
        id: 2,
        email: "restaurant2@example.com",
        password: "password",
        name: "Pizza Express",
        role: "restaurant",
        restaurantId: 2
    },
    {
        id: 3,
        email: "restaurant3@example.com",
        password: "password",
        name: "Sushi Master",
        role: "restaurant",
        restaurantId: 3
    },
    // Normal kullanıcı
    {
        id: 4,
        email: "user@example.com",
        password: "password",
        name: "Örnek Müşteri",
        role: "user"
    },
    // Admin kullanıcı
    {
        id: 5,
        email: "admin@example.com",
        password: "password",
        name: "Site Yöneticisi",
        role: "admin"
    }
];

const defaultContextValue = {
    user: null,
    loading: true,
    login: () => Promise.resolve(false),
    logout: () => Promise.resolve(),
    register: () => Promise.resolve(false),
    checkRole: () => false,
    updateUserInfo: () => { }
};

const AuthContext = createContext(defaultContextValue);

export function AuthProvider({ children }) {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            if (typeof window !== 'undefined') {
                try {
                    const storedUser = localStorage?.getItem('user')
                    if (storedUser) {
                        const parsedUser = JSON.parse(storedUser)
                        setUser(parsedUser)


                        const pathname = window.location.pathname


                        if (pathname === '/' || pathname.startsWith('/auth/')) {
                            if (parsedUser.role === 'admin') {
                                router.push('/admin')
                            } else if (parsedUser.role === 'restaurant') {
                                router.push('/restaurant-panel')
                            }
                        }
                    }
                } catch (error) {
                    console.error('User loading error:', error)
                } finally {
                    setLoading(false)
                }
            } else {
                setLoading(false)
            }
        }

        checkUser()
    }, [])

    const login = async (email, password) => {
        if (!email || !password) {
            throw new Error('Email ve şifre gereklidir');
        }

        try {
            try {
                const response = await fetch('http://localhost:3001/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'Giriş başarısız')
                }

                if (!data.user || !data.access_token) {
                    throw new Error('Sunucudan geçersiz yanıt alındı')
                }

                localStorage.setItem('token', data.access_token)
                localStorage.setItem('user', JSON.stringify(data.user))
                setUser(data.user)

                if (data.user.role === 'admin') {
                    router.push('/admin');
                } else if (data.user.role === 'restaurant') {
                    router.push('/restaurant-panel');
                }

                return true
            } catch (apiError) {
                console.warn('API bağlantısı başarısız, örnek kullanıcılar kontrol ediliyor:', apiError.message)

                const foundUser = SAMPLE_USERS.find(
                    user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
                )

                if (!foundUser) {
                    throw new Error('Geçersiz kullanıcı adı veya şifre')
                }

                const fakeToken = `fake_token_${foundUser.id}_${Date.now()}`

                const userData = { ...foundUser }
                delete userData.password // Şifreyi client'a gönderme

                localStorage.setItem('token', fakeToken)
                localStorage.setItem('user', JSON.stringify(userData))

                if (userData.role === 'restaurant' && userData.restaurantId) {
                    localStorage.setItem('restaurantId', userData.restaurantId)
                    localStorage.setItem('restaurantName', userData.name)
                }

                setUser(userData)
                console.log('Örnek verilerle giriş yapıldı. Kullanıcı:', userData.name)

                if (userData.role === 'admin') {
                    router.push('/admin');
                } else if (userData.role === 'restaurant') {
                    router.push('/restaurant-panel');
                }

                return true
            }
        } catch (error) {
            console.error('Login error:', error)

            if (error.message === 'Failed to fetch') {
                throw new Error('Sunucu bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edin veya örnek hesaplardan birini kullanın.')
            }

            throw error
        }
    }

    const logout = async () => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('restaurantId')
                localStorage.removeItem('restaurantName')
            }
            setUser(null)

            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const register = async (email, password, name, role) => {
        try {
            setLoading(true)

            try {
                const response = await axios.post('http://localhost:3001/auth/register', {
                    email,
                    password,
                    name,
                    role
                })

                const { access_token, user } = response.data
                localStorage.setItem('token', access_token)
                localStorage.setItem('user', JSON.stringify(user))
                setUser(user)

                if (user.role === 'admin') {
                    router.push('/admin');
                } else if (user.role === 'restaurant') {
                    router.push('/restaurant-panel');
                }

                return true
            } catch (apiError) {
                console.warn('API bağlantısı başarısız, örnek kayıt yapılıyor:', apiError.message)


                const isEmailTaken = SAMPLE_USERS.some(user => user.email.toLowerCase() === email.toLowerCase())

                if (isEmailTaken) {
                    throw new Error('Bu e-posta adresi zaten kullanılıyor.')
                }

                const newUserId = SAMPLE_USERS.length + 1

                const fakeToken = `fake_token_${newUserId}_${Date.now()}`

                const newUser = {
                    id: newUserId,
                    email,
                    name,
                    role,
                    ...(role === 'restaurant' ? { restaurantId: newUserId } : {})
                }

                localStorage.setItem('token', fakeToken)
                localStorage.setItem('user', JSON.stringify(newUser))

                if (role === 'restaurant') {
                    localStorage.setItem('restaurantId', newUser.restaurantId.toString())
                    localStorage.setItem('restaurantName', name)
                }

                setUser(newUser)
                console.log('Örnek verilerle kayıt yapıldı. Kullanıcı:', newUser.name)

                if (role === 'admin') {
                    router.push('/admin');
                } else if (role === 'restaurant') {
                    router.push('/restaurant-panel');
                }

                return true
            }
        } catch (error) {
            console.error('Register error:', error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const updateUserInfo = (updateData) => {
        if (!user) return;

        try {
            const updatedUser = { ...user, ...updateData };

            localStorage.setItem('user', JSON.stringify(updatedUser));

            setUser(updatedUser);

            console.log('Kullanıcı bilgileri güncellendi:', updatedUser);
        } catch (error) {
            console.error('User info update error:', error);
        }
    };

    const checkRole = (allowedRoles) => {
        if (!user) return false;
        return allowedRoles.includes(user.role);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, checkRole, updateUserInfo }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const isServer = typeof window === 'undefined';

    if (isServer) {
        console.log("Server tarafında useAuth kullanımı - varsayılan değerler döndürülüyor");
        return defaultContextValue;
    }

    const context = useContext(AuthContext);
    if (!context) {
        console.error("useAuth hook'u bir AuthProvider içinde kullanılmalıdır");
        return defaultContextValue;
    }

    return context;
} 