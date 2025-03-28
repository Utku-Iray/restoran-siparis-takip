'use client'

import { useCart } from '@/app/context/CartContext'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

const CardComponent = ({ isOpen, onClose }) => {
    // Güvenli hook kullanımı için default değerler
    const cart = useCart() || { items: [], removeFromCart: () => { }, updateQuantity: () => { }, total: 0 }
    const { items, removeFromCart, updateQuantity, total } = cart

    const [isMounted, setIsMounted] = useState(false)

    // Client tarafında mount olduğunu kontrol et
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Server tarafında render edilmemesi için
    if (!isMounted) {
        return null // Boş sepet placeholder
    }

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity z-40"
                    onClick={onClose}
                />
            )}

            {/* Card */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">Sepetim ({items.length})</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg
                                className="w-5 h-5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto py-6 px-4">
                        {items.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4">
                                    <svg className="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 mb-4">Sepetiniz şu an boş</p>
                                <button
                                    onClick={onClose}
                                    className="text-red-600 hover:text-red-700 font-medium transition-colors"
                                >
                                    Alışverişe Başla
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center space-x-4 bg-white border border-black p-4 rounded-lg hover:border-black transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-500">{item.price} ₺</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                className="w-8 h-8 flex items-center justify-center border border-black rounded-full text-black hover:bg-gray-50 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-medium text-black">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center border text-black border-black rounded-full hover:bg-gray-50 transition-colors"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-gray-100 p-6 space-y-4 bg-white">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Toplam</span>
                                <span className="text-2xl font-bold text-gray-800">{total} ₺</span>
                            </div>
                            <Link
                                href="/cart"
                                className="block w-full bg-red-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                onClick={onClose}
                            >
                                Sepete Git
                            </Link>
                            <button
                                onClick={onClose}
                                className="block w-full bg-gray-50 text-gray-800 text-center py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Alışverişe Devam Et
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

// Server tarafında boş placeholder, client tarafında gerçek bileşen
const Card = dynamic(() => Promise.resolve(CardComponent), {
    ssr: false,
});

export default Card; 