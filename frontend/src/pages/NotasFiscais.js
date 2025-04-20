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
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import NotaFiscalForm from '../components/notas-fiscais/NotaFiscalForm';
import NotaFiscalPreview from '../components/notas-fiscais/NotaFiscalPreview';

const NotasFiscais = () => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [currentNota, setCurrentNota] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar se há uma ordem de serviço específica na query string
    const params = new URLSearchParams(location.search);
    const ordemId = params.get('ordem');
    
    if (ordemId && location.pathname.includes('/nova')) {
      handleNovaNotaComOrdem(ordemId);
    } else {
      fetchNotas();
    }
  }, [location]);

  const handleNovaNotaComOrdem = async (ordemId) => {
    try {
      const response = await axios.get(`/api/ordens-servico/${ordemId}`);
      const ordem = response.data;
      
      if (ordem.status !== 'Concluída') {
        setSnackbar({
          open: true,
          message: 'Apenas ordens de serviço concluídas podem gerar notas fiscais.',
          severity: 'warning'
        });
        navigate('/notas-fiscais');
        return;
      }
      
      setCurrentNota({
        ordem_servico_id: ordem._id,
        cliente_id: ordem.cliente_id._id || ordem.cliente_id,
        cliente: ordem.cliente_id,
        data_emissao: new Date().toISOString().split('T')[0],
        itens: [
          ...ordem.servicos.map(servico => ({
            tipo: 'Serviço',
            descricao: servico.nome,
            quantidade: 1,
            valor_unitario: servico.valor,
            valor_total: servico.valor
          })),
          ...ordem.pecas.map(peca => ({
            tipo: 'Produto',
            descricao: peca.nome,
            quantidade: peca.quantidade,
            valor_unitario: peca.valor_unitario,
            valor_total: peca.valor_total
          }))
        ],
        valor_total: ordem.valor_total,
        valor_servicos: ordem.valor_servicos,
        valor_produtos: ordem.valor_pecas,
        desconto: ordem.desconto,
        forma_pagamento: 'Dinheiro',
        observacoes: `Referente à Ordem de Serviço #${ordem.numero}`
      });
      
      setOpenForm(true);
    } catch (err) {
      console.error('Erro ao buscar informações da ordem de serviço:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar informações da ordem de serviço. Por favor, tente novamente.',
        severity: 'error'
      });
      navigate('/notas-fiscais');
    }
  };

  const fetchNotas = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/notas-fiscais');
      setNotas(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar notas fiscais:', err);
      setError('Não foi possível carregar as notas fiscais. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchNotas();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/notas-fiscais/search?termo=${searchTerm}`);
      setNotas(response.data);
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

  const handleOpenForm = (nota = null) => {
    setCurrentNota(nota);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentNota(null);
    
    // Se estávamos em modo de criação com ordem, voltar para a lista
    if (location.pathname.includes('/nova')) {
      navigate('/notas-fiscais');
    }
  };

  const handleOpenPreview = (nota) => {
    setCurrentNota(nota);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
  };

  const handleOpenDelete = (nota) => {
    setCurrentNota(nota);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setCurrentNota(null);
  };

  const handleSaveNota = async (notaData) => {
    try {
      if (currentNota && currentNota._id) {
        // Atualizar nota existente
        await axios.put(`/api/notas-fiscais/${currentNota._id}`, notaData);
        setSnackbar({
          open: true,
          message: 'Nota fiscal atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar nova nota
        const response = await axios.post('/api/notas-fiscais', notaData);
        setSnackbar({
          open: true,
          message: 'Nota fiscal gerada com sucesso!',
          severity: 'success'
        });
        
        // Abrir preview da nota recém-criada
        setCurrentNota(response.data);
        setOpenForm(false);
        setOpenPreview(true);
        return;
      }
      handleCloseForm();
      fetchNotas();
    } catch (err) {
      console.error('Erro ao salvar nota fiscal:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar nota fiscal. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDeleteNota = async () => {
    if (!currentNota) return;
    
    try {
      await axios.delete(`/api/notas-fiscais/${currentNota._id}`);
      setSnackbar({
        open: true,
        message: 'Nota fiscal excluída com sucesso!',
        severity: 'success'
      });
      handleCloseDelete();
      fetchNotas();
    } catch (err) {
      console.error('Erro ao excluir nota fiscal:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir nota fiscal. Por favor, tente novamente.',
        severity: 'error'
      });
      handleCloseDelete();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownloadPDF = async (nota) => {
    try {
      const response = await axios.get(`/api/notas-fiscais/${nota._id}/pdf`, {
        responseType: 'blob'
      });
      
      // Criar URL para o blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Criar link e clicar nele para iniciar o download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nota_fiscal_${nota.numero}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Download da nota fiscal iniciado!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Erro ao baixar PDF da nota fiscal:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao baixar PDF da nota fiscal. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Notas Fiscais
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Gerencie as notas fiscais da Oficina 39
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por número, cliente ou data"
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
              Nova Nota Fiscal
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
          <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchNotas}>
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
                  <TableCell>Data Emissão</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Ordem de Serviço</TableCell>
                  <TableCell align="right">Valor Total (R$)</TableCell>
                  <TableCell>Forma Pagamento</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nenhuma nota fiscal encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  (rowsPerPage > 0
                    ? notas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : notas
                  ).map((nota) => (
                    <TableRow key={nota._id}>
                      <TableCell>{nota.numero}</TableCell>
                      <TableCell>{new Date(nota.data_emissao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{nota.cliente?.nome || 'N/A'}</TableCell>
                      <TableCell>
                        {nota.ordem_servico_id ? `#${nota.ordem_servico_id.numero || ''}` : 'N/A'}
                      </TableCell>
                      <TableCell align="right">{nota.valor_total.toFixed(2)}</TableCell>
                      <TableCell>{nota.forma_pagamento}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenPreview(nota)}
                          title="Visualizar"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleDownloadPDF(nota)}
                          title="Download PDF"
                        >
                          <DownloadIcon />
                        </IconButton>
                        
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenForm(nota)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDelete(nota)}
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
            count={notas.length}
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
          {currentNota && currentNota._id ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
        </DialogTitle>
        <DialogContent dividers>
          <NotaFiscalForm 
            nota={currentNota} 
            onSave={handleSaveNota} 
            onCancel={handleCloseForm} 
          />
        </DialogContent>
      </Dialog>

      {/* Modal de visualização */}
      <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>
          Visualização da Nota Fiscal
        </DialogTitle>
        <DialogContent dividers>
          <NotaFiscalPreview nota={currentNota} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Fechar</Button>
          {currentNota && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleDownloadPDF(currentNota)}
              startIcon={<DownloadIcon />}
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a nota fiscal #{currentNota?.numero}? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancelar</Button>
          <Button onClick={handleDeleteNota} color="error" variant="contained">
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

export default NotasFiscais;
