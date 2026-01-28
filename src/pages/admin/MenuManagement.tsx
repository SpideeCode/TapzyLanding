import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Plus,
    Edit2,
    Trash2,
    LayoutGrid,
    Search,
    Package
} from 'lucide-react';

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
    is_available: boolean;
}

export const MenuManagement: React.FC = () => {
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');

    // Modals
    const [showCatModal, setShowCatModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    // Form states
    const [catName, setCatName] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemDesc, setItemDesc] = useState('');
    const [itemPrice, setItemPrice] = useState('0');
    const [itemCatId, setItemCatId] = useState('');
    const [itemImage, setItemImage] = useState('');

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('profiles').select('restaurant_id').eq('id', user.id).single();
            if (profile?.restaurant_id) {
                setRestaurantId(profile.restaurant_id);
                fetchData(profile.restaurant_id);
            }
        };
        init();
    }, []);

    const fetchData = async (resId: string) => {
        setLoading(true);
        try {
            const [catRes, itemRes] = await Promise.all([
                supabase.from('menus_categories').select('*').eq('restaurant_id', resId).order('display_order'),
                supabase.from('items').select('*').eq('restaurant_id', resId).order('created_at', { ascending: false })
            ]);
            setCategories(catRes.data || []);
            setItems(itemRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurantId || !catName) return;

        const data = {
            name: catName,
            restaurant_id: restaurantId,
            display_order: editingCat?.display_order || categories.length
        };

        try {
            if (editingCat) {
                await supabase.from('menus_categories').update(data).eq('id', editingCat.id);
            } else {
                await supabase.from('menus_categories').insert([data]);
            }
            setShowCatModal(false);
            setCatName('');
            setEditingCat(null);
            fetchData(restaurantId);
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurantId || !itemName || !itemCatId) return;

        const data = {
            name: itemName,
            description: itemDesc,
            price: parseFloat(itemPrice),
            category_id: itemCatId,
            restaurant_id: restaurantId,
            image_url: itemImage || null,
            is_available: editingItem ? editingItem.is_available : true
        };

        try {
            if (editingItem) {
                await supabase.from('items').update(data).eq('id', editingItem.id);
            } else {
                await supabase.from('items').insert([data]);
            }
            setShowItemModal(false);
            setItemName('');
            setItemDesc('');
            setItemPrice('0');
            setItemCatId('');
            setItemImage('');
            setEditingItem(null);
            fetchData(restaurantId);
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const toggleAvailability = async (item: Item) => {
        try {
            await supabase.from('items').update({ is_available: !item.is_available }).eq('id', item.id);
            if (restaurantId) fetchData(restaurantId);
        } catch (error) {
            console.error('Error toggling availability:', error);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce plat ?')) return;
        try {
            await supabase.from('items').delete().eq('id', id);
            if (restaurantId) fetchData(restaurantId);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const handleDeleteCat = async (id: string) => {
        if (!confirm('En supprimant cette catégorie, tous les plats associés perdront leur catégorie. Continuer ?')) return;
        try {
            await supabase.from('menus_categories').delete().eq('id', id);
            if (restaurantId) fetchData(restaurantId);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categories.find(c => c.id === i.category_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-tight italic">
                        GESTION DU <span className="text-blue-600 not-italic">MENU</span>
                    </h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs flex items-center gap-2">
                        Configurez vos cartes et vos plats
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingCat(null);
                            setCatName('');
                            setShowCatModal(true);
                        }}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all border border-white/5 active:scale-95 flex items-center gap-2"
                    >
                        <Plus size={18} /> CATÉGORIE
                    </button>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setItemName('');
                            setItemDesc('');
                            setItemPrice('0');
                            setItemCatId(categories[0]?.id || '');
                            setShowItemModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Plus size={18} /> NOUVEAU PLAT
                    </button>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'items' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Plats
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Catégories
                    </button>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un plat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111113] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white font-bold placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>
            </div>

            {/* List */}
            {activeTab === 'items' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-[#111113] rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-blue-500/30 transition-all duration-500 relative flex flex-col shadow-2xl">
                            <div className="h-48 relative overflow-hidden bg-white/5">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                        <Package size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 translate-y-[-120%] group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingItem(item);
                                            setItemName(item.name);
                                            setItemDesc(item.description);
                                            setItemPrice(item.price.toString());
                                            setItemCatId(item.category_id);
                                            setItemImage(item.image_url || '');
                                            setShowItemModal(true);
                                        }}
                                        className="bg-white text-black p-3 rounded-xl shadow-xl active:scale-95"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="bg-red-500 text-white p-3 rounded-xl shadow-xl active:scale-95"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        {categories.find(c => c.id === item.category_id)?.name || 'Sans catégorie'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <h3 className="text-xl font-black text-white italic tracking-tight">{item.name}</h3>
                                    <span className="text-2xl font-black text-blue-500 tracking-tighter shrink-0">{item.price.toFixed(2)}€</span>
                                </div>
                                <p className="text-gray-500 text-xs font-bold leading-relaxed line-clamp-2 mb-8 italic italic">
                                    {item.description || "Aucune description."}
                                </p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.is_available ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {item.is_available ? 'Disponible' : 'Épuisé'}
                                    </span>
                                    <button
                                        onClick={() => toggleAvailability(item)}
                                        className={`w-12 h-6 rounded-full relative transition-all ${item.is_available ? 'bg-emerald-500' : 'bg-gray-800'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.is_available ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center bg-white/[0.02] rounded-[3rem] border-2 border-dashed border-white/5">
                            <p className="text-gray-500 font-bold italic">Aucun plat trouvé pour cette recherche.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-[#111113] p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <LayoutGrid size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black italic tracking-tight text-lg">{cat.name}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                        {items.filter(i => i.category_id === cat.id).length} Plats
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingCat(cat);
                                        setCatName(cat.name);
                                        setShowCatModal(true);
                                    }}
                                    className="p-3 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCat(cat.id)}
                                    className="p-3 bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-[#111113] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-3xl font-black text-white italic tracking-tighter">
                                {editingItem ? 'MODIFIER LE PLAT' : 'NOUVEAU PLAT'}
                            </h3>
                            <button onClick={() => setShowItemModal(false)} className="text-gray-500 hover:text-white">
                                <X size={28} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveItem} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Appelation du plat</label>
                                    <input
                                        type="text"
                                        required
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="Ex: Burger Signature"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Prix (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={itemPrice}
                                        onChange={(e) => setItemPrice(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white font-bold focus:outline-none focus:border-blue-500 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Catégorie</label>
                                <select
                                    required
                                    value={itemCatId}
                                    onChange={(e) => setItemCatId(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white font-bold focus:outline-none focus:border-blue-500 transition-all appearance-none"
                                >
                                    {categories.map(c => <option key={c.id} value={c.id} className="bg-[#111113]">{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Description</label>
                                <textarea
                                    value={itemDesc}
                                    onChange={(e) => setItemDesc(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white font-bold focus:outline-none focus:border-blue-500 transition-all h-32 resize-none"
                                    placeholder="Ingrédients, allergènes, histoire du plat..."
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Lien de l'image (URL)</label>
                                <input
                                    type="url"
                                    value={itemImage}
                                    onChange={(e) => setItemImage(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowItemModal(false)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-black uppercase text-xs tracking-widest transition-all hover:bg-white/10"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest transition-all hover:bg-blue-500 shadow-xl shadow-blue-500/20"
                                >
                                    {editingItem ? 'METTRE À JOUR' : 'CRÉER LE PLAT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cat Modal */}
            {showCatModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-[#111113] w-full max-w-md rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                                {editingCat ? 'MODIFIER CATÉGORIE' : 'NOUVELLE CATÉGORIE'}
                            </h3>
                            <button onClick={() => setShowCatModal(false)} className="text-gray-500 hover:text-white">
                                <X size={28} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Nom de la catégorie</label>
                                <input
                                    type="text"
                                    required
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="Ex: Entrées, Plats, Desserts..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCatModal(false)}
                                    className="flex-1 py-4 rounded-xl bg-white/5 text-white font-black uppercase text-xs tracking-widest transition-all hover:bg-white/10"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 rounded-xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest transition-all hover:bg-blue-500 shadow-xl shadow-blue-500/20"
                                >
                                    {editingCat ? 'ENREGISTRER' : 'CRÉER'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const X: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
