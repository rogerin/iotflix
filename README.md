# IoTFlix Industrial

Uma aplicação que simula um ambiente IoT industrial em tempo real, utilizando a metáfora de uma plataforma de streaming (Netflix).

## 🏗 Estrutura do Projeto

O projeto é dividido em duas partes:
- **server/**: Backend em Node.js com Socket.io para gerenciar as conexões e o estado das máquinas.
- **client/**: Frontend em React + Vite para exibir o catálogo, dashboard e simulador.

## 🚀 Como Rodar o Projeto

Você precisará de dois terminais abertos, um para o servidor e outro para o cliente.

### 1. Iniciar o Servidor (Backend)

No primeiro terminal:

```bash
cd server
npm install
npm run dev
```

O servidor rodará na porta **3000**.

### 2. Iniciar o Cliente (Frontend)

No segundo terminal:

```bash
cd client
npm install
npm run dev
```

O cliente rodará na porta **5173**.

## � Como Rodar com Docker

Para rodar tudo com um único comando, certifique-se de ter o Docker e Docker Compose instalados.

```bash
docker compose up --build
```

Isso subirá:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:3000](http://localhost:3000)

## �📱 Como Usar

### 1. Catálogo (Home)
Acesse: **[http://localhost:5173/](http://localhost:5173/)**
- Aqui você vê todas as máquinas disponíveis.
- O status (Online/Offline) é atualizado em tempo real.

### 2. Simulador (Controle)
Acesse: **[http://localhost:5173/simulator](http://localhost:5173/simulator)**
- Selecione uma máquina na lista à esquerda (ex: "Esteira 01").
- Ajuste os sliders de temperatura e vibração.
- Clique em **"INICIAR TRANSMISSÃO"**.
- A máquina passará a enviar dados em tempo real para o servidor.

### 3. Dashboard (Player)
- Volte ao Catálogo e clique na máquina que você ativou.
- Você verá os gráficos e valores atualizando em tempo real, como se estivesse assistindo a um "filme" dos dados da máquina.

### 4. Arquiteturas de Fluxo
Acesse: **[http://localhost:5173/flows](http://localhost:5173/flows)**
- Visualize animações interativas de 3 tipos de arquiteturas IoT:
  1. **Padrão (Pull)**: Sensor -> Backend -> Banco. Usuário busca.
  2. **Direto & Paralelo**: Sensor -> Usuário (Tempo Real) + Backend (Armazenamento).
  3. **Backend Push**: Backend processa e empurra para o usuário.

## 🛠 Tecnologias 

- **Frontend**: React, Vite, TailwindCSS, Recharts, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
