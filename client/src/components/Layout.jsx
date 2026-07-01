import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Network, Settings2 } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-netflix-black text-white font-sans">
            <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-4 flex items-center justify-between gap-3 md:px-8">
                <Link to="/" className="flex shrink-0 items-center gap-2 text-netflix-red font-bold text-2xl hover:scale-105 transition-transform md:text-3xl">
                    IoTFlix
                    <span className="hidden text-xs text-white/60 font-normal border border-white/20 px-1 rounded sm:inline">INDUSTRIAL</span>
                </Link>

                <div className="flex min-w-0 items-center gap-3 md:gap-6">
                    <Link
                        to="/"
                        className={`flex shrink-0 items-center gap-2 text-xs font-medium transition-colors sm:text-sm ${location.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Início
                    </Link>
                    <Link
                        to="/simulator"
                        className={`flex shrink-0 items-center gap-1.5 text-xs font-medium transition-colors sm:gap-2 sm:text-sm ${location.pathname === '/simulator' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Settings2 size={16} />
                        Simulador
                    </Link>
                    <Link
                        to="/flows"
                        className={`flex shrink-0 items-center gap-1.5 text-xs font-medium transition-colors sm:gap-2 sm:text-sm ${location.pathname === '/flows' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Activity size={16} />
                        Fluxos
                    </Link>
                    <Link
                        to="/scada-lab"
                        className={`flex shrink-0 items-center gap-1.5 text-xs font-medium transition-colors sm:gap-2 sm:text-sm ${location.pathname === '/scada-lab' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Network size={16} />
                        SCADA
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
