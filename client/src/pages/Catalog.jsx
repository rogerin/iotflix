import React, { useEffect, useState } from 'react';
import MachineCard from '../components/MachineCard';
import { socket } from '../services/socket';

const Catalog = () => {
    const [machines, setMachines] = useState([]);

    useEffect(() => {
        // Listen for initial list
        socket.on('machines:list', (data) => {
            setMachines(data);
        });

        // Listen for updates to keep status current
        socket.on('machine:update', (updatedMachine) => {
            setMachines(prev => prev.map(m => m.id === updatedMachine.id ? updatedMachine : m));
        });

        return () => {
            socket.off('machines:list');
            socket.off('machine:update');
        };
    }, []);

    useEffect(() => {
        socket.emit('request:machines');
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Máquinas em Destaque</h1>
                <p className="text-gray-400">Acompanhe a performance da sua indústria em tempo real.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {machines.map(machine => (
                    <MachineCard key={machine.id} machine={machine} />
                ))}
            </div>

            {machines.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <p>Carregando catálogo de máquinas...</p>
                </div>
            )}
        </div>
    );
};

export default Catalog;
