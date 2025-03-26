'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // İlk yüklemede localStorage'dan kullanıcı bilgisini al
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    // Giriş fonksiyonu
    const login = async (email, password) => {
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

            // Kullanıcı rolüne göre yönlendirme
            if (data.user.role === 'admin') {
                router.push('/admin')
            } else if (data.user.role === 'restaurant') {
                router.push('/restaurant-panel')
            } else {
                router.push('/')
            }

            return true
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    // Çıkış fonksiyonu
    const logout = async () => {
        try {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('restaurantId')
            localStorage.removeItem('restaurantName')
            setUser(null)
            router.push('/auth/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    // Kayıt fonksiyonu
    const register = async (email, password, name, role) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3001/auth/register', {
                email,
                password,
                name,
                role
            });

            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            // Kullanıcıyı rolüne göre yönlendir
            if (user.role === 'admin') {
                router.push('/admin');
            } else if (user.role === 'restaurant') {
                router.push('/restaurant-panel');
            } else {
                router.push('/');
            }

            return true;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    // Kullanıcı bilgilerini güncelleme fonksiyonu
    const updateUserInfo = (updateData) => {
        if (!user) return;

        try {
            // Mevcut kullanıcı bilgilerini al
            const updatedUser = { ...user, ...updateData };

            // LocalStorage'da güncelle
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // State'i güncelle
            setUser(updatedUser);

            console.log('Kullanıcı bilgileri güncellendi:', updatedUser);
        } catch (error) {
            console.error('User info update error:', error);
        }
    };

    // Rol kontrolü
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
    return useContext(AuthContext)
} 