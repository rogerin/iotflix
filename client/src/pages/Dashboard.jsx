import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../services/socket';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Thermometer, Zap, Gauge, Droplets, Wind, Battery } from 'lucide-react';

// Helper to get icon based on sensor name
const getIcon = (key) => {
    if (key.includes('temp')) return <Thermometer size={18} />;
    if (key.includes('vib') || key.includes('speed') || key.includes('rot')) return <Activity size={18} />;
    if (key.includes('press')) return <Gauge size={18} />;
    if (key.includes('volt') || key.includes('power')) return <Zap size={18} />;
    if (key.includes('level') || key.includes('flow')) return <Droplets size={18} />;
    if (key.includes('air')) return <Wind size={18} />;
    if (key.includes('batt')) return <Battery size={18} />;
    return <Activity size={18} />;
};

// Helper to assign colors to lines
const colors = ['#E50914', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard = () => {
    const { id } = useParams();
    const [machine, setMachine] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const handleUpdate = (data) => {
            if (data.id === id) {
                setMachine(data);
                setHistory(prev => {
                    const newHistory = [...prev, { ...data.sensors, time: new Date().toLocaleTimeString() }];
                    return newHistory.slice(-30); // Keep last 30 points
                });
            }
        };

        socket.on('machine:update', handleUpdate);

        // Request initial list to find machine immediately
        socket.emit('request:machines');
        socket.on('machines:list', (list) => {
            const found = list.find(m => m.id === id);
            if (found && !machine) setMachine(found);
        });

        return () => {
            socket.off('machine:update', handleUpdate);
            socket.off('machines:list');
        };
    }, [id, machine]);

    if (!machine) return <div className="flex items-center justify-center h-screen text-white">Carregando Dashboard...</div>;

    const sensorKeys = Object.keys(machine.sensors);

    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold">{machine.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${machine.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {machine.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">{machine.type}</span>
                </div>
            </header>

            {/* Dynamic KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sensorKeys.map((key) => (
                    <div key={key} className="bg-netflix-gray p-4 rounded-lg border border-transparent hover:border-gray-700 transition-colors">
                        <div className="flex items-center gap-2 text-gray-400 mb-2 capitalize">
                            {getIcon(key)}
                            <span>{key}</span>
                        </div>
                        <div className="text-2xl font-bold">
                            {typeof machine.sensors[key] === 'number'
                                ? machine.sensors[key].toFixed(1)
                                : machine.sensors[key]}
                        </div>
                    </div>
                ))}
            </div>

            {/* Dynamic Chart */}
            <div className="bg-netflix-gray p-6 rounded-lg h-[500px]">
                <h3 className="text-lg font-bold mb-4">Monitoramento em Tempo Real</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="time" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#141414', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        {sensorKeys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
