import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MonitorPlay, Settings2, Activity } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-netflix-black text-white font-sans">
            <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent px-8 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-netflix-red font-bold text-3xl tracking-tighter hover:scale-105 transition-transform">
                    IoTFlix
                    <span className="text-xs text-white/60 font-normal tracking-normal border border-white/20 px-1 rounded">INDUSTRIAL</span>
                </Link>

                <div className="flex gap-6">
                    <Link
                        to="/"
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Início
                    </Link>
                    <Link
                        to="/simulator"
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/simulator' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Settings2 size={16} />
                        Simulador
                    </Link>
                    <Link
                        to="/flows"
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/flows' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Activity size={16} />
                        Fluxos
                    </Link>
                </div>
            </nav>

            <main className="pt-20 pb-10 px-8 min-h-screen">
                {children}
            </main>
        </div>
    );
};

export default Layout;
