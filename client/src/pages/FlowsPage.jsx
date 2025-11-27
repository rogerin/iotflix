import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Server, Smartphone, Wifi, Radio, User, ArrowRight } from 'lucide-react';

const FlowsPage = () => {
    const [activeFlow, setActiveFlow] = useState(null);
    const [description, setDescription] = useState("Select a flow to visualize");

    const handleFlowStart = (flowId) => {
        setActiveFlow(null); // Reset
        setTimeout(() => {
            setActiveFlow(flowId);
            if (flowId === 1) setDescription("Fluxo Padrão: Sensor -> Protocolo -> Backend -> Banco de Dados. Usuário solicita.");
            if (flowId === 2) setDescription("Fluxo Direto: Sensor -> Protocolo -> Usuário (Tempo Real). Backend salva em paralelo.");
            if (flowId === 3) setDescription("Fluxo Push: Sensor -> Protocolo -> Backend -> Empurra pro Usuário + Salva.");
        }, 100);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8 text-center text-red-600">Arquiteturas de Fluxo IoT</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <button
                    onClick={() => handleFlowStart(1)}
                    className={`p-4 rounded-xl border-2 transition-all ${activeFlow === 1 ? 'border-red-600 bg-red-600/20' : 'border-gray-700 hover:border-red-500'}`}
                >
                    <h3 className="text-xl font-bold mb-2">1. Padrão (Pull)</h3>
                    <p className="text-sm text-gray-400">Coleta &rarr; Processa &rarr; Armazena. Usuário solicita quando precisa.</p>
                </button>

                <button
                    onClick={() => handleFlowStart(2)}
                    className={`p-4 rounded-xl border-2 transition-all ${activeFlow === 2 ? 'border-red-600 bg-red-600/20' : 'border-gray-700 hover:border-red-500'}`}
                >
                    <h3 className="text-xl font-bold mb-2">2. Direto & Paralelo</h3>
                    <p className="text-sm text-gray-400">Envia direto pro usuário E processa/armazena em paralelo.</p>
                </button>

                <button
                    onClick={() => handleFlowStart(3)}
                    className={`p-4 rounded-xl border-2 transition-all ${activeFlow === 3 ? 'border-red-600 bg-red-600/20' : 'border-gray-700 hover:border-red-500'}`}
                >
                    <h3 className="text-xl font-bold mb-2">3. Backend Push</h3>
                    <p className="text-sm text-gray-400">Processa e já empurra pro usuário em tempo real + armazena.</p>
                </button>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 h-[600px] relative overflow-hidden border border-gray-800 shadow-2xl">
                <div className="absolute top-4 left-0 right-0 text-center text-gray-400 italic text-lg">
                    {description}
                </div>

                {/* Nodes Layout - Absolute Positioning for Precision */}
                {/* Main Row Y = 30% */}
                {/* Storage Row Y = 70% */}

                {/* Sensor: 10%, 30% */}
                <div className="absolute left-[10%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
                    <div className="w-24 h-24 rounded-full bg-blue-900/50 border-4 border-blue-500 flex items-center justify-center relative shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        <Radio className="w-12 h-12 text-blue-400" />
                        {activeFlow && (
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-blue-400"
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </div>
                    <span className="font-bold text-blue-400 text-lg">Sensor</span>
                </div>

                {/* Protocol: 30%, 30% */}
                <div className="absolute left-[30%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
                    <div className="w-24 h-24 rounded-xl bg-purple-900/50 border-4 border-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                        <Wifi className="w-12 h-12 text-purple-400" />
                    </div>
                    <span className="font-bold text-purple-400 text-lg">Protocolo</span>
                    <span className="text-xs text-gray-500">MQTT/HTTP</span>
                </div>

                {/* Backend: 50%, 30% */}
                <div className="absolute left-[50%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
                    <div className="w-24 h-24 rounded-xl bg-green-900/50 border-4 border-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                        <Server className="w-12 h-12 text-green-400" />
                    </div>
                    <span className="font-bold text-green-400 text-lg">Backend</span>
                </div>

                {/* User: 90%, 30% */}
                <div className="absolute left-[90%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
                    <div className="w-24 h-24 rounded-full bg-red-900/50 border-4 border-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                        <User className="w-12 h-12 text-red-400" />
                    </div>
                    <span className="font-bold text-red-400 text-lg">Usuário</span>
                </div>

                {/* Storage: 50%, 75% */}
                <div className="absolute left-[50%] top-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
                    <div className="w-24 h-24 rounded-xl bg-yellow-900/50 border-4 border-yellow-500 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                        <Database className="w-12 h-12 text-yellow-400" />
                    </div>
                    <span className="font-bold text-yellow-400 text-lg">Banco de Dados</span>
                </div>

                {/* Static Paths (Visual Lines) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-30">
                    {/* Sensor -> Protocol */}
                    <line x1="10%" y1="30%" x2="30%" y2="30%" stroke="white" strokeWidth="4" />
                    {/* Protocol -> Backend */}
                    <line x1="30%" y1="30%" x2="50%" y2="30%" stroke="white" strokeWidth="4" />
                    {/* Backend -> User */}
                    <line x1="50%" y1="30%" x2="90%" y2="30%" stroke="white" strokeWidth="4" />
                    {/* Backend -> Storage */}
                    <line x1="50%" y1="30%" x2="50%" y2="75%" stroke="white" strokeWidth="4" />

                    {/* Protocol -> User (Direct Curve) */}
                    <path d="M 30% 30% Q 60% 10% 90% 30%" stroke="white" strokeWidth="4" strokeDasharray="10,10" fill="none" />
                </svg>

                {/* Animations */}
                <AnimatePresence>
                    {activeFlow === 1 && (
                        <>
                            {/* 1. Sensor -> Protocol -> Backend -> Storage */}
                            <motion.div
                                className="absolute w-6 h-6 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,1)] z-20"
                                initial={{ left: "10%", top: "30%" }}
                                animate={{
                                    left: ["10%", "30%", "50%", "50%"],
                                    top: ["30%", "30%", "30%", "75%"]
                                }}
                                transition={{ duration: 4, times: [0, 0.33, 0.66, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                            />
                            {/* 2. User Request -> Backend -> User Response */}
                            <motion.div
                                className="absolute w-6 h-6 bg-red-500 rounded-full shadow-[0_0_15px_rgba(248,113,113,1)] z-20"
                                initial={{ left: "90%", top: "30%", opacity: 0 }}
                                animate={{
                                    left: ["90%", "50%", "90%"],
                                    opacity: [0, 1, 1, 0]
                                }}
                                transition={{ duration: 3, delay: 4, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
                            />
                        </>
                    )}

                    {activeFlow === 2 && (
                        <>
                            {/* Sensor -> Protocol */}
                            <motion.div
                                className="absolute w-6 h-6 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,1)] z-20"
                                initial={{ left: "10%", top: "30%" }}
                                animate={{ left: "30%" }}
                                transition={{ duration: 1.5, ease: "linear", repeat: Infinity, repeatDelay: 3.5 }}
                            />

                            {/* Protocol -> Backend -> Storage */}
                            <motion.div
                                className="absolute w-6 h-6 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,1)] z-20"
                                initial={{ left: "30%", top: "30%", opacity: 0 }}
                                animate={{
                                    left: ["30%", "50%", "50%"],
                                    top: ["30%", "30%", "75%"],
                                    opacity: [0, 1, 1, 0]
                                }}
                                transition={{ duration: 3, delay: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
                            />

                            {/* Protocol -> User (Direct - Curved Top) */}
                            <motion.div
                                className="absolute w-6 h-6 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(192,132,252,1)] z-20"
                                initial={{ left: "30%", top: "30%", opacity: 0 }}
                                animate={{
                                    left: ["30%", "60%", "90%"],
                                    top: ["30%", "10%", "30%"],
                                    opacity: [0, 1, 1, 0]
                                }}
                                transition={{ duration: 2.5, delay: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                            />
                        </>
                    )}

                    {activeFlow === 3 && (
                        <>
                            {/* Sensor -> Protocol -> Backend */}
                            <motion.div
                                className="absolute w-6 h-6 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,1)] z-20"
                                initial={{ left: "10%", top: "30%" }}
                                animate={{ left: ["10%", "30%", "50%"] }}
                                transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 2 }}
                            />

                            {/* Backend -> Storage */}
                            <motion.div
                                className="absolute w-6 h-6 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,1)] z-20"
                                initial={{ left: "50%", top: "30%", opacity: 0 }}
                                animate={{ top: ["30%", "75%"], opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, delay: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.5 }}
                            />

                            {/* Backend -> User (Push) */}
                            <motion.div
                                className="absolute w-6 h-6 bg-green-400 rounded-full shadow-[0_0_15px_rgba(74,222,128,1)] z-20"
                                initial={{ left: "50%", top: "30%", opacity: 0 }}
                                animate={{
                                    left: ["50%", "90%"],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{ duration: 1.5, delay: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.5 }}
                            />
                        </>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default FlowsPage;
