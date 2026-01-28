import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    Menu as MenuIcon,
    X,
    LogOut,
    Settings,
    Coffee,
    Utensils,
    QrCode
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navigation = [
    { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    { name: 'Commandes', href: '/admin/orders', icon: ClipboardList },
    { name: 'Menu & Cartes', href: '/admin/menu', icon: Coffee },
    { name: 'Tables & QR', href: '/admin/tables', icon: QrCode },
    { name: 'Employés', href: '/admin/staff', icon: Users },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-[#EAEAEA] flex font-sans selection:bg-blue-500/30">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-md"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#111113] border-r border-white/5 transform transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 layer-shadow' : '-translate-x-full'}
        shadow-2xl shadow-black lg:shadow-none
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-8 flex items-center justify-between mb-6">
                        <Link to="/admin" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Utensils className="text-white" size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white tracking-tighter leading-none">
                                    TAPZY <span className="text-blue-500 italic">ADMIN</span>
                                </span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Management Portal</span>
                            </div>
                        </Link>
                        <button className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                        <div className="px-4 mb-4">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Menu Principal</span>
                        </div>
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                                        flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                                        ${isActive
                                            ? 'bg-blue-600 text-white font-bold shadow-xl shadow-blue-500/20'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white font-semibold'}
                                    `}
                                >
                                    <div className={`
                                        p-1.5 rounded-lg transition-colors
                                        ${isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-white/10'}
                                    `}>
                                        <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className="tracking-tight">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-6 mt-auto">
                        <div className="bg-white/5 rounded-3xl p-4 mb-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-tr from-gray-700 to-gray-600 rounded-full border border-white/10 flex items-center justify-center font-black italic text-sm">
                                    AD
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-white leading-none">Administrateur</span>
                                    <span className="text-[10px] font-bold text-gray-500 mt-1">Session Active</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest"
                            >
                                <LogOut size={16} />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header Mobile */}
                <header className="bg-[#111113]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between lg:hidden sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 bg-white/5 rounded-xl text-gray-400 hover:text-white">
                        <MenuIcon size={24} />
                    </button>
                    <span className="font-black text-xl tracking-tighter">TAPZY</span>
                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                        <Coffee className="text-blue-500" size={20} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
