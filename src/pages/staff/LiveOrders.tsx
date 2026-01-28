import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useStaffOrders, OrderWithDetails } from '../../hooks/useStaffOrders';
import {
    Clock,
    CheckCircle2,
    ChefHat,
    Truck,
    AlertCircle,
    MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const LiveOrders: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const { orders, loading, updateOrderStatus } = useStaffOrders(restaurantId || '');

    useEffect(() => {
        const resolveRestaurant = async () => {
            if (!slug) return;
            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('slug', slug)
                .single();

            if (restaurant) setRestaurantId(restaurant.id);
        };
        resolveRestaurant();
    }, [slug]);

    // ... imports stay same
    const columns = [
        { id: 'pending', name: 'À Préparer', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        { id: 'preparing', name: 'En Cuisine', icon: ChefHat, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { id: 'served', name: 'Servi / Prêt', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    ];

    const getOrdersByStatus = (status: string) => orders.filter(o => o.status === status);

    const handleNextStatus = async (order: OrderWithDetails) => {
        try {
            const statusMap: Record<string, OrderWithDetails['status']> = {
                'pending': 'preparing',
                'preparing': 'served',
                'served': 'paid'
            };
            const next = statusMap[order.status];
            if (next) {
                console.log(`Updating order ${order.id} to ${next}`);
                await updateOrderStatus(order.id, next);
            }
        } catch (err: any) {
            console.error('Failed to update status:', err);
            alert('Impossible de mettre à jour le statut : ' + err.message);
        }
    };

    if (loading && !restaurantId) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-black italic uppercase tracking-widest text-white/50 text-xs">Initialisation Service...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 h-full flex flex-col">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none mb-4">
                        COMMANDES <span className="text-blue-500">LIVE</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Service en cours</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-[#111113] px-6 py-4 rounded-[1.5rem] border border-white/5 shadow-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-1">Total En Attente</span>
                        <span className="text-2xl font-black italic text-white">{getOrdersByStatus('pending').length + getOrdersByStatus('preparing').length}</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-6 px-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-2xl ${col.bg} ${col.color} border ${col.border}`}>
                                    <col.icon size={18} strokeWidth={3} />
                                </div>
                                <h2 className="text-xl font-black italic uppercase tracking-tight text-white">{col.name}</h2>
                            </div>
                            <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-white/40">{getOrdersByStatus(col.id).length}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
                            {getOrdersByStatus(col.id).map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-[#111113] rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-white/10 transition-all active:scale-[0.98]"
                                >
                                    {/* Card Header */}
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-[#0A0A0B] text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center border border-white/10 shadow-lg">
                                                <span className="text-[8px] font-black text-white/20 leading-none">TABLE</span>
                                                <span className="text-xl font-black italic leading-none mt-0.5">{order.tables?.table_number || '??'}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 text-white/30">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: fr })}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                        <button className="p-2 text-white/10 hover:text-white transition-colors">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>

                                    {/* Items */}
                                    <div className="p-6 space-y-4">
                                        {order.order_items.map((item) => (
                                            <div key={item.id} className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center font-black text-sm text-white border border-white/10">
                                                        {item.quantity}
                                                    </div>
                                                    <span className="text-sm font-black text-white/90 uppercase tracking-tight leading-tight">{item.items.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-4 pt-0">
                                        <button
                                            onClick={() => handleNextStatus(order)}
                                            className={`
                                                w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 transition-all
                                                ${order.status === 'pending' ? 'bg-white text-black hover:bg-rose-500 hover:text-white' :
                                                    order.status === 'preparing' ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20' :
                                                        'bg-white/5 text-white/20'}
                                            `}
                                        >
                                            {order.status === 'pending' && (
                                                <>
                                                    <ChefHat size={14} strokeWidth={3} />
                                                    Commencer la préparation
                                                </>
                                            )}
                                            {order.status === 'preparing' && (
                                                <>
                                                    <CheckCircle2 size={14} strokeWidth={3} />
                                                    Marquer comme prêt / servi
                                                </>
                                            )}
                                            {order.status === 'served' && (
                                                <>
                                                    <Truck size={14} strokeWidth={3} />
                                                    Passer au paiement
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {getOrdersByStatus(col.id).length === 0 && (
                                <div className="border-2 border-dashed border-white/5 rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                                    <div className="bg-white/5 p-6 rounded-full mb-4">
                                        <col.icon size={32} className="text-white/20" />
                                    </div>
                                    <p className="font-black italic uppercase tracking-widest text-[10px] text-white/40">Rien pour le moment</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
