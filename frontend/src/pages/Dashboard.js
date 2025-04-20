import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  DirectionsCar, 
  People, 
  Build, 
  Inventory, 
  EventNote, 
  Warning,
  TrendingUp
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/configuracoes/estatisticas');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setError('Não foi possível carregar os dados do dashboard.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Bem-vindo, {currentUser?.username || 'Usuário'}! Aqui está um resumo das atividades da Oficina 39.
        </Typography>
      </Box>

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Clientes Ativos
                  </Typography>
                  <Typography variant="h4">
                    {stats?.registros?.clientes || 0}
                  </Typography>
                </Box>
                <People fontSize="large" color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Veículos Cadastrados
                  </Typography>
                  <Typography variant="h4">
                    {stats?.registros?.veiculos || 0}
                  </Typography>
                </Box>
                <DirectionsCar fontSize="large" color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Ordens de Serviço Abertas
                  </Typography>
                  <Typography variant="h4">
                    {stats?.ordens_servico?.por_status?.Aberta || 0}
                  </Typography>
                </Box>
                <Build fontSize="large" color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Agendamentos Hoje
                  </Typography>
                  <Typography variant="h4">
                    {stats?.agendamentos?.hoje || 0}
                  </Typography>
                </Box>
                <EventNote fontSize="large" color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Seção principal */}
      <Grid container spacing={3}>
        {/* Ordens de serviço por status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ordens de Serviço por Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {Object.entries(stats?.ordens_servico?.por_status || {}).map(([status, count]) => (
                <ListItem key={status} button onClick={() => navigate('/ordens-servico')}>
                  <ListItemIcon>
                    <Build color={status === 'Aberta' ? 'warning' : status === 'Concluída' ? 'success' : 'primary'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${status}: ${count}`} 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Alertas de estoque */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Alertas de Estoque
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {stats?.estoque?.produtos_estoque_baixo > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography>
                  {stats.estoque.produtos_estoque_baixo} produtos com estoque abaixo do mínimo
                </Typography>
              </Box>
            ) : (
              <Typography>Todos os produtos estão com estoque adequado</Typography>
            )}
            <Button 
              variant="outlined" 
              startIcon={<Inventory />}
              onClick={() => navigate('/produtos')}
              sx={{ mt: 2 }}
            >
              Gerenciar Estoque
            </Button>
          </Paper>
        </Grid>

        {/* Faturamento */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumo Financeiro
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Faturamento do Mês
                        </Typography>
                        <Typography variant="h5">
                          R$ {stats?.financeiro?.faturamento_mes_atual?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                      <TrendingUp fontSize="large" color="success" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/financeiro')}
              sx={{ mt: 3 }}
            >
              Ver Relatórios Financeiros
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
