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
  Inventory as InventoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import ProdutoForm from '../components/produtos/ProdutoForm';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [currentProduto, setCurrentProduto] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/produtos');
      setProdutos(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Não foi possível carregar os produtos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchProdutos();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/produtos/search?termo=${searchTerm}`);
      setProdutos(response.data);
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

  const handleOpenForm = (produto = null) => {
    setCurrentProduto(produto);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentProduto(null);
  };

  const handleOpenDelete = (produto) => {
    setCurrentProduto(produto);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setCurrentProduto(null);
  };

  const handleSaveProduto = async (produtoData) => {
    try {
      if (currentProduto) {
        // Atualizar produto existente
        await axios.put(`/api/produtos/${currentProduto._id}`, produtoData);
        setSnackbar({
          open: true,
          message: 'Produto atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo produto
        await axios.post('/api/produtos', produtoData);
        setSnackbar({
          open: true,
          message: 'Produto cadastrado com sucesso!',
          severity: 'success'
        });
      }
      handleCloseForm();
      fetchProdutos();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar produto. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDeleteProduto = async () => {
    if (!currentProduto) return;
    
    try {
      await axios.delete(`/api/produtos/${currentProduto._id}`);
      setSnackbar({
        open: true,
        message: 'Produto excluído com sucesso!',
        severity: 'success'
      });
      handleCloseDelete();
      fetchProdutos();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir produto. Por favor, tente novamente.',
        severity: 'error'
      });
      handleCloseDelete();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getEstoqueStatusColor = (quantidade, estoque_minimo) => {
    if (quantidade <= 0) return 'error';
    if (quantidade <= estoque_minimo) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Produtos e Peças
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Gerencie o estoque de produtos e peças da Oficina 39
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por nome, código ou categoria"
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
              Novo Produto
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
          <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchProdutos}>
            Tentar novamente
          </Button>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Preço (R$)</TableCell>
                  <TableCell>Estoque</TableCell>
                  <TableCell>Fornecedor</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {produtos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  (rowsPerPage > 0
                    ? produtos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : produtos
                  ).map((produto) => (
                    <TableRow key={produto._id}>
                      <TableCell>{produto.codigo}</TableCell>
                      <TableCell>{produto.nome}</TableCell>
                      <TableCell>{produto.categoria}</TableCell>
                      <TableCell>{produto.preco_venda.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${produto.quantidade_estoque} ${produto.unidade}`} 
                          color={getEstoqueStatusColor(produto.quantidade_estoque, produto.estoque_minimo)}
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>{produto.fornecedor?.nome || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenForm(produto)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDelete(produto)}
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
            count={produtos.length}
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
          {currentProduto ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
        <DialogContent dividers>
          <ProdutoForm 
            produto={currentProduto} 
            onSave={handleSaveProduto} 
            onCancel={handleCloseForm} 
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o produto "{currentProduto?.nome}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancelar</Button>
          <Button onClick={handleDeleteProduto} color="error" variant="contained">
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

export default Produtos;
