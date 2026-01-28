import { useState, useEffect, useRef } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
}

export const useCart = (restaurantId: string) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const initialLoadDone = useRef(false);

    // 1. Reset and Load cart when restaurantId changes
    useEffect(() => {
        if (!restaurantId) {
            setCart([]);
            setIsLoaded(false);
            initialLoadDone.current = false;
            return;
        }

        const loadCart = () => {
            const savedCart = localStorage.getItem(`cart_${restaurantId}`);
            if (savedCart) {
                try {
                    const parsed = JSON.parse(savedCart);
                    setCart(Array.isArray(parsed) ? parsed : []);
                } catch (e) {
                    console.error('Failed to parse cart', e);
                    setCart([]);
                }
            } else {
                setCart([]);
            }
            setIsLoaded(true);
            initialLoadDone.current = true;
        };

        loadCart();
    }, [restaurantId]);

    // 2. Save cart to localStorage whenever it changes, but ONLY after successful load
    useEffect(() => {
        if (!initialLoadDone.current || !restaurantId) return;

        localStorage.setItem(`cart_${restaurantId}`, JSON.stringify(cart));
    }, [cart, restaurantId]);

    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map((i) =>
                    i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
                );
            }
            return prev.filter((i) => i.id !== itemId);
        });
    };

    const clearCart = () => {
        setCart([]);
        if (restaurantId) {
            localStorage.removeItem(`cart_${restaurantId}`);
        }
    };

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
        isLoaded
    };
};
