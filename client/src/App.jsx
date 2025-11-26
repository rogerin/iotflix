import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Catalog from './pages/Catalog';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/watch/:id" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
