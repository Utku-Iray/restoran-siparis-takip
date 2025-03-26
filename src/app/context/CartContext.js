'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [items, setItems] = useState([])

    // Sayfa yüklendiğinde localStorage'dan sepeti yükle
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            setItems(JSON.parse(savedCart))
        }
    }, [])

    // Sepet değiştiğinde localStorage'a kaydet
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addToCart = (item) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id)
            if (existingItem) {
                return prevItems.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prevItems, { ...item, quantity: 1 }]
        })
    }

    const removeFromCart = (itemId) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
    }

    const updateQuantity = (itemId, quantity) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
        localStorage.removeItem('cart')
    }

    const total = items?.length > 0
        ? items.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0)
        : 0

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                total,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
} 