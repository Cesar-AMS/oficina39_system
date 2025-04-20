import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid,
  TextField,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import OrdemServicoForm from '../components/ordens-servico/OrdemServicoForm';

const OrdensServico = () => {
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [currentOrdem, setCurrentOrdem] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar se há um veículo específico na query string
    const params = new URLSearchParams(location.search);
    const veiculoId = params.get('veiculo');
    
    if (veiculoId && location.pathname.includes('/nova')) {
      handleNovaOrdemComVeiculo(veiculoId);
    } else {
      fetchOrdens();
    }
  }, [location]);

  const handleNovaOrdemComVeiculo = async (veiculoId) => {
    try {
      const response = await axios.get(`/api/veiculos/${veiculoId}`);
      const veiculo = response.data;
      
      setCurrentOrdem({
        veiculo_id: veiculo._id,
        cliente_id: veiculo.cliente_id,
        veiculo: veiculo,
        cliente: veiculo.cliente_id,
        status: 'Aberta',
        data_entrada: new Date().toISOString().split('T')[0]
      });
      
      setOpenForm(true);
    } catch (err) {
      console.error('Erro ao buscar informações do veículo:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar informações do veículo. Por favor, tente novamente.',
        severity: 'error'
      });
      navigate('/ordens-servico');
    }
  };

  const fetchOrdens = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/ordens-servico');
      setOrdens(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar ordens de serviço:', err);
      setError('Não foi possível carregar as ordens de serviço. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchOrdens();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/ordens-servico/search?termo=${searchTerm}`);
      setOrdens(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro na busca:', err);
      setError('Erro ao realizar a busca. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenForm = (ordem = null) => {
    setCurrentOrdem(ordem);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentOrdem(null);
    
    // Se estávamos em modo de criação com veículo, voltar para a lista
    if (location.pathname.includes('/nova')) {
      navigate('/ordens-servico');
    }
  };

  const handleOpenDelete = (ordem) => {
    setCurrentOrdem(ordem);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setCurrentOrdem(null);
  };

  const handleSaveOrdem = async (ordemData) => {
    try {
      if (currentOrdem && currentOrdem._id) {
        // Atualizar ordem existente
        await axios.put(`/api/ordens-servico/${currentOrdem._id}`, ordemData);
        setSnackbar({
          open: true,
          message: 'Ordem de serviço atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar nova ordem
        await axios.post('/api/ordens-servico', ordemData);
        setSnackbar({
          open: true,
          message: 'Ordem de serviço criada com sucesso!',
          severity: 'success'
        });
      }
      handleCloseForm();
      fetchOrdens();
    } catch (err) {
      console.error('Erro ao salvar ordem de serviço:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar ordem de serviço. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDeleteOrdem = async () => {
    if (!currentOrdem) return;
    
    try {
      await axios.delete(`/api/ordens-servico/${currentOrdem._id}`);
      setSnackbar({
        open: true,
        message: 'Ordem de serviço excluída com sucesso!',
        severity: 'success'
      });
      handleCloseDelete();
      fetchOrdens();
    } catch (err) {
      console.error('Erro ao excluir ordem de serviço:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir ordem de serviço. Por favor, tente novamente.',
        severity: 'error'
      });
      handleCloseDelete();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangeStatus = async (ordem, novoStatus) => {
    try {
      await axios.put(`/api/ordens-servico/${ordem._id}/status`, { status: novoStatus });
      setSnackbar({
        open: true,
        message: `Status da ordem de serviço alterado para ${novoStatus}!`,
        severity: 'success'
      });
      fetchOrdens();
    } catch (err) {
      console.error('Erro ao alterar status da ordem de serviço:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao alterar status da ordem de serviço. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleGerarNotaFiscal = (ordem) => {
    navigate(`/notas-fiscais/nova?ordem=${ordem._id}`);
  };

  const filteredOrdens = ordens.filter(ordem => {
    if (tabValue === 0) return true; // Todas
    if (tabValue === 1) return ordem.status === 'Aberta';
    if (tabValue === 2) return ordem.status === 'Em Andamento';
    if (tabValue === 3) return ordem.status === 'Concluída';
    if (tabValue === 4) return ordem.status === 'Cancelada';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aberta': return 'info';
      case 'Em Andamento': return 'warning';
      case 'Concluída': return 'success';
      case 'Cancelada': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Ordens de Serviço
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Gerencie as ordens de serviço da Oficina 39
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por número, cliente ou veículo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Nova Ordem de Serviço
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Todas" />
          <Tab label="Abertas" />
          <Tab label="Em Andamento" />
          <Tab label="Concluídas" />
          <Tab label="Canceladas" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchOrdens}>
            Tentar novamente
          </Button>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Veículo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Valor Total (R$)</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrdens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nenhuma ordem de serviço encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  (rowsPerPage > 0
                    ? filteredOrdens.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : filteredOrdens
                  ).map((ordem) => (
                    <TableRow key={ordem._id}>
                      <TableCell>{ordem.numero}</TableCell>
                      <TableCell>{new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{ordem.cliente?.nome || 'N/A'}</TableCell>
                      <TableCell>
                        {ordem.veiculo ? `${ordem.veiculo.marca} ${ordem.veiculo.modelo} (${ordem.veiculo.placa})` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={ordem.status} 
                          color={getStatusColor(ordem.status)}
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>{ordem.valor_total?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenForm(ordem)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        
                        {ordem.status === 'Aberta' && (
                          <IconButton 
                            color="warning" 
                            onClick={() => handleChangeStatus(ordem, 'Em Andamento')}
                            title="Iniciar Serviço"
                          >
                            <BuildIcon />
                          </IconButton>
                        )}
                        
                        {ordem.status === 'Em Andamento' && (
                          <IconButton 
                            color="success" 
                            onClick={() => handleChangeStatus(ordem, 'Concluída')}
                            title="Concluir Serviço"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        )}
                        
                        {ordem.status === 'Concluída' && (
                          <IconButton 
                            color="secondary" 
                            onClick={() => handleGerarNotaFiscal(ordem)}
                            title="Gerar Nota Fiscal"
                          >
                            <PrintIcon />
                          </IconButton>
                        )}
                        
                        {(ordem.status === 'Aberta' || ordem.status === 'Em Andamento') && (
                          <IconButton 
                            color="error" 
                            onClick={() => handleChangeStatus(ordem, 'Cancelada')}
                            title="Cancelar Ordem"
                          >
                            <CancelIcon />
                          </IconButton>
                        )}
                        
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDelete(ordem)}
                          title="Excluir"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredOrdens.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Itens por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Paper>
      )}

      {/* Modal de formulário */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="lg" fullWidth>
        <DialogTitle>
          {currentOrdem && currentOrdem._id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        </DialogTitle>
        <DialogContent dividers>
          <OrdemServicoForm 
            ordem={currentOrdem} 
            onSave={handleSaveOrdem} 
            onCancel={handleCloseForm} 
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a ordem de serviço #{currentOrdem?.numero}? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancelar</Button>
          <Button onClick={handleDeleteOrdem} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrdensServico;
