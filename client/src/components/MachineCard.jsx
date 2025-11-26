import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Activity, Wifi, WifiOff } from 'lucide-react';

const MachineCard = ({ machine }) => {
    const isOnline = machine.status === 'online';

    return (
        <Link to={`/watch/${machine.id}`} className="group relative block aspect-video bg-netflix-gray rounded-md overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-xl hover:shadow-black/50">
            <img
                src={machine.image}
                alt={machine.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />

            {/* Status Badge */}
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
                {isOnline ? (
                    <>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-green-400">AO VIVO</span>
                    </>
                ) : (
                    <>
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-xs font-bold text-gray-400">OFFLINE</span>
                    </>
                )}
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <h3 className="text-lg font-bold text-white mb-1">{machine.name}</h3>
                <div className="flex items-center gap-2 text-xs text-green-400 mb-2">
                    <span className="font-semibold">98% Match</span>
                    <span className="text-gray-300 border border-gray-500 px-1 rounded">{machine.type}</span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-netflix-red hover:text-white transition-colors">
                        <Play size={16} fill="currentColor" />
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center text-gray-300 hover:border-white hover:text-white transition-colors">
                        <Activity size={16} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default MachineCard;
