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
    CheckCircle2,
    Search,
    MapPin
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

interface Table {
    id: string;
    table_number: string;
}

export const PublicMenu: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const tableNumber = searchParams.get('t');

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [showCartModal, setShowCartModal] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice } = useCart(restaurant?.id || '');

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

                // 2. Fetch Menu & Tables
                const [catRes, itemRes, tableRes] = await Promise.all([
                    supabase.from('menus_categories').select('*').eq('restaurant_id', resData.id).order('display_order', { ascending: true }),
                    supabase.from('items').select('*').eq('restaurant_id', resData.id).eq('is_available', true),
                    supabase.from('tables').select('id, table_number').eq('restaurant_id', resData.id).order('table_number')
                ]);

                setCategories(catRes.data || []);
                setItems(itemRes.data || []);
                setTables(tableRes.data || []);
                if (catRes.data && catRes.data.length > 0) setActiveCategory(catRes.data[0].id);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [slug]);

    const handleCheckout = async () => {
        if (!restaurant || cart.length === 0) return;
        if (!tableNumber) {
            setShowTableModal(true);
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Get Table ID
            const { data: tableData } = await supabase
                .from('tables')
                .select('id')
                .eq('restaurant_id', restaurant.id)
                .eq('table_number', tableNumber)
                .single();

            const tableId = tableData?.id || null;

            // 2. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    restaurant_id: restaurant.id,
                    table_id: tableId,
                    total_price: totalPrice,
                    status: 'pending'
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create Order Items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                item_id: item.id,
                quantity: item.quantity,
                unit_price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            setOrderSuccess(true);
            clearCart();
            setShowCartModal(false);
        } catch (err: any) {
            console.error('Checkout error:', err);
            alert('Erreur lors de la commande: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
            <div className="w-full max-w-lg space-y-8 animate-pulse">
                <div className="h-64 bg-gray-100 rounded-[3rem]"></div>
                <div className="h-12 bg-gray-100 rounded-2xl w-3/4"></div>
                <div className="space-y-4">
                    <div className="h-32 bg-gray-50 rounded-[2.5rem]"></div>
                    <div className="h-32 bg-gray-50 rounded-[2.5rem]"></div>
                </div>
            </div>
        </div>
    );

    if (orderSuccess) return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 scale-150"></div>
                <div className="relative bg-emerald-500 p-8 rounded-[3rem] shadow-2xl shadow-emerald-500/40 animate-bounce">
                    <CheckCircle2 size={72} className="text-white" />
                </div>
            </div>
            <h1 className="text-5xl font-black text-[#0A0A0B] mb-6 tracking-tighter leading-none italic">
                C'EST PARTI !
            </h1>
            <p className="text-xl font-bold text-gray-400 mb-12 max-w-sm leading-relaxed px-4">
                Votre commande est déjà en cuisine. On vous sert ça tout chaud !
            </p>
            <button
                onClick={() => setOrderSuccess(false)}
                className="w-full max-w-xs py-6 bg-[#0A0A0B] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all text-sm"
            >
                Revenir au menu
            </button>
        </div>
    );

    if (error || !restaurant) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-red-50 p-6 rounded-full mb-8">
                <Info size={48} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter italic">OUPS !</h1>
            <p className="text-gray-400 mb-10 max-w-xs font-bold leading-relaxed">{error || "Ce restaurant n'existe pas ou le lien est cassé."}</p>
            <button onClick={() => window.location.href = '/'} className="px-10 py-5 bg-[#0A0A0B] text-white rounded-2xl font-black italic tracking-widest uppercase text-xs">
                Accueil Tapzy
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-[#0A0A0B] font-sans overflow-x-hidden pb-40">
            {/* Ultra-Premium Hero */}
            <header className="relative px-6 pt-12 pb-8">
                <div className="flex items-center justify-between mb-10">
                    <button onClick={() => window.history.back()} className="p-4 bg-white shadow-xl shadow-black/5 rounded-3xl hover:scale-105 transition-all active:scale-95">
                        <ArrowLeft size={20} strokeWidth={3} />
                    </button>

                    <button
                        onClick={() => setShowTableModal(true)}
                        className="group flex flex-col items-end hover:scale-105 transition-all active:scale-95"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-1 group-hover:text-blue-600 transition-colors">Votre Table</span>
                        <div className="bg-[#0A0A0B] px-5 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10">
                            <span className="text-white text-lg font-black italic">{tableNumber || 'Sélectionner'}</span>
                            <MapPin size={14} className="text-blue-500" />
                        </div>
                    </button>
                </div>

                <div className="relative">
                    <div className="flex items-center gap-6">
                        {restaurant.logo_url && (
                            <img src={restaurant.logo_url} className="w-24 h-24 object-cover rounded-[2rem] shadow-2xl border-4 border-white" alt="" />
                        )}
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none mb-3">
                                {restaurant.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400">
                                <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                                    <ShoppingBag size={12} strokeWidth={3} />
                                    <span>Ouvert</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Premium Search Bar */}
            <div className="px-6 mb-10">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="Qu'est-ce qui vous fait plaisir ?"
                        className="w-full bg-[#F5F5F7] border-none rounded-[2rem] py-6 pl-16 pr-8 text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-300 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Categorized Visual Tabs */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-3xl border-b border-gray-100/50 -mx-6 px-12 py-6 overflow-x-auto scrollbar-hide flex gap-8 items-center">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            const el = document.getElementById(cat.id);
                            const offset = 120; // Adjust for sticky header
                            const bodyRect = document.body.getBoundingClientRect().top;
                            const elementRect = el?.getBoundingClientRect().top || 0;
                            const elementPosition = elementRect - bodyRect;
                            const offsetPosition = elementPosition - offset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: "smooth"
                            });
                        }}
                        className={`group relative flex flex-col items-center gap-2 flex-shrink-0 transition-all ${activeCategory === cat.id ? 'opacity-100' : 'opacity-40 hover:opacity-60'
                            }`}
                    >
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                            {cat.name}
                        </span>
                        <div className={`h-1.5 rounded-full bg-blue-600 transition-all duration-500 ${activeCategory === cat.id ? 'w-full' : 'w-0 group-hover:w-4'
                            }`}></div>
                    </button>
                ))}
            </div>

            {/* Menu List */}
            <div className="px-6 mt-12 space-y-20">
                {categories.map((category) => {
                    const categoryItems = filteredItems.filter(i => i.category_id === category.id);
                    if (categoryItems.length === 0) return null;

                    return (
                        <section key={category.id} id={category.id} className="scroll-mt-32">
                            <div className="flex items-baseline justify-between mb-8">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase underline decoration-4 decoration-blue-600 underline-offset-8">
                                    {category.name}
                                </h2>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{categoryItems.length} CHOIX</span>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {categoryItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative group bg-white p-6 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/[0.02] flex gap-6 hover:shadow-2xl hover:shadow-blue-500/5 transition-all active:scale-[0.98]"
                                    >
                                        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-[2rem]">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    alt={item.name}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                                    <ShoppingBag className="text-gray-200" size={32} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center py-2">
                                            <div className="mb-4">
                                                <h3 className="text-xl font-black text-[#0A0A0B] leading-none mb-2 tracking-tight">
                                                    {item.name}
                                                </h3>
                                                <p className="text-xs font-bold text-gray-400 leading-relaxed line-clamp-2 pr-4 italic">
                                                    {item.description || "Une création signature faite avec passion."}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-black tracking-tighter">{item.price.toFixed(2)}€</span>
                                                <button
                                                    onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.image_url || undefined })}
                                                    className="bg-[#0A0A0B] text-white p-4 rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                                                >
                                                    <Plus size={24} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Table Selector Modal */}
            {showTableModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-[#0A0A0B] tracking-tighter italic uppercase leading-none mb-2">Choisir Table</h3>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Où vous trouvez-vous ?</p>
                            </div>
                            <button onClick={() => setShowTableModal(false)} className="p-4 bg-gray-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {tables.map((table) => (
                                <button
                                    key={table.id}
                                    onClick={() => {
                                        setSearchParams({ t: table.table_number });
                                        setShowTableModal(false);
                                    }}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-[2rem] text-xl font-black italic transition-all active:scale-90
                                        ${tableNumber === table.table_number
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
                                    `}
                                >
                                    {table.table_number}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-blue-50 rounded-3xl">
                            <p className="text-center text-[11px] font-bold text-blue-600 leading-relaxed uppercase tracking-wider">
                                Sélectionnez votre numéro de table <br /> pour que nous puissions vous servir.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Cart & Cart Modal */}
            {totalItems > 0 && (
                <div className="fixed bottom-10 left-6 right-6 z-40 animate-in slide-in-from-bottom flex justify-center">
                    <button
                        onClick={() => setShowCartModal(true)}
                        className="w-full max-w-lg bg-[#0A0A0B] text-white p-5 rounded-[2.5rem] flex items-center justify-between shadow-2xl group border border-white/10"
                    >
                        <div className="flex items-center gap-4 px-2">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center font-black italic text-xl">
                                {totalItems}
                            </div>
                            <span className="text-sm font-black italic underline decoration-blue-500 decoration-2 underline-offset-4">VOIR PANIER</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl">
                            <span className="text-lg font-black tracking-tighter italic">{totalPrice.toFixed(2)}€</span>
                        </div>
                    </button>
                </div>
            )}

            {showCartModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end transition-all duration-500">
                    <div className="absolute inset-0" onClick={() => setShowCartModal(false)}></div>
                    <div className="relative bg-[#FDFDFD] rounded-t-[4rem] w-full max-w-2xl mx-auto p-10 pt-4 animate-in slide-in-from-bottom duration-500">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full mx-auto mb-12"></div>
                        <h3 className="text-4xl font-black text-[#0A0A0B] tracking-tighter italic uppercase mb-8">Votre Panier</h3>
                        <div className="space-y-8 max-h-[40vh] overflow-y-auto pr-4 mb-12 custom-scrollbar">
                            {cart.map((item: CartItem) => (
                                <div key={item.id} className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-gray-50 flex-shrink-0 overflow-hidden shadow-lg shadow-black/5">
                                        {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-black text-[#0A0A0B] tracking-tight mb-1">{item.name}</h4>
                                        <p className="text-blue-600 font-black italic text-sm">{item.price.toFixed(2)}€</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-[#F5F5F7] p-2 rounded-[1.5rem]">
                                        <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-400"><Minus size={16} strokeWidth={4} /></button>
                                        <span className="font-black text-lg min-w-[1.5rem] text-center italic">{item.quantity}</span>
                                        <button onClick={() => addToCart(item)} className="w-10 h-10 flex items-center justify-center bg-[#0A0A0B] text-white rounded-xl shadow-sm"><Plus size={16} strokeWidth={4} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-10 border-t-4 border-dashed border-gray-50 space-y-10">
                            <div className="flex items-end justify-between">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Total Final</span>
                                <span className="text-5xl font-black tracking-tighter italic text-[#0A0A0B]">{totalPrice.toFixed(2)}€</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                                className="w-full bg-[#0A0A0B] text-white py-8 rounded-[2.5rem] flex items-center justify-center gap-4 shadow-2xl transition-all disabled:opacity-50"
                            >
                                <span className="text-sm font-black uppercase tracking-[0.3em]">{isSubmitting ? 'TRANSMISSION...' : `COMMANDER TABLE ${tableNumber || '??'}`}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
