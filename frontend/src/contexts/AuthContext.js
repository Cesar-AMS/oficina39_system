import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Configurar o token no cabeçalho de todas as requisições
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Buscar perfil do usuário
          const response = await axios.get('/api/usuarios/profile');
          setCurrentUser(response.data.usuario);
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Função de login
  const login = async (username, senha) => {
    try {
      const response = await axios.post('/api/usuarios/login', { username, senha });
      const { token, usuario } = response.data;
      
      // Salvar token no localStorage
      localStorage.setItem('token', token);
      
      // Configurar o token no cabeçalho de todas as requisições
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setToken(token);
      setCurrentUser(usuario);
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.'
      };
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setCurrentUser(null);
  };

  // Verificar se o usuário tem determinada permissão
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    
    // Administradores têm todas as permissões
    if (currentUser.perfil === 'Administrador') return true;
    
    // Verificar se a permissão específica existe no array de permissões do usuário
    return currentUser.permissoes && currentUser.permissoes.includes(permission);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    login,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
