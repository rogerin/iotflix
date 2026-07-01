import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Gauge, Radio, Server, SlidersHorizontal, Wifi } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { socket } from '../services/socket';

const OFFLINE_TIMEOUT_MS = 30000;
const HISTORY_LIMIT = 80;

const machineLayout = {
    'machine-1': { x: 190, y: 350, symbol: 'conveyor', group: 'Linha A' },
    'machine-2': { x: 480, y: 300, symbol: 'press', group: 'Linha A' },
    'machine-3': { x: 760, y: 300, symbol: 'robot', group: 'Linha A' },
    'machine-4': { x: 1040, y: 350, symbol: 'scanner', group: 'Linha A' },
    'machine-5': { x: 260, y: 640, symbol: 'compressor', group: 'Utilidades' },
    'machine-6': { x: 560, y: 620, symbol: 'tank', group: 'Processo' },
    'machine-7': { x: 860, y: 640, symbol: 'generator', group: 'Energia' },
    'machine-8': { x: 1140, y: 610, symbol: 'vehicle', group: 'Logistica' }
};

const pipes = [
    { id: 'pipe-a1', from: 'machine-1', to: 'machine-2', label: 'material' },
    { id: 'pipe-a2', from: 'machine-2', to: 'machine-3', label: 'processo' },
    { id: 'pipe-a3', from: 'machine-3', to: 'machine-4', label: 'inspecao' },
    { id: 'pipe-u1', from: 'machine-5', to: 'machine-6', label: 'ar/fluido' },
    { id: 'pipe-u2', from: 'machine-6', to: 'machine-7', label: 'energia' },
    { id: 'pipe-u3', from: 'machine-7', to: 'machine-8', label: 'suporte' },
    { id: 'pipe-bridge', from: 'machine-6', to: 'machine-2', label: 'linha auxiliar' }
];

const sensorMeta = {
    temperature: { label: 'Temperatura', unit: 'C', warning: 75, critical: 100, max: 150 },
    vibration: { label: 'Vibração', unit: 'mm/s', warning: 45, critical: 75, max: 100 },
    speed: { label: 'Velocidade', unit: 'rpm', warning: 2200, critical: 2800, max: 3000 },
    pressure: { label: 'Pressão', unit: 'bar', warning: 70, critical: 90, max: 100 },
    cycles: { label: 'Ciclos', unit: 'ciclos', warning: 75, critical: 95, max: 100 },
    axisX: { label: 'Eixo X', unit: 'mm', warning: 70, critical: 90, max: 100 },
    axisY: { label: 'Eixo Y', unit: 'mm', warning: 70, critical: 90, max: 100 },
    axisZ: { label: 'Eixo Z', unit: 'mm', warning: 70, critical: 90, max: 100 },
    load: { label: 'Carga', unit: '%', warning: 70, critical: 90, max: 100 },
    accuracy: { label: 'Acurácia', unit: '%', warningBelow: 75, criticalBelow: 55, max: 100 },
    scans: { label: 'Leituras', unit: 'scan/s', warning: 75, critical: 95, max: 100 },
    airflow: { label: 'Vazão de ar', unit: 'm3/min', warning: 75, critical: 95, max: 100 },
    level: { label: 'Nível', unit: '%', warning: 80, critical: 95, max: 100 },
    ph: { label: 'pH', unit: 'pH', warning: 11, critical: 13, max: 14 },
    voltage: { label: 'Tensão', unit: 'V', warning: 330, critical: 370, max: 380 },
    frequency: { label: 'Frequência', unit: 'Hz', warning: 58, critical: 61, max: 60 },
    fuel: { label: 'Combustível', unit: '%', warningBelow: 30, criticalBelow: 15, max: 100 },
    battery: { label: 'Bateria', unit: '%', warningBelow: 30, criticalBelow: 15, max: 100 }
};

