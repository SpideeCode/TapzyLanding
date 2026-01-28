import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Save,
    Globe,
    Camera,
    Store,
    Link as LinkIcon,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

interface Restaurant {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
}

export const RestaurantSettings: React.FC = () => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        const fetchRestaurant = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('profiles').select('restaurant_id').eq('id', user.id).single();
            if (profile?.restaurant_id) {
                const { data: res } = await supabase.from('restaurants').select('*').eq('id', profile.restaurant_id).single();
                if (res) {
                    setRestaurant(res);
                    setName(res.name);
                    setSlug(res.slug);
                    setLogoUrl(res.logo_url || '');
                }
            }
            setLoading(false);
        };
        fetchRestaurant();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurant) return;

        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('restaurants')
                .update({
                    name,
                    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    logo_url: logoUrl || null
                })
                .eq('id', restaurant.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Paramètres mis à jour avec succès !' });
        } catch (error: any) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: error.message || 'Une erreur est survenue.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-20 text-center">
                <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <p className="text-gray-500 font-bold italic">Chargement du profil...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter leading-tight italic">
                    PARAMÈTRES DU <span className="text-blue-600 not-italic">RESTAURANT</span>
                </h1>
                <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-[10px] flex items-center gap-2">
                    Personnalisez votre identité de marque
                </p>
            </div>

            {message && (
                <div className={`p-6 rounded-[2rem] flex items-center gap-4 animate-in zoom-in duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <p className="font-bold italic">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-12">
                {/* Visual Identity Section */}
                <div className="bg-[#111113] rounded-[3rem] border border-white/5 p-10 space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Camera size={24} />
                        </div>
                        <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Identité Visuelle</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-700 border-2 border-dashed border-white/10 shrink-0 overflow-hidden group">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <Store size={40} />
                            )}
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">URL de votre logo</label>
                            <input
                                type="url"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-800"
                                placeholder="https://votre-site.com/logo.png"
                            />
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-2 italic">Format recommandé: PNG ou SVG (carré)</p>
                        </div>
                    </div>
                </div>

                {/* General Info Section */}
                <div className="bg-[#111113] rounded-[3rem] border border-white/5 p-10 space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500">
                            <Store size={24} />
                        </div>
                        <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Informations Générales</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Nom de l'établissement</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white text-lg font-black italic focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                                placeholder="Ex: L'Atelier Gourmand"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">URL personnalisée (Slug)</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 font-bold select-none">/</span>
                                <input
                                    type="text"
                                    required
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 pl-10 pr-6 text-blue-500 text-lg font-black italic focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                                    placeholder="nom-du-resto"
                                />
                            </div>
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-2 italic">Unique et sans caractères spéciaux</p>
                        </div>
                    </div>
                </div>

                {/* Digital Menu Link Preview */}
                <div className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[3rem] flex items-center gap-8 group">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <Globe size={28} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Votre menu digital est accessible sur :</h3>
                        <p className="text-xl font-black text-white italic tracking-tight group-hover:text-blue-500 transition-colors">
                            tapzy.app/{slug || '...'}
                        </p>
                    </div>
                    <a
                        href={`/menu/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90"
                    >
                        <LinkIcon size={20} />
                    </a>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 pb-20">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30 transition-all active:scale-95 group"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save size={20} className="group-hover:scale-110 transition-transform" />
                        )}
                        {saving ? 'ENREGISTREMENT...' : 'SAUVEGARDER LES MODIFICATIONS'}
                    </button>
                </div>
            </form>
        </div>
    );
};
