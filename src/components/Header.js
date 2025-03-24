'use client'

import Link from 'next/link'
import { useCart } from '@/app/context/CartContext'
import { useState } from 'react'
import Card from './Card'

export default function Header() {
    const { items } = useCart()
    const [language, setLanguage] = useState('TR')
    const [isCartOpen, setIsCartOpen] = useState(false)

    return (
        <>
            <header className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="text-xl font-semibold">
                            Logo
                        </Link>

                        <nav className="hidden md:flex items-center space-x-8">
                            <Link href="/menu" className="text-gray-700 hover:text-gray-900">
                                Menü
                            </Link>
                            <Link href="/hakkimizda" className="text-gray-700 hover:text-gray-900">
                                Hakkımızda
                            </Link>
                            <Link href="/contact" className="text-gray-700 hover:text-gray-900">
                                İletişim
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <Link
                                href="/auth/login"
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Giriş Yap
                            </Link>
                            <Link
                                href="/auth/register"
                                className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600"
                            >
                                Kayıt Ol
                            </Link>

                            <div className="relative">
                                <button className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-md">
                                    <svg
                                        className="w-4 h-4 text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">{language}</span>
                                </button>
                            </div>

                            <button onClick={() => setIsCartOpen(true)} className="relative p-2">
                                <svg
                                    className="w-6 h-6 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                {items.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                        {items.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <Card isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    )
} 