const fallbackMachines = [
    { id: 'machine-1', name: 'Esteira 01', type: 'Esteira Inteligente', status: 'offline', sensors: { temperature: 0, vibration: 0, speed: 0 }, actuators: { motor: false } },
    { id: 'machine-2', name: 'Prensa Hidráulica A', type: 'Prensa', status: 'offline', sensors: { pressure: 0, temperature: 0, cycles: 0 }, actuators: { pump: false, valve: false } },
    { id: 'machine-3', name: 'Braço Robótico X1', type: 'Robô', status: 'offline', sensors: { axisX: 0, axisY: 0, axisZ: 0, load: 0 }, actuators: { gripper: false, power: false } },
    { id: 'machine-4', name: 'Sensor de Qualidade', type: 'Sensor', status: 'offline', sensors: { accuracy: 0, scans: 0 }, actuators: { laser: false } },
    { id: 'machine-5', name: 'Compressor Industrial', type: 'Compressor', status: 'offline', sensors: { pressure: 0, temperature: 0, airflow: 0 }, actuators: { motor: false } },
    { id: 'machine-6', name: 'Tanque de Mistura', type: 'Tanque', status: 'offline', sensors: { level: 0, temperature: 0, ph: 0 }, actuators: { mixer: false, valve: false } },
    { id: 'machine-7', name: 'Gerador Diesel', type: 'Gerador', status: 'offline', sensors: { voltage: 0, frequency: 0, fuel: 0 }, actuators: { starter: false } },
    { id: 'machine-8', name: 'Empilhadeira Autônoma', type: 'Veículo', status: 'offline', sensors: { battery: 0, speed: 0, load: 0 }, actuators: { motor: false, lift: false } }
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getNumericSensors = (machine) => Object.entries(machine?.sensors ?? {})
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value));

const getSensorSeverity = (key, value) => {
    const meta = sensorMeta[key] ?? {};

    if (typeof meta.criticalBelow === 'number' && value <= meta.criticalBelow) return 'critical';
    if (typeof meta.warningBelow === 'number' && value <= meta.warningBelow) return 'warning';
    if (typeof meta.critical === 'number' && value >= meta.critical) return 'critical';
    if (typeof meta.warning === 'number' && value >= meta.warning) return 'warning';
    return 'normal';
};

const getMachineSeverity = (machine, now) => {
    const lastUpdate = machine?.lastUpdate ?? 0;
    const stale = machine?.status === 'online' && lastUpdate && now - lastUpdate > OFFLINE_TIMEOUT_MS;

    if (machine?.status !== 'online' || stale) return stale ? 'stale' : 'offline';

    const severities = getNumericSensors(machine).map(([key, value]) => getSensorSeverity(key, value));
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('warning')) return 'warning';
    return 'normal';
};

const getMachineLoad = (machine) => {
    const numeric = getNumericSensors(machine);
    if (numeric.length === 0) return 0;

    const normalized = numeric.map(([key, value]) => {
        const meta = sensorMeta[key] ?? {};
        const max = typeof meta.max === 'number' && meta.max > 0 ? meta.max : 100;
        return clamp(value / max, 0, 1);
    });

    return normalized.reduce((sum, value) => sum + value, 0) / normalized.length;
};

const getPrimarySensor = (machine) => {
    const numeric = getNumericSensors(machine);
    if (numeric.length === 0) return null;

    return numeric.reduce((selected, current) => {
        const selectedMeta = sensorMeta[selected[0]] ?? {};
        const currentMeta = sensorMeta[current[0]] ?? {};
        const selectedRatio = selected[1] / (selectedMeta.max || 100);
        const currentRatio = current[1] / (currentMeta.max || 100);
        return currentRatio > selectedRatio ? current : selected;
    }, numeric[0]);
};

const formatSensorValue = (key, value) => {
    const meta = sensorMeta[key] ?? {};
    const formatted = typeof value === 'number' ? value.toFixed(value >= 100 ? 0 : 1) : value;
    return `${formatted}${meta.unit ? ` ${meta.unit}` : ''}`;
};

