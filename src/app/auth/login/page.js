'use client';

import { useState } from "react";
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const { login, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!email || !password) {
            setErrorMessage("Email ve şifre gereklidir.");
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await login(email, password);
            if (success) {
                // Başarılı giriş - yönlendirme AuthContext'te yapılıyor
                return;
            } else {
                setErrorMessage("Giriş başarısız. Lütfen email ve şifrenizi kontrol edin.");
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(error.message || "Giriş yapılırken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="w-24 h-24 mx-auto bg-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Hesabınıza Giriş Yapın
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Veya{' '}
                    <Link href="/auth/register" className="font-medium text-pink-600 hover:text-pink-500">
                        yeni hesap oluşturun
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                <span className="block sm:inline">{errorMessage}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                E-posta adresi
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Şifre
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Beni hatırla
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/auth/forgot-password" className="font-medium text-pink-600 hover:text-pink-500">
                                    Şifremi unuttum
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting || loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Test Hesapları</span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="text-sm text-gray-600">
                                <strong>Admin:</strong> admin@example.com
                            </div>
                            <div className="text-sm text-gray-600">
                                <strong>Restoran:</strong> restaurant@example.com
                            </div>
                            <div className="text-sm text-gray-600">
                                <strong>Müşteri:</strong> user@example.com
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                (Şifre alanı şu an için kontrol edilmiyor)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
