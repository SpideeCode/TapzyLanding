import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Store, X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    role: 'superadmin' | 'admin' | 'staff';
    restaurant_id: string | null;
    restaurants: { name: string } | null;
}

interface Restaurant {
    id: string;
    name: string;
}

export const StaffManagement: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'staff'>('admin');
    const [selectedResId, setSelectedResId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [profRes, restRes] = await Promise.all([
            supabase.from('profiles').select('id, email, role, restaurant_id, restaurants(name)').order('role', { ascending: true }),
            supabase.from('restaurants').select('id, name').order('name')
        ]);

        if (profRes.data) setProfiles(profRes.data as any);
        if (restRes.data) {
            setRestaurants(restRes.data);
            if (restRes.data.length > 0) setSelectedResId(restRes.data[0].id);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setMessage(null);

        try {
            // Calling the Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('create-user', {
                body: {
                    email,
                    password,
                    role,
                    restaurant_id: selectedResId
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setMessage({ type: 'success', text: `Compte ${email} créé avec succès !` });
            setEmail('');
            setPassword('');
            fetchData();
            setTimeout(() => setShowAddModal(false), 2000);
        } catch (error: any) {
            console.error('Error creating user:', error);
            setMessage({ type: 'error', text: error.message || 'Erreur lors de la création.' });
        } finally {
            setCreating(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'superadmin': return 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-500/20 px-3 py-1';
            case 'admin': return 'bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1';
            case 'staff': return 'bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1';
            default: return 'bg-gray-50 text-gray-500 px-3 py-1';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Utilisateurs & Staff</h1>
                    <p className="text-gray-600 font-medium">Gérez les comptes utilisateurs et leurs permissions globales.</p>
                </div>
                <button
                    onClick={() => {
                        setMessage(null);
                        setShowAddModal(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <UserPlus size={20} strokeWidth={3} />
                    <span>Créer un compte</span>
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Utilisateur</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Rôle</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Affectation</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Chargement...</td></tr>
                        ) : (
                            profiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-lg shadow-inner">
                                                {profile.email[0].toUpperCase()}
                                            </div>
                                            <div className="text-sm font-bold text-gray-900">{profile.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`rounded-full text-[10px] font-black border uppercase tracking-widest ${getRoleBadge(profile.role)}`}>
                                            {profile.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                                            <Store size={16} className="text-blue-600" strokeWidth={2.5} />
                                            <span>{profile.restaurants?.name || 'Accès Global (Tous)'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-blue-600 hover:text-blue-800 cursor-pointer text-xs uppercase tracking-widest">
                                        Modifier
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Account Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in duration-200 border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 md:p-10 border-b border-gray-50 shrink-0">
                            <h3 className="text-3xl font-black text-gray-900 italic underline decoration-blue-600 underline-offset-8 uppercase tracking-tighter">Créer un profil</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                                <X size={24} className="text-gray-400" strokeWidth={3} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 md:p-10">
                            {message && (
                                <div className={`mb-8 p-5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    <p className="text-xs font-bold italic">{message.text}</p>
                                </div>
                            )}

                            <form onSubmit={handleCreateUser} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                                            placeholder="admin@sofra.be"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Mot de passe</label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                                            placeholder="********"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Rôle</label>
                                        <select
                                            value={role}
                                            onChange={e => setRole(e.target.value as any)}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all appearance-none"
                                        >
                                            <option value="admin">Administrateur</option>
                                            <option value="staff">Serveur / Staff</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Restaurant</label>
                                        <select
                                            required
                                            value={selectedResId}
                                            onChange={e => setSelectedResId(e.target.value)}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all appearance-none"
                                        >
                                            {restaurants.map(res => (
                                                <option key={res.id} value={res.id}>{res.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-[2] bg-blue-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                    >
                                        {creating ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <UserPlus size={16} />
                                        )}
                                        {creating ? 'CRÉATION...' : 'CRÉER LE COMPTE'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
