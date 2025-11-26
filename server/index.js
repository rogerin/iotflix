const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())

app.get('/', (req, res) => {
  res.json({ status: 'ok' })
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity in this demo
    methods: ['GET', 'POST']
  }
})

// In-memory store for machine states
// We'll initialize with some default machines
let machines = [
  {
    id: 'machine-1',
    name: 'Esteira 01',
    type: 'Esteira Inteligente',
    status: 'offline',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000',
    sensors: {
      temperature: 0,
      vibration: 0,
      speed: 0
    },
    actuators: {
      motor: false,
      emergencyStop: false
    }
  },
  {
    id: 'machine-2',
    name: 'Prensa Hidráulica A',
    type: 'Prensa',
    status: 'offline',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1000',
    sensors: {
      pressure: 0,
      temperature: 0,
      cycles: 0
    },
    actuators: {
      pump: false,
      valve: false
    }
  },
  {
    id: 'machine-3',
    name: 'Braço Robótico X1',
    type: 'Robô',
    status: 'offline',
    image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=1000',
    sensors: {
      axisX: 0,
      axisY: 0,
      axisZ: 0,
      load: 0
    },
    actuators: {
      gripper: false,
      power: false
    }
  },
  {
    id: 'machine-4',
    name: 'Sensor de Qualidade',
    type: 'Sensor',
    status: 'offline',
    image: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&q=80&w=1000',
    sensors: {
      accuracy: 0,
      scans: 0
    },
    actuators: {
      laser: false
    }
  },
  {
    id: 'machine-5',
    name: 'Compressor Industrial',
    type: 'Compressor',
    status: 'offline',
    image: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=1000',
    sensors: {
      pressure: 0,
      temperature: 0,
      airflow: 0
    },
    actuators: {
      motor: false
    }
  },
  {
    id: 'machine-6',
    name: 'Tanque de Mistura',
    type: 'Tanque',
    status: 'offline',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000',
    sensors: {
      level: 0,
      temperature: 0,
      ph: 0
    },
    actuators: {
      mixer: false,
      valve: false
    }
  },
  {
    id: 'machine-7',
    name: 'Gerador Diesel',
    type: 'Gerador',
    status: 'offline',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000',
    sensors: {
      voltage: 0,
      frequency: 0,
      fuel: 0
    },
    actuators: {
      starter: false
    }
  },
  {
    id: 'machine-8',
    name: 'Empilhadeira Autônoma',
    type: 'Veículo',
    status: 'offline',
    image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=1000',
    sensors: {
      battery: 0,
      speed: 0,
      load: 0
    },
    actuators: {
      motor: false,
      lift: false
    }
  }
]

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Send initial list of machines to the client
  socket.emit('machines:list', machines)

  socket.on('request:machines', () => {
    socket.emit('machines:list', machines)
  })

  // Handle simulator updates
  socket.on('simulator:update', (data) => {
    // data format: { machineId, sensors: {...}, actuators: {...}, status }
    const machineIndex = machines.findIndex(m => m.id === data.machineId)
    if (machineIndex !== -1) {
      // Update local state
      machines[machineIndex] = {
        ...machines[machineIndex],
        ...data,
        lastUpdate: Date.now()
      }

      // Broadcast update to all clients watching this machine (or the catalog)
      io.emit('machine:update', machines[machineIndex])
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