const statusStyles = {
    normal: { stroke: '#22c55e', fill: '#052e1a', text: 'Normal' },
    warning: { stroke: '#f59e0b', fill: '#3b2600', text: 'Atenção' },
    critical: { stroke: '#ef4444', fill: '#3b0a0a', text: 'Crítico' },
    stale: { stroke: '#38bdf8', fill: '#082f49', text: 'Sem sinal' },
    offline: { stroke: '#6b7280', fill: '#1f2937', text: 'Offline' }
};

const mergeMachines = (machines) => {
    const map = new Map(fallbackMachines.map((machine) => [machine.id, machine]));
    machines.forEach((machine) => map.set(machine.id, { ...map.get(machine.id), ...machine }));
    return Array.from(map.values());
};

const useScadaMachines = () => {
    const [machinesById, setMachinesById] = useState(() => new Map(fallbackMachines.map((machine) => [machine.id, machine])));
    const [historyById, setHistoryById] = useState({});
    const [connectionState, setConnectionState] = useState(socket.connected ? 'connected' : 'connecting');
    const [lastMessageAt, setLastMessageAt] = useState(null);
    const [clock, setClock] = useState(0);

    useEffect(() => {
        const handleConnect = () => setConnectionState('connected');
        const handleDisconnect = () => setConnectionState('disconnected');
        const handleMachines = (list) => {
            const merged = mergeMachines(list);
            setMachinesById(new Map(merged.map((machine) => [machine.id, machine])));
            setConnectionState('connected');
            setLastMessageAt(Date.now());
        };
        const handleUpdate = (machine) => {
            const receivedAt = Date.now();
            const snapshot = { ...machine, lastUpdate: machine.lastUpdate ?? receivedAt };
            setConnectionState('connected');

            setMachinesById((previous) => {
                const next = new Map(previous);
                next.set(snapshot.id, { ...next.get(snapshot.id), ...snapshot });
                return next;
            });

            setHistoryById((previous) => {
                const currentHistory = previous[snapshot.id] ?? [];
                const primary = getPrimarySensor(snapshot);
                const nextPoint = {
                    time: new Date(receivedAt).toLocaleTimeString(),
                    timestamp: receivedAt,
                    load: Number((getMachineLoad(snapshot) * 100).toFixed(1)),
                    sensorKey: primary?.[0] ?? 'load',
                    value: Number((primary?.[1] ?? 0).toFixed(2))
                };

                return {
                    ...previous,
                    [snapshot.id]: [...currentHistory, nextPoint].slice(-HISTORY_LIMIT)
                };
            });

            setLastMessageAt(receivedAt);
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('machines:list', handleMachines);
        socket.on('machine:update', handleUpdate);
        socket.emit('request:machines');

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('machines:list', handleMachines);
            socket.off('machine:update', handleUpdate);
        };
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => setClock(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    return {
        machines: Array.from(machinesById.values()),
        machinesById,
        historyById,
        connectionState,
        lastMessageAt,
        now: clock
    };
};

const Pipe = ({ pipe, machinesById, now }) => {
    const fromPosition = machineLayout[pipe.from];
    const toPosition = machineLayout[pipe.to];
    if (!fromPosition || !toPosition) return null;

    const fromMachine = machinesById.get(pipe.from);
    const toMachine = machinesById.get(pipe.to);
    const fromSeverity = getMachineSeverity(fromMachine, now);
    const toSeverity = getMachineSeverity(toMachine, now);
    const active = ['normal', 'warning'].includes(fromSeverity) && ['normal', 'warning'].includes(toSeverity);

    return (
        <g>
            <line
                x1={fromPosition.x}
                y1={fromPosition.y}
                x2={toPosition.x}
                y2={toPosition.y}
                stroke="#293241"
                strokeWidth="18"
                strokeLinecap="round"
            />
            <line
                x1={fromPosition.x}
                y1={fromPosition.y}
                x2={toPosition.x}
                y2={toPosition.y}
                className={active ? 'scada-pipe-flow' : ''}
                stroke={active ? '#38bdf8' : '#4b5563'}
                strokeWidth="7"
                strokeLinecap="round"
                opacity={active ? 0.95 : 0.55}
            />
            <text
                x={(fromPosition.x + toPosition.x) / 2}
                y={(fromPosition.y + toPosition.y) / 2 - 12}
                fill="#9ca3af"
                fontSize="18"
                textAnchor="middle"
            >
                {pipe.label}
            </text>
        </g>
    );
};

const TankSymbol = ({ level, stroke, fill }) => {
    const normalizedLevel = clamp(level || 0, 0, 100);
    const fillHeight = (normalizedLevel / 100) * 112;
    const fillY = 64 - fillHeight;

    return (
        <g>
            <rect x="-50" y="-74" width="100" height="148" rx="28" fill={fill} stroke={stroke} strokeWidth="5" />
            <clipPath id="tank-clip">
                <rect x="-44" y="-64" width="88" height="128" rx="22" />
            </clipPath>
            <rect x="-44" y={fillY} width="88" height={fillHeight} fill="#38bdf8" opacity="0.7" clipPath="url(#tank-clip)" />
            <line x1="-42" y1="0" x2="42" y2="0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 6" />
        </g>
    );
};

const PumpSymbol = ({ active, stroke, fill }) => (
    <g>
        <circle cx="0" cy="0" r="48" fill={fill} stroke={stroke} strokeWidth="5" />
        <circle cx="0" cy="0" r="17" fill="#111827" stroke="#cbd5e1" strokeWidth="3" />
        <g className={active ? 'scada-rotor' : ''}>
            <path d="M0 -38 L12 -7 L0 0 L-12 -7 Z" fill="#cbd5e1" />
            <path d="M38 0 L7 12 L0 0 L7 -12 Z" fill="#cbd5e1" />
            <path d="M0 38 L-12 7 L0 0 L12 7 Z" fill="#cbd5e1" />
        </g>
    </g>
);

const ValveSymbol = ({ active, stroke, fill }) => (
    <g>
        <path d="M-48 -34 L0 0 L-48 34 Z" fill={fill} stroke={stroke} strokeWidth="5" />
        <path d="M48 -34 L0 0 L48 34 Z" fill={fill} stroke={stroke} strokeWidth="5" />
        <line x1="0" y1="-44" x2="0" y2="44" stroke={active ? '#22c55e' : '#94a3b8'} strokeWidth="5" strokeLinecap="round" />
    </g>
);

const ConveyorSymbol = ({ active, stroke, fill }) => (
    <g>
        <rect x="-62" y="-34" width="124" height="68" rx="16" fill={fill} stroke={stroke} strokeWidth="5" />
        <circle cx="-36" cy="0" r="13" fill="#111827" stroke="#cbd5e1" strokeWidth="3" />
        <circle cx="36" cy="0" r="13" fill="#111827" stroke="#cbd5e1" strokeWidth="3" />
        <line x1="-42" y1="-18" x2="42" y2="-18" stroke={active ? '#38bdf8' : '#64748b'} strokeWidth="5" strokeLinecap="round" />
    </g>
);

const RobotSymbol = ({ active, stroke, fill }) => (
    <g>
        <rect x="-48" y="16" width="96" height="46" rx="12" fill={fill} stroke={stroke} strokeWidth="5" />
        <circle cx="-16" cy="-12" r="20" fill={fill} stroke={stroke} strokeWidth="5" />
        <path d="M-2 -24 L36 -52 L56 -30 L20 -2" fill="none" stroke={active ? '#38bdf8' : '#94a3b8'} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M58 -32 L74 -46 M58 -32 L80 -24" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
    </g>
);

const GenericSymbol = ({ active, stroke, fill, symbol }) => {
    if (symbol === 'tank') return null;
    if (symbol === 'compressor' || symbol === 'generator') return <PumpSymbol active={active} stroke={stroke} fill={fill} />;
    if (symbol === 'press') return <ValveSymbol active={active} stroke={stroke} fill={fill} />;
    if (symbol === 'conveyor') return <ConveyorSymbol active={active} stroke={stroke} fill={fill} />;
    if (symbol === 'robot') return <RobotSymbol active={active} stroke={stroke} fill={fill} />;

    return (
        <g>
            <rect x="-54" y="-44" width="108" height="88" rx="14" fill={fill} stroke={stroke} strokeWidth="5" />
            <circle cx="-20" cy="-8" r="8" fill={active ? '#22c55e' : '#94a3b8'} />
            <circle cx="16" cy="-8" r="8" fill="#94a3b8" />
            <line x1="-24" y1="20" x2="28" y2="20" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
        </g>
    );
};

const MachineSymbol = ({ machine, position, selected, onSelect, now }) => {
    const severity = getMachineSeverity(machine, now);
    const style = statusStyles[severity] ?? statusStyles.offline;
    const load = getMachineLoad(machine);
    const active = ['normal', 'warning'].includes(severity) && load > 0.03;
    const levelSensor = machine?.sensors?.level ?? load * 100;
    const primarySensor = getPrimarySensor(machine);

    return (
        <g
            transform={`translate(${position.x} ${position.y})`}
            role="button"
            tabIndex="0"
            aria-label={`${machine.name}, ${style.text}`}
            onClick={() => onSelect(machine.id)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(machine.id);
                }
            }}
            className="cursor-pointer outline-none"
        >
            {selected && <circle r="92" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="8 8" opacity="0.75" />}
            {severity === 'critical' && <circle r="78" className="scada-alarm-ring" fill="none" stroke="#ef4444" strokeWidth="4" />}
            {position.symbol === 'tank'
                ? <TankSymbol level={levelSensor} stroke={style.stroke} fill={style.fill} />
                : <GenericSymbol symbol={position.symbol} active={active} stroke={style.stroke} fill={style.fill} />}
            <circle cx="58" cy="-52" r="12" fill={style.stroke} />
            <text y="98" fill="#ffffff" fontSize="22" fontWeight="700" textAnchor="middle">{machine.name}</text>
            <text y="125" fill="#9ca3af" fontSize="17" textAnchor="middle">{position.group}</text>
            {primarySensor && (
                <text y="151" fill="#cbd5e1" fontSize="17" textAnchor="middle">
                    {sensorMeta[primarySensor[0]]?.label ?? primarySensor[0]}: {formatSensorValue(primarySensor[0], primarySensor[1])}
                </text>
            )}
        </g>
    );
};

const ScadaCanvas = ({ machines, machinesById, selectedMachineId, onSelectMachine, now }) => (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#0b111a]">
        <svg className="min-h-[620px] min-w-[1120px] w-full" viewBox="0 0 1360 820" role="img" aria-label="Planta SCADA com maquinas industriais">
            <defs>
                <linearGradient id="scada-bg" x1="0" x2="1">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#111827" />
                </linearGradient>
            </defs>
            <rect width="1360" height="820" fill="url(#scada-bg)" />
            <g opacity="0.18">
                {Array.from({ length: 18 }).map((_, index) => (
                    <line key={`v-${index}`} x1={index * 80} y1="0" x2={index * 80} y2="820" stroke="#94a3b8" strokeWidth="1" />
                ))}
                {Array.from({ length: 11 }).map((_, index) => (
                    <line key={`h-${index}`} x1="0" y1={index * 80} x2="1360" y2={index * 80} stroke="#94a3b8" strokeWidth="1" />
                ))}
            </g>
            <text x="44" y="64" fill="#e5e7eb" fontSize="28" fontWeight="800">SCADA Lab - Planta viva</text>
            <text x="44" y="96" fill="#9ca3af" fontSize="18">Dados vindos do simulador via Socket.IO</text>
            <g>
                {pipes.map((pipe) => (
                    <Pipe key={pipe.id} pipe={pipe} machinesById={machinesById} now={now} />
                ))}
            </g>
            <g>
                {machines.map((machine) => {
                    const position = machineLayout[machine.id];
                    if (!position) return null;

                    return (
                        <MachineSymbol
                            key={machine.id}
                            machine={machine}
                            position={position}
                            selected={selectedMachineId === machine.id}
                            onSelect={onSelectMachine}
                            now={now}
                        />
                    );
                })}
            </g>
        </svg>
    </div>
);

const MiniTrend = ({ history }) => {
    if (!history || history.length < 2) {
        return (
            <div className="flex h-52 items-center justify-center rounded border border-white/10 bg-black/25 text-sm text-gray-500">
                Aguardando dados do simulador.
            </div>
        );
    }

    return (
        <div className="h-52 rounded border border-white/10 bg-black/25 p-3">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#64748b" width={32} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#fff' }}
                        labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Line type="monotone" dataKey="load" stroke="#38bdf8" strokeWidth={2} dot={false} name="Carga %" />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} name="Sensor principal" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const MachineDetails = ({ machine, history, now }) => {
    const severity = getMachineSeverity(machine, now);
    const style = statusStyles[severity] ?? statusStyles.offline;
    const lastUpdate = machine?.lastUpdate ? new Date(machine.lastUpdate).toLocaleTimeString() : 'sem atualização';

    return (
        <aside className="rounded-lg border border-white/10 bg-netflix-gray p-5">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <p className="text-sm font-semibold text-netflix-red">Máquina selecionada</p>
                    <h2 className="mt-2 text-2xl font-bold text-white">{machine.name}</h2>
                    <p className="mt-1 text-sm text-gray-400">{machine.type}</p>
                </div>
                <span className="rounded px-2 py-1 text-xs font-bold text-white" style={{ backgroundColor: style.stroke }}>
                    {style.text}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-white/10 py-4 text-sm">
                <div className="rounded border border-white/10 bg-black/25 p-3">
                    <p className="text-gray-500">Último update</p>
                    <p className="mt-1 font-semibold text-white">{lastUpdate}</p>
                </div>
                <div className="rounded border border-white/10 bg-black/25 p-3">
                    <p className="text-gray-500">Carga derivada</p>
                    <p className="mt-1 font-semibold text-white">{(getMachineLoad(machine) * 100).toFixed(1)}%</p>
                </div>
            </div>

            <div className="border-b border-white/10 py-4">
                <h3 className="text-sm font-bold text-white">Sensores</h3>
                <div className="mt-3 space-y-2">
                    {Object.entries(machine.sensors ?? {}).map(([key, value]) => {
                        const sensorSeverity = typeof value === 'number' ? getSensorSeverity(key, value) : 'normal';
                        const sensorStyle = statusStyles[sensorSeverity] ?? statusStyles.normal;

                        return (
                            <div key={key} className="flex items-center justify-between rounded border border-white/10 bg-black/25 px-3 py-2 text-sm">
                                <span className="text-gray-300">{sensorMeta[key]?.label ?? key}</span>
                                <span className="font-mono font-semibold" style={{ color: sensorStyle.stroke }}>
                                    {formatSensorValue(key, value)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border-b border-white/10 py-4">
                <h3 className="text-sm font-bold text-white">Atuadores</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    {Object.entries(machine.actuators ?? {}).map(([key, value]) => (
                        <div key={key} className="rounded border border-white/10 bg-black/25 px-3 py-2 text-sm">
                            <p className="text-gray-500">{key}</p>
                            <p className="font-semibold text-white">{String(value)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                <h3 className="mb-3 text-sm font-bold text-white">Tendência ao vivo</h3>
                <MiniTrend history={history} />
            </div>
        </aside>
    );
};

const ScadaLab = () => {
    const { machines, machinesById, historyById, connectionState, lastMessageAt, now } = useScadaMachines();
    const [selectedMachineId, setSelectedMachineId] = useState('machine-1');

    const selectedMachine = machinesById.get(selectedMachineId) ?? machines[0] ?? fallbackMachines[0];
    const selectedHistory = historyById[selectedMachine.id] ?? [];
    const lastMessageLabel = lastMessageAt ? new Date(lastMessageAt).toLocaleTimeString() : 'aguardando';

    const summary = useMemo(() => {
        const total = machines.length;
        const online = machines.filter((machine) => getMachineSeverity(machine, now) === 'normal').length;
        const attention = machines.filter((machine) => ['warning', 'critical'].includes(getMachineSeverity(machine, now))).length;
        const offline = machines.filter((machine) => ['offline', 'stale'].includes(getMachineSeverity(machine, now))).length;

        return { total, online, attention, offline };
    }, [machines, now]);

    return (
        <section className="mx-auto max-w-7xl space-y-6 animate-fade-in">
            <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="mb-2 text-sm font-semibold text-netflix-red">Exemplo isolado</p>
                    <h1 className="text-3xl font-bold text-white md:text-4xl">SCADA Lab: máquinas vivas</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
                        Protótipo separado inspirado em P&ID/SCADA: o simulador envia sensores, o flow anima a planta e o gráfico acompanha o histórico local.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-xs text-gray-500">Conexão</p>
                        <p className="mt-1 text-sm font-bold text-white">{connectionState}</p>
                    </div>
                    <div className="rounded border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-xs text-gray-500">Máquinas</p>
                        <p className="mt-1 text-sm font-bold text-white">{summary.total}</p>
                    </div>
                    <div className="rounded border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-xs text-gray-500">Normais</p>
                        <p className="mt-1 text-sm font-bold text-green-400">{summary.online}</p>
                    </div>
                    <div className="rounded border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-xs text-gray-500">Atenção/offline</p>
                        <p className="mt-1 text-sm font-bold text-amber-400">{summary.attention + summary.offline}</p>
                    </div>
                    <div className="rounded border border-white/10 bg-white/5 px-4 py-3 md:col-span-4">
                        <p className="text-xs text-gray-500">Último evento</p>
                        <p className="mt-1 text-sm font-bold text-white">{lastMessageLabel}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                <div className="rounded-lg border border-white/10 bg-netflix-gray p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                        <SlidersHorizontal size={16} />
                        Como testar
                    </div>
                    <p className="text-sm leading-6 text-gray-400">
                        Abra o Simulador, marque <span className="font-semibold text-white">Simular TODAS</span> e inicie a transmissão. Esta tela vai receber `machine:update` e animar o flow.
                    </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-netflix-gray p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                        <Radio size={16} />
                        Snapshot
                    </div>
                    <p className="text-sm leading-6 text-gray-400">Cada máquina usa o último estado recebido para cor, status e animação.</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-netflix-gray p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                        <Activity size={16} />
                        Histórico
                    </div>
                    <p className="text-sm leading-6 text-gray-400">O gráfico guarda os últimos {HISTORY_LIMIT} pontos no frontend, sem mudar o backend.</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-netflix-gray p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                        <AlertTriangle size={16} />
                        Stale
                    </div>
                        <p className="text-sm leading-6 text-gray-400">Se uma máquina online parar de atualizar por 30s, ela vira “Sem sinal”.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <ScadaCanvas
                    machines={machines}
                    machinesById={machinesById}
                    selectedMachineId={selectedMachine.id}
                    onSelectMachine={setSelectedMachineId}
                    now={now}
                />
                <MachineDetails machine={selectedMachine} history={selectedHistory} now={now} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                        <Server size={16} />
                        Análise de arquitetura
                    </div>
                    <p className="text-sm leading-6 text-gray-400">
                        O payload atual não traz topologia; por isso a planta usa layout manual por ID e separa telemetria de desenho.
                    </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                        <Gauge size={16} />
                        Severidade
                    </div>
                    <p className="text-sm leading-6 text-gray-400">
                        Limites por sensor geram normal, atenção ou crítico. Sensores desconhecidos entram no painel técnico.
                    </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                        <Wifi size={16} />
                        Próximo passo
                    </div>
                    <p className="text-sm leading-6 text-gray-400">
                        Evoluir para contrato com unidade, qualidade, alarmes e topologia real quando o exemplo virar produto.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ScadaLab;
