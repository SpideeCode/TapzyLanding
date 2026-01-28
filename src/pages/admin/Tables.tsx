import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, QrCode, Trash2, Edit2, Filter } from 'lucide-react';

interface Table {
    id: string;
    table_number: string;
    qr_code_url: string | null;
    restaurant_id: string;
}

interface Restaurant {
    id: string;
    name: string;
}

export const TableManagement: React.FC = () => {
    const [userProfile, setUserProfile] = useState<{ role: string, restaurant_id: string | null } | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedResId, setSelectedResId] = useState<string>('');
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [tableNumber, setTableNumber] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase.from('profiles').select('role, restaurant_id').eq('id', user.id).single();
                setUserProfile(profile);

                if (profile?.role === 'superadmin') {
                    const { data: resData } = await supabase.from('restaurants').select('id, name');
                    setRestaurants(resData || []);
                    if (resData && resData.length > 0) setSelectedResId(resData[0].id);
                } else if (profile?.restaurant_id) {
                    setSelectedResId(profile.restaurant_id);
                }
            } catch (err) {
                console.error('Error fetching initial table data:', err);
            }
        };
        fetchInitialData();
    }, []);

    const fetchTables = async () => {
        if (!selectedResId) return;
        setLoading(true);
        try {
            const { data } = await supabase.from('tables').select('*').eq('restaurant_id', selectedResId).order('table_number', { ascending: true });
            setTables(data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, [selectedResId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResId) return;

        const tableData = {
            table_number: tableNumber,
            restaurant_id: selectedResId
        };

        let error;
        if (editingTable) {
            ({ error } = await supabase.from('tables').update(tableData).eq('id', editingTable.id));
        } else {
            ({ error } = await supabase.from('tables').insert([tableData]));
        }

        if (error) alert(error.message);
        else {
            setShowModal(false);
            setEditingTable(null);
            setTableNumber('');
            fetchTables();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette table ?')) return;
        const { error } = await supabase.from('tables').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchTables();
    };

    const isSuperAdmin = userProfile?.role === 'superadmin';

    return (
        <div className="space-y-12 animate-in fade-in duration-700 text-white pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-tight italic">
                        TABLES & <span className="text-blue-600 not-italic">QR CODES</span>
                    </h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-[10px] flex items-center gap-2">
                        {isSuperAdmin ? 'MODE SUPERADMIN' : 'GESTION DES ACCÈS'}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                    {isSuperAdmin && (
                        <div className="bg-white/5 border border-white/5 rounded-2xl px-4 flex items-center gap-2">
                            <Filter size={18} className="text-gray-500" />
                            <select
                                value={selectedResId}
                                onChange={(e) => setSelectedResId(e.target.value)}
                                className="bg-transparent border-none text-white font-bold text-sm focus:ring-0 py-3 pr-8"
                            >
                                {restaurants.map(res => (
                                    <option key={res.id} value={res.id} className="bg-[#111113]">{res.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            setEditingTable(null);
                            setTableNumber('');
                            setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 w-fit"
                    >
                        <Plus size={20} strokeWidth={3} /> NOUVELLE TABLE
                    </button>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {tables.map(table => (
                    <div key={table.id} className="bg-[#111113] rounded-[3rem] border border-white/5 p-8 relative group hover:border-blue-500/30 transition-all duration-500 flex flex-col items-center shadow-2xl overflow-hidden min-h-[320px]">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-500 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-inner">
                            <QrCode size={36} strokeWidth={2} />
                        </div>

                        <h3 className="text-4xl font-black text-white italic tracking-tighter mb-2">TABLE {table.table_number}</h3>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-8 text-center px-4 leading-tight">ID RESTO: {table.restaurant_id.slice(0, 12)}...</p>

                        <div className="mt-auto w-full pt-8 border-t border-white/5 flex gap-3 z-10">
                            <button
                                onClick={() => {
                                    setEditingTable(table);
                                    setTableNumber(table.table_number);
                                    setShowModal(true);
                                }}
                                className="flex-1 py-3 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <Edit2 size={14} /> ÉDITER
                            </button>
                            <button
                                onClick={() => handleDelete(table.id)}
                                className="flex-1 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={14} /> SUPPR.
                            </button>
                        </div>

                        <span className="absolute -bottom-6 -right-2 text-[120px] font-black text-white/[0.02] pointer-events-none select-none italic leading-none group-hover:text-blue-600/[0.05] transition-colors">
                            {table.table_number}
                        </span>
                    </div>
                ))}

                {tables.length === 0 && !loading && (
                    <div className="col-span-full py-24 text-center bg-white/[0.01] rounded-[4rem] border-4 border-dashed border-white/5">
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-gray-700">
                            <QrCode size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 italic">AUCUNE TABLE</h3>
                        <p className="text-gray-500 font-bold italic mb-8">Commencez par ajouter votre première table de service.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                        >
                            Créer la table n°1
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="col-span-full py-24 text-center">
                        <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                        <p className="text-gray-500 font-bold italic">Recherche des tables...</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-[#111113] w-full max-w-md rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                                {editingTable ? 'MODIFIER LA TABLE' : 'NOUVELLE TABLE'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                                <X size={28} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-10 space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-4">Numéro de table</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-6 px-10 text-white text-3xl font-black italic focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-800 shadow-inner"
                                    placeholder="Ex: 12"
                                />
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-4 italic">Visible sur le menu client</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-5 rounded-2xl bg-white/5 text-gray-400 font-black uppercase text-xs tracking-widest transition-all hover:bg-white/10"
                                >
                                    Fermer
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-5 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest transition-all hover:bg-blue-500 shadow-xl shadow-blue-500/20"
                                >
                                    {editingTable ? 'ENREGISTRER' : 'CRÉER'}
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
