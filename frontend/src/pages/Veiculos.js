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
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import VeiculoForm from '../components/veiculos/VeiculoForm';

const Veiculos = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [currentVeiculo, setCurrentVeiculo] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cliente, setCliente] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar se há um cliente específico na query string
    const params = new URLSearchParams(location.search);
    const clienteId = params.get('cliente');
    
    if (clienteId) {
      fetchClienteInfo(clienteId);
      fetchVeiculosByCliente(clienteId);
    } else {
      fetchVeiculos();
    }
  }, [location.search]);

  const fetchClienteInfo = async (clienteId) => {
    try {
      const response = await axios.get(`/api/clientes/${clienteId}`);
      setCliente(response.data);
    } catch (err) {
      console.error('Erro ao buscar informações do cliente:', err);
      setError('Não foi possível carregar as informações do cliente.');
    }
  };

  const fetchVeiculos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/veiculos');
      setVeiculos(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
      setError('Não foi possível carregar os veículos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVeiculosByCliente = async (clienteId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/veiculos/cliente/${clienteId}`);
      setVeiculos(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar veículos do cliente:', err);
      setError('Não foi possível carregar os veículos deste cliente. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      cliente ? fetchVeiculosByCliente(cliente._id) : fetchVeiculos();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/veiculos/search?placa=${searchTerm}`);
      setVeiculos(Array.isArray(response.data) ? response.data : [response.data]);
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

  const handleOpenForm = (veiculo = null) => {
    setCurrentVeiculo(veiculo);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentVeiculo(null);
  };

  const handleOpenDelete = (veiculo) => {
    setCurrentVeiculo(veiculo);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setCurrentVeiculo(null);
  };

  const handleSaveVeiculo = async (veiculoData) => {
    try {
      // Se estamos em modo de cliente específico, adicionar o cliente_id
      if (cliente) {
        veiculoData.cliente_id = cliente._id;
      }
      
      if (currentVeiculo) {
        // Atualizar veículo existente
        await axios.put(`/api/veiculos/${currentVeiculo._id}`, veiculoData);
        setSnackbar({
          open: true,
          message: 'Veículo atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo veículo
        await axios.post('/api/veiculos', veiculoData);
        setSnackbar({
          open: true,
          message: 'Veículo cadastrado com sucesso!',
          severity: 'success'
        });
      }
      handleCloseForm();
      cliente ? fetchVeiculosByCliente(cliente._id) : fetchVeiculos();
    } catch (err) {
      console.error('Erro ao salvar veículo:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar veículo. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDeleteVeiculo = async () => {
    if (!currentVeiculo) return;
    
    try {
      await axios.delete(`/api/veiculos/${currentVeiculo._id}`);
      setSnackbar({
        open: true,
        message: 'Veículo excluído com sucesso!',
        severity: 'success'
      });
      handleCloseDelete();
      cliente ? fetchVeiculosByCliente(cliente._id) : fetchVeiculos();
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir veículo. Por favor, tente novamente.',
        severity: 'error'
      });
      handleCloseDelete();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCreateOS = (veiculoId) => {
    navigate(`/ordens-servico/nova?veiculo=${veiculoId}`);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {cliente ? `Veículos de ${cliente.nome}` : 'Veículos'}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {cliente 
            ? `Gerencie os veículos do cliente ${cliente.nome}`
            : 'Gerencie os veículos cadastrados na Oficina 39'
          }
        </Typography>
        
        {cliente && (
          <Button 
            variant="outlined" 
            onClick={() => navigate('/clientes')}
            sx={{ mt: 2 }}
          >
            Voltar para Clientes
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por placa"
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
              Novo Veículo
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={() => cliente ? fetchVeiculosByCliente(cliente._id) : fetchVeiculos()}
          >
            Tentar novamente
          </Button>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Placa</TableCell>
                  <TableCell>Marca/Modelo</TableCell>
                  <TableCell>Ano</TableCell>
                  <TableCell>Cor</TableCell>
                  <TableCell>Quilometragem</TableCell>
                  {!cliente && <TableCell>Cliente</TableCell>}
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {veiculos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={cliente ? 6 : 7} align="center">
                      Nenhum veículo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  (rowsPerPage > 0
                    ? veiculos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : veiculos
                  ).map((veiculo) => (
                    <TableRow key={veiculo._id}>
                      <TableCell>
                        <Chip 
                          label={veiculo.placa} 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>{`${veiculo.marca} ${veiculo.modelo}`}</TableCell>
                      <TableCell>{veiculo.ano_fabricacao}</TableCell>
                      <TableCell>{veiculo.cor}</TableCell>
                      <TableCell>{veiculo.quilometragem} km</TableCell>
                      {!cliente && (
                        <TableCell>
                          {veiculo.cliente_id?.nome || 'N/A'}
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenForm(veiculo)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleCreateOS(veiculo._id)}
                          title="Nova Ordem de Serviço"
                        >
                          <BuildIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDelete(veiculo)}
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
            count={veiculos.length}
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
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentVeiculo ? 'Editar Veículo' : 'Novo Veículo'}
        </DialogTitle>
        <DialogContent dividers>
          <VeiculoForm 
            veiculo={currentVeiculo} 
            cliente={cliente}
            onSave={handleSaveVeiculo} 
            onCancel={handleCloseForm} 
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o veículo de placa "{currentVeiculo?.placa}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancelar</Button>
          <Button onClick={handleDeleteVeiculo} color="error" variant="contained">
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

export default Veiculos;
