import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Layout from './components/Layout';
import Clientes from './pages/Clientes';
import Veiculos from './pages/Veiculos';
import Produtos from './pages/Produtos';
import OrdensServico from './pages/OrdensServico';
import Agendamentos from './pages/Agendamentos';
import Financeiro from './pages/Financeiro';
import NotasFiscais from './pages/NotasFiscais';
import Configuracoes from './pages/Configuracoes';
import Usuarios from './pages/Usuarios';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="clientes/*" element={<Clientes />} />
          <Route path="veiculos/*" element={<Veiculos />} />
          <Route path="produtos/*" element={<Produtos />} />
          <Route path="ordens-servico/*" element={<OrdensServico />} />
          <Route path="agendamentos/*" element={<Agendamentos />} />
          <Route path="financeiro/*" element={<Financeiro />} />
          <Route path="notas-fiscais/*" element={<NotasFiscais />} />
          <Route path="configuracoes/*" element={<Configuracoes />} />
          <Route path="usuarios/*" element={<Usuarios />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
