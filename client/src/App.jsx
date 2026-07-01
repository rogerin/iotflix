import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Catalog from './pages/Catalog';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import FlowsPage from './pages/FlowsPage';
import ScadaLab from './pages/ScadaLab';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/watch/:id" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/flows" element={<FlowsPage />} />
          <Route path="/scada-lab" element={<ScadaLab />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
