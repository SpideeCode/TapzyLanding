import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
    ClipboardList,
    LogOut,
    Utensils,
    Menu as MenuIcon,
    X,
    Bell
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StaffLayoutProps {
    children: React.ReactNode;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
    const { slug } = useParams<{ slug: string }>();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const navigation = [
        { name: 'Commandes Live', href: `/staff/${slug}`, icon: ClipboardList },
        // Future additions: { name: 'Stock / Menu', href: `/staff/${slug}/menu`, icon: Utensils },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex text-[#EAEAEA]">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-xl"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar (already dark) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#111113] border-r border-white/5 transform transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col p-6">
                    {/* Brand */}
                    <div className="flex items-center justify-between mb-12">
                        <span className="text-2xl font-black text-white tracking-tighter italic flex items-center gap-2">
                            <span className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                <Utensils size={20} />
                            </span>
                            TAPZY <span className="text-blue-600">STAFF</span>
                        </span>
                        <button className="lg:hidden text-white/50" onClick={() => setSidebarOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                                        flex items-center gap-3 px-5 py-4 rounded-[1.5rem] transition-all
                                        ${isActive
                                            ? 'bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 active:scale-95'
                                            : 'text-white/40 hover:text-white hover:bg-white/5 font-bold'}
                                    `}
                                >
                                    <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
                                    <span className="text-sm tracking-wide">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / User */}
                    <div className="mt-auto pt-6 border-t border-white/5">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-5 py-4 text-white/40 hover:text-white hover:bg-red-500/10 rounded-[1.5rem] transition-all font-bold text-sm"
                        >
                            <LogOut size={20} />
                            <span>Quitter le service</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar (Mobile Only) */}
                <header className="bg-[#111113] border-b border-white/5 h-20 flex items-center px-6 lg:hidden shrink-0">
                    <button onClick={() => setSidebarOpen(true)} className="p-3 bg-white/5 rounded-2xl text-white">
                        <MenuIcon size={20} />
                    </button>
                    <span className="ml-4 font-black italic tracking-tighter text-white">STAFF DASHBOARD</span>
                    <button className="ml-auto p-3 bg-white/5 rounded-2xl text-white relative">
                        <Bell size={20} />
                        <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[#111113]"></div>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto w-full max-w-[1600px] mx-auto bg-[#0A0A0B]">
                    {children}
                </main>
            </div>
        </div>
    );
};
