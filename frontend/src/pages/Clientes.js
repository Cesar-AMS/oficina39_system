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
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ClienteForm from '../components/clientes/ClienteForm';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [currentCliente, setCurrentCliente] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/clientes');
      setClientes(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Não foi possível carregar os clientes. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchClientes();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/clientes/search?termo=${searchTerm}`);
      setClientes(response.data);
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

  const handleOpenForm = (cliente = null) => {
    setCurrentCliente(cliente);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentCliente(null);
  };

  const handleOpenDelete = (cliente) => {
    setCurrentCliente(cliente);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setCurrentCliente(null);
  };

  const handleSaveCliente = async (clienteData) => {
    try {
      if (currentCliente) {
        // Atualizar cliente existente
        await axios.put(`/api/clientes/${currentCliente._id}`, clienteData);
        setSnackbar({
          open: true,
          message: 'Cliente atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo cliente
        await axios.post('/api/clientes', clienteData);
        setSnackbar({
          open: true,
          message: 'Cliente cadastrado com sucesso!',
          severity: 'success'
        });
      }
      handleCloseForm();
      fetchClientes();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar cliente. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDeleteCliente = async () => {
    if (!currentCliente) return;
    
    try {
      await axios.delete(`/api/clientes/${currentCliente._id}`);
      setSnackbar({
        open: true,
        message: 'Cliente excluído com sucesso!',
        severity: 'success'
      });
      handleCloseDelete();
      fetchClientes();
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir cliente. Por favor, tente novamente.',
        severity: 'error'
      });
      handleCloseDelete();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewVeiculos = (clienteId) => {
    navigate(`/veiculos?cliente=${clienteId}`);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Clientes
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Gerencie os clientes da Oficina 39
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por nome, CPF/CNPJ ou telefone"
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
              Novo Cliente
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
          <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchClientes}>
            Tentar novamente
          </Button>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CPF/CNPJ</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  (rowsPerPage > 0
                    ? clientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : clientes
                  ).map((cliente) => (
                    <TableRow key={cliente._id}>
                      <TableCell>{cliente.nome}</TableCell>
                      <TableCell>{cliente.cpf_cnpj}</TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenForm(cliente)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleViewVeiculos(cliente._id)}
                          title="Ver veículos"
                        >
                          <CarIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDelete(cliente)}
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
            count={clientes.length}
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
          {currentCliente ? 'Editar Cliente' : 'Novo Cliente'}
        </DialogTitle>
        <DialogContent dividers>
          <ClienteForm 
            cliente={currentCliente} 
            onSave={handleSaveCliente} 
            onCancel={handleCloseForm} 
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o cliente "{currentCliente?.nome}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancelar</Button>
          <Button onClick={handleDeleteCliente} color="error" variant="contained">
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

export default Clientes;
