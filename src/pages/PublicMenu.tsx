import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart, CartItem } from '../hooks/useCart';
import {
    ShoppingBag,
    Plus,
    Minus,
    Info,
    ArrowLeft,
    Clock,
    Star
} from 'lucide-react';

interface Restaurant {
    id: string;
    name: string;
    logo_url: string | null;
    slug: string;
}

interface Category {
    id: string;
    name: string;
    display_order: number;
}

interface Item {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    category_id: string;
}

export const PublicMenu: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get('t');

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [showCartModal, setShowCartModal] = useState(false);

    const { cart, addToCart, removeFromCart, totalItems, totalPrice } = useCart(restaurant?.id || '');

    useEffect(() => {
        const fetchAllData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // 1. Fetch Restaurant
                const { data: resData, error: resError } = await supabase
                    .from('restaurants')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (resError || !resData) throw new Error('Restaurant introuvable');
                setRestaurant(resData);

                // 2. Fetch Menu
                const [catRes, itemRes] = await Promise.all([
                    supabase.from('menus_categories').select('*').eq('restaurant_id', resData.id).order('display_order', { ascending: true }),
                    supabase.from('items').select('*').eq('restaurant_id', resData.id).eq('is_available', true)
                ]);

                setCategories(catRes.data || []);
                setItems(itemRes.data || []);
                if (catRes.data && catRes.data.length > 0) setActiveCategory(catRes.data[0].id);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="relative">
                <div className="h-16 w-16 border-4 border-blue-50 rounded-full animate-spin"></div>
                <div className="h-16 w-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute inset-0"></div>
            </div>
        </div>
    );

    if (error || !restaurant) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-red-50 p-6 rounded-full mb-6">
                <Info size={48} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Oups !</h1>
            <p className="text-gray-500 mb-8 max-w-xs">{error || "Ce menu n'existe pas."}</p>
            <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20">
                Retour à l'accueil
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header / Hero */}
            <div className="relative h-64 w-full bg-[#0A0A0B] overflow-hidden">
                {restaurant.logo_url ? (
                    <img src={restaurant.logo_url} className="w-full h-full object-cover opacity-50 blur-sm scale-110" alt="" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 opacity-60"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent"></div>

                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                    <button onClick={() => window.history.back()} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                        <span className="text-white text-xs font-black uppercase tracking-widest">Table {tableNumber || '??'}</span>
                    </div>
                </div>

                <div className="absolute bottom-4 left-6 right-6">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-1">{restaurant.name}</h1>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                        <div className="flex items-center gap-1 text-emerald-600">
                            <Star size={14} fill="currentColor" />
                            <span>4.8</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>15-25 min</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Nav (Sticky) */}
            <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 overflow-x-auto scrollbar-hide flex gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            const el = document.getElementById(cat.id);
                            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-black whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Menu Items */}
            <div className="px-6 mt-8 space-y-12">
                {categories.map((category) => (
                    <section key={category.id} id={category.id} className="scroll-mt-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-1.5 w-8 bg-blue-600 rounded-full"></div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{category.name}</h2>
                            <span className="text-sm font-black text-gray-300 ml-auto uppercase tracking-widest">
                                {items.filter(i => i.category_id === category.id).length} plats
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {items
                                .filter((item) => item.category_id === category.id)
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex gap-4 hover:shadow-xl transition-all group"
                                    >
                                        <div className="relative w-28 h-28 flex-shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} className="w-full h-full object-cover rounded-2xl" alt={item.name} />
                                            ) : (
                                                <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center">
                                                    <ShoppingBag className="text-blue-200" size={32} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors leading-tight mb-1">{item.name}</h3>
                                                <p className="text-xs font-bold text-gray-400 line-clamp-2 leading-relaxed">{item.description || "Aucune description disponible."}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xl font-black text-gray-900">{item.price.toFixed(2)} €</span>
                                                <button
                                                    onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.image_url || undefined })}
                                                    className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                                >
                                                    <Plus size={20} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Floating Cart Button */}
            {totalItems > 0 && (
                <div className="fixed bottom-8 left-6 right-6 z-40 animate-in slide-in-from-bottom duration-500">
                    <button
                        onClick={() => setShowCartModal(true)}
                        className="w-full bg-[#0A0A0B] text-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-blue-900/40 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-active:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="bg-blue-600 px-3 py-1 rounded-full text-xs font-black">
                                {totalItems}
                            </div>
                            <span className="font-black uppercase tracking-[0.2em] text-sm">Mon Panier</span>
                        </div>
                        <span className="text-xl font-black relative z-10">{totalPrice.toFixed(2)} €</span>
                    </button>
                </div>
            )}

            {/* Cart Modal / Slide-over */}
            {showCartModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end lg:justify-center lg:items-center">
                    <div className="bg-white rounded-t-[3rem] lg:rounded-[3rem] w-full lg:max-w-md p-8 pt-4 lg:pt-8 animate-in slide-in-from-bottom duration-300">
                        {/* Pull Bar */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 lg:hidden"></div>

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight italic underline decoration-blue-600 underline-offset-8">Panier</h3>
                            <button onClick={() => setShowCartModal(false)} className="p-2 hover:bg-gray-100 rounded-2xl transition-colors">
                                <Plus size={28} className="rotate-45 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide mb-8">
                            {cart.map((item: CartItem) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex-shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} className="w-full h-full object-cover rounded-2xl" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="text-gray-200" size={20} /></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-gray-900 leading-tight mb-1">{item.name}</h4>
                                        <p className="text-blue-600 font-bold text-sm tracking-widest uppercase">{item.price.toFixed(2)} €</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-2xl">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 hover:bg-white hover:text-red-600 rounded-xl transition-all shadow-sm group active:scale-95 text-gray-400"
                                        >
                                            <Minus size={16} strokeWidth={3} />
                                        </button>
                                        <span className="font-black text-gray-900 min-w-[1.5rem] text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="p-2 hover:bg-white hover:text-blue-600 rounded-xl transition-all shadow-sm group active:scale-95 text-gray-400"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Total à payer</span>
                                <span className="text-3xl font-black text-gray-900">{totalPrice.toFixed(2)} €</span>
                            </div>

                            <button className="w-full bg-blue-600 text-white p-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                                Commander (Table {tableNumber || '??'})
                            </button>
                            <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Paiement à la table ou en direct</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
