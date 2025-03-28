'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const defaultCartValue = {
    items: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    total: 0,
    isCartOpen: false,
    setIsCartOpen: () => { }
};

const CartContext = createContext(defaultCartValue);

export function CartProvider({ children }) {
    const [items, setItems] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)

    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart')
            if (savedCart) {
                setItems(JSON.parse(savedCart))
            }
        } catch (error) {
            console.error('Sepet yükleme hatası:', error);
            setItems([]);
        }
    }, [])

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(items))
        } catch (error) {
            console.error('Sepet kaydetme hatası:', error);
        }
    }, [items])

    const addToCart = (item) => {
        if (!item) return; // Geçersiz öğe kontrolü

        setItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id)
            if (existingItem) {
                return prevItems.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prevItems, { ...item, quantity: 1 }]
        })

        setIsCartOpen(true)
    }

    const removeFromCart = (itemId) => {
        if (!itemId) return; // Geçersiz ID kontrolü
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
    }

    const updateQuantity = (itemId, quantity) => {
        if (!itemId || quantity < 1) return; // Geçersiz değerler kontrolü
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        try {
            setItems([]);

            if (typeof window !== 'undefined') {
                localStorage.removeItem('cart');
                localStorage.setItem('cart', '[]');

                const checkCart = localStorage.getItem('cart');
                if (checkCart && checkCart !== '[]') {
                    console.warn('Sepet tam olarak temizlenemedi, zorla temizleniyor...');
                    localStorage.setItem('cart', '[]');
                }

                console.log('Sepet başarıyla temizlendi');
            }
        } catch (error) {
            console.error('Sepet temizleme hatası:', error);
            try {
                localStorage.removeItem('cart');
                localStorage.setItem('cart', '[]');
            } catch (e) {
                console.error('Acil temizleme hatası:', e);
            }
        }
    }

    const total = items?.length > 0
        ? items.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0)
        : 0

    const value = {
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        isCartOpen,
        setIsCartOpen
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const isServer = typeof window === 'undefined';

    if (isServer) {
        console.log("Server tarafında useCart kullanımı - varsayılan değerler döndürülüyor");
        return defaultCartValue;
    }

    const context = useContext(CartContext);
    if (!context) {
        console.error("useCart hook'u bir CartProvider içinde kullanılmalıdır");
        return defaultCartValue;
    }

    return context;
} 