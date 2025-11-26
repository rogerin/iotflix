import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket';
import Button from '../components/Button';

const Simulator = () => {
  const [machines, setMachines] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulateAll, setSimulateAll] = useState(false);
  const [simulationMode, setSimulationMode] = useState('random'); // 'random' or 'manual'

  // Dynamic state for the selected machine's sensors
  const [currentSensorValues, setCurrentSensorValues] = useState({});

  const intervalRef = useRef(null);

  // Initial data load
  useEffect(() => {
    socket.on('machines:list', (data) => {
      setMachines(data);
      if (!selectedMachineId && data.length > 0) {
        setSelectedMachineId(data[0].id);
      }
    });
    return () => socket.off('machines:list');
  }, [selectedMachineId]);

  // Update local sensor values when machine selection changes
  useEffect(() => {
    if (selectedMachineId && machines.length > 0) {
      const machine = machines.find(m => m.id === selectedMachineId);
      if (machine) {
        // Initialize with current machine values
        setCurrentSensorValues(machine.sensors);
      }
    }
  }, [selectedMachineId, machines]);

  // Effect to handle immediate updates in Manual mode
  useEffect(() => {
    if (simulationActive && simulationMode === 'manual' && selectedMachineId && !simulateAll) {
      // Send immediate update for the selected machine in manual mode
      socket.emit('simulator:update', {
        machineId: selectedMachineId,
        status: 'online',
        sensors: currentSensorValues,
        actuators: {} // Preserve or simplify
      });
    }
  }, [currentSensorValues, simulationActive, simulationMode, selectedMachineId, simulateAll]);

  const generateDataForMachine = (machine, baseValues, mode) => {
    const noise = () => mode === 'random' ? (Math.random() - 0.5) * 5 : 0;
    const sensors = {};

    Object.keys(machine.sensors).forEach(key => {
      // If this is the selected machine, use the slider value (baseValues[key])
      // If it's another machine (during Simulate All), we need a strategy.
      // For simplicity in "Simulate All", we'll use the machine's LAST KNOWN value as base, or a random default.

      let base = 0;
      if (machine.id === selectedMachineId && baseValues[key] !== undefined) {
        base = baseValues[key];
      } else {
        // For other machines, just wiggle around their current value or a default
        base = machine.sensors[key] || 50;
      }

      // Ensure we don't produce negative values for things that shouldn't be negative
      sensors[key] = Math.max(0, base + noise());
    });

    return {
      machineId: machine.id,
      status: 'online',
      sensors,
      actuators: { ...machine.actuators }
    };
  };

  // Refs for interval
  const latestValuesRef = useRef(currentSensorValues);
  const latestModeRef = useRef(simulationMode);
  const latestSimulateAllRef = useRef(simulateAll);
  const latestSelectedIdRef = useRef(selectedMachineId);
  const latestMachinesRef = useRef(machines);

  useEffect(() => {
    latestValuesRef.current = currentSensorValues;
    latestModeRef.current = simulationMode;
    latestSimulateAllRef.current = simulateAll;
    latestSelectedIdRef.current = selectedMachineId;
    latestMachinesRef.current = machines;
  }, [currentSensorValues, simulationMode, simulateAll, selectedMachineId, machines]);

  const startSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimulationActive(true);

    intervalRef.current = setInterval(() => {
      const mode = latestModeRef.current;
      const values = latestValuesRef.current; // These are the sliders for the SELECTED machine
      const all = latestSimulateAllRef.current;
      const selected = latestSelectedIdRef.current;
      const currentMachines = latestMachinesRef.current;

      if (all) {
        currentMachines.forEach(m => {
          // For the selected machine, use 'values'. For others, use their own current state as base.
          const data = generateDataForMachine(m, values, mode);
          socket.emit('simulator:update', data);
        });
      } else if (selected) {
        const m = currentMachines.find(m => m.id === selected);
        if (m) {
          const data = generateDataForMachine(m, values, mode);
          socket.emit('simulator:update', data);
        }
      }
    }, 500); // 500ms interval
  };

  const stopSimulation = () => {
    clearInterval(intervalRef.current);
    setSimulationActive(false);

    const all = latestSimulateAllRef.current;
    const selected = latestSelectedIdRef.current;
    const currentMachines = latestMachinesRef.current;

    const machinesToStop = all ? currentMachines : currentMachines.filter(m => m.id === selected);

    machinesToStop.forEach(m => {
      socket.emit('simulator:update', {
        machineId: m.id,
        status: 'offline',
        sensors: Object.keys(m.sensors).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
      });
    });
  };

  const handleToggle = () => {
    if (simulationActive) stopSimulation();
    else startSimulation();
  };

  const selectedMachine = machines.find(m => m.id === selectedMachineId);

  // Helper to get max value for slider based on sensor name
  const getMaxValue = (key) => {
    if (key.includes('temp')) return 150;
    if (key.includes('vib')) return 100;
    if (key.includes('press')) return 100;
    if (key.includes('speed') || key.includes('rot')) return 3000;
    if (key.includes('volt')) return 380;
    if (key.includes('freq')) return 60;
    if (key.includes('ph')) return 14;
    return 100;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Simulador Industrial</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Machine Selection */}
        <div className="bg-netflix-gray p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Configuração</h2>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Modo de Simulação</label>
            <div className="flex bg-black/40 rounded p-1 border border-gray-700">
              <button
                onClick={() => setSimulationMode('random')}
                className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${simulationMode === 'random' ? 'bg-netflix-red text-white' : 'text-gray-400 hover:text-white'}`}
              >
                RANDÔMICO
              </button>
              <button
                onClick={() => setSimulationMode('manual')}
                className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${simulationMode === 'manual' ? 'bg-netflix-red text-white' : 'text-gray-400 hover:text-white'}`}
              >
                MANUAL
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {simulationMode === 'random'
                ? "Valores variam automaticamente."
                : "Controle total pelos sliders."}
            </p>
          </div>

          <div className="mb-6 p-4 bg-black/40 rounded border border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateAll}
                onChange={(e) => {
                  if (simulationActive) stopSimulation();
                  setSimulateAll(e.target.checked);
                }}
                className="w-5 h-5 accent-netflix-red rounded"
              />
              <span className="font-bold text-white">Simular TODAS</span>
            </label>
          </div>

          <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">Máquina Individual</h3>
          <div className={`space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar ${simulateAll ? 'opacity-50 pointer-events-none' : ''}`}>
            {machines.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  if (simulationActive) stopSimulation();
                  setSelectedMachineId(m.id);
                }}
                className={`w-full text-left px-4 py-3 rounded transition-colors ${selectedMachineId === m.id ? 'bg-netflix-red text-white' : 'bg-black/40 text-gray-400 hover:bg-black/60'}`}
              >
                <div className="font-bold text-sm">{m.name}</div>
                <div className="text-xs opacity-70">{m.type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="md:col-span-2 bg-netflix-gray p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {selectedMachine ? selectedMachine.name : 'Selecione uma máquina'}
            </h2>
            {selectedMachine && (
              <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                {selectedMachine.type}
              </span>
            )}
          </div>

          {selectedMachine ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {Object.keys(currentSensorValues).map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-400 mb-2 capitalize">
                    {key} ({typeof currentSensorValues[key] === 'number' ? currentSensorValues[key].toFixed(1) : currentSensorValues[key]})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={getMaxValue(key)}
                    value={typeof currentSensorValues[key] === 'number' ? currentSensorValues[key] : 0}
                    onChange={(e) => setCurrentSensorValues({
                      ...currentSensorValues,
                      [key]: Number(e.target.value)
                    })}
                    className="w-full accent-netflix-red"
                    disabled={simulationActive && simulationMode === 'random'} // Disable sliders in random mode to avoid confusion? Or let them bias the random? Let's disable for clarity.
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-10">
              Selecione uma máquina para ver seus controles.
            </div>
          )}

          <div className="flex items-center gap-4 border-t border-gray-700 pt-6">
            <Button
              variant={simulationActive ? "danger" : "primary"}
              onClick={handleToggle}
              className="w-full py-4 text-lg"
              disabled={!selectedMachine}
            >
              {simulationActive ? "PARAR TRANSMISSÃO" : "INICIAR TRANSMISSÃO"}
            </Button>

            <div className={`w-4 h-4 rounded-full ${simulationActive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
            <span className="text-sm font-mono text-gray-400">
              {simulationActive ? (simulateAll ? "TRANSMITINDO (TODAS)" : "TRANSMITINDO") : "AGUARDANDO"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
