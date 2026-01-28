import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface OrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    items: {
        name: string;
    };
}

export interface OrderWithDetails {
    id: string;
    status: 'pending' | 'preparing' | 'served' | 'paid';
    total_price: number;
    created_at: string;
    table_id: string | null;
    tables: {
        table_number: string;
    } | null;
    order_items: OrderItem[];
}

export const useStaffOrders = (restaurantId: string) => {
    const [orders, setOrders] = useState<OrderWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (!restaurantId) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    tables (table_number),
                    order_items (
                        id,
                        quantity,
                        unit_price,
                        items (name)
                    )
                `)
                .eq('restaurant_id', restaurantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching staff orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        if (!restaurantId) return;

        console.log(`Subscribing to real-time orders for restaurant: ${restaurantId}`);

        const channel = supabase
            .channel(`staff-orders-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${restaurantId}`,
                },
                (payload) => {
                    console.log('Order Change Received:', payload);
                    fetchOrders();
                }
            )
            .subscribe((status) => {
                console.log(`Order channel status for ${restaurantId}:`, status);
            });

        const itemsChannel = supabase
            .channel(`staff-items-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'order_items'
                },
                () => {
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(itemsChannel);
        };
    }, [restaurantId]);

    const updateOrderStatus = async (orderId: string, status: OrderWithDetails['status']) => {
        // Optimistic update
        const previousOrders = [...orders];
        setOrders(current =>
            current.map(o => o.id === orderId ? { ...o, status } : o)
        );

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;

            // Re-fetch to confirm exactly what's in DB
            await fetchOrders();
        } catch (error) {
            // Revert on error
            setOrders(previousOrders);
            console.error('Error updating order status:', error);
            throw error;
        }
    };

    return { orders, loading, updateOrderStatus, refresh: fetchOrders };
};
