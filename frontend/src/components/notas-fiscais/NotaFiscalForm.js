import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Typography,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddCircleOutlineIcon
} from '@mui/icons-material';
import axios from 'axios';

const NotaFiscalForm = ({ nota, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    numero: '',
    data_emissao: new Date().toISOString().split('T')[0],
    cliente_id: '',
    ordem_servico_id: '',
    itens: [],
    valor_servicos: 0,
    valor_produtos: 0,
    desconto: 0,
    valor_total: 0,
    forma_pagamento: 'Dinheiro',
    observacoes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [clientes, setClientes] = useState([]);
  const [ordensServico, setOrdensServico] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedOrdem, setSelectedOrdem] = useState(null);
  const [loading, setLoading] = useState({
    clientes: false,
    ordens: false
  });

  useEffect(() => {
    fetchClientes();
    
    if (nota) {
      const notaData = {
        ...nota,
        data_emissao: nota.data_emissao ? new Date(nota.data_emissao).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        cliente_id: nota.cliente_id?._id || nota.cliente_id || '',
        ordem_servico_id: nota.ordem_servico_id?._id || nota.ordem_servico_id || '',
        itens: nota.itens || [],
        valor_servicos: nota.valor_servicos || 0,
        valor_produtos: nota.valor_produtos || 0,
        desconto: nota.desconto || 0,
        valor_total: nota.valor_total || 0
      };
      
      setFormData(notaData);
      
      if (nota.cliente_id) {
        if (typeof nota.cliente_id === 'object') {
          setSelectedCliente(nota.cliente_id);
        } else {
          fetchClienteById(nota.cliente_id);
        }
      }
      
      if (nota.ordem_servico_id) {
        if (typeof nota.ordem_servico_id === 'object') {
          setSelectedOrdem(nota.ordem_servico_id);
        } else {
          fetchOrdemById(nota.ordem_servico_id);
        }
      }
    }
  }, [nota]);

  useEffect(() => {
    if (selectedCliente) {
      fetchOrdensByCliente(selectedCliente._id);
    } else {
      setOrdensServico([]);
      setSelectedOrdem(null);
      setFormData(prev => ({
        ...prev,
        ordem_servico_id: ''
      }));
    }
  }, [selectedCliente]);

  const fetchClientes = async () => {
    setLoading(prev => ({ ...prev, clientes: true }));
    try {
      const response = await axios.get('/api/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(prev => ({ ...prev, clientes: false }));
    }
  };

  const fetchClienteById = async (clienteId) => {
    try {
      const response = await axios.get(`/api/clientes/${clienteId}`);
      setSelectedCliente(response.data);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    }
  };

  const fetchOrdensByCliente = async (clienteId) => {
    setLoading(prev => ({ ...prev, ordens: true }));
    try {
      const response = await axios.get(`/api/ordens-servico/cliente/${clienteId}?status=Concluída`);
      setOrdensServico(response.data);
    } catch (error) {
      console.error('Erro ao buscar ordens de serviço do cliente:', error);
    } finally {
      setLoading(prev => ({ ...prev, ordens: false }));
    }
  };

  const fetchOrdemById = async (ordemId) => {
    try {
      const response = await axios.get(`/api/ordens-servico/${ordemId}`);
      setSelectedOrdem(response.data);
    } catch (error) {
      console.error('Erro ao buscar ordem de serviço:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpar erro do campo quando ele for alterado
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleClienteChange = (event, newValue) => {
    setSelectedCliente(newValue);
    setFormData({
      ...formData,
      cliente_id: newValue ? newValue._id : ''
    });
    
    if (errors.cliente_id) {
      setErrors({
        ...errors,
        cliente_id: null
      });
    }
  };

  const handleOrdemChange = (event, newValue) => {
    setSelectedOrdem(newValue);
    
    if (newValue) {
      // Preencher automaticamente os itens da nota com base na ordem de serviço
      const itens = [
        ...newValue.servicos.map(servico => ({
          tipo: 'Serviço',
          descricao: servico.nome,
          quantidade: 1,
          valor_unitario: servico.valor,
          valor_total: servico.valor
        })),
        ...newValue.pecas.map(peca => ({
          tipo: 'Produto',
          descricao: peca.nome,
          quantidade: peca.quantidade,
          valor_unitario: peca.valor_unitario,
          valor_total: peca.valor_total
        }))
      ];
      
      setFormData({
        ...formData,
        ordem_servico_id: newValue._id,
        itens: itens,
        valor_servicos: newValue.valor_servicos,
        valor_produtos: newValue.valor_pecas,
        desconto: newValue.desconto,
        valor_total: newValue.valor_total,
        observacoes: `Referente à Ordem de Serviço #${newValue.numero}`
      });
    } else {
      setFormData({
        ...formData,
        ordem_servico_id: '',
        itens: [],
        valor_servicos: 0,
        valor_produtos: 0,
        desconto: 0,
        valor_total: 0,
        observacoes: ''
      });
    }
    
    if (errors.ordem_servico_id) {
      setErrors({
        ...errors,
        ordem_servico_id: null
      });
    }
  };

  const handleAddItem = () => {
    const novosItens = [...formData.itens, {
      tipo: 'Serviço',
      descricao: '',
      quantidade: 1,
      valor_unitario: 0,
      valor_total: 0
    }];
    
    setFormData({
      ...formData,
      itens: novosItens
    });
  };

  const handleRemoveItem = (index) => {
    const novosItens = [...formData.itens];
    novosItens.splice(index, 1);
    
    // Recalcular valores
    const valorServicos = novosItens
      .filter(item => item.tipo === 'Serviço')
      .reduce((total, item) => total + item.valor_total, 0);
      
    const valorProdutos = novosItens
      .filter(item => item.tipo === 'Produto')
      .reduce((total, item) => total + item.valor_total, 0);
      
    const valorTotal = valorServicos + valorProdutos - formData.desconto;
    
    setFormData({
      ...formData,
      itens: novosItens,
      valor_servicos: valorServicos,
      valor_produtos: valorProdutos,
      valor_total: valorTotal
    });
  };

  const handleItemChange = (index, field, value) => {
    const novosItens = [...formData.itens];
    novosItens[index][field] = value;
    
    // Recalcular valor total do item
    if (field === 'quantidade' || field === 'valor_unitario') {
      novosItens[index].valor_total = novosItens[index].quantidade * novosItens[index].valor_unitario;
    }
    
    // Recalcular valores totais
    const valorServicos = novosItens
      .filter(item => item.tipo === 'Serviço')
      .reduce((total, item) => total + item.valor_total, 0);
      
    const valorProdutos = novosItens
      .filter(item => item.tipo === 'Produto')
      .reduce((total, item) => total + item.valor_total, 0);
      
    const valorTotal = valorServicos + valorProdutos - formData.desconto;
    
    setFormData({
      ...formData,
      itens: novosItens,
      valor_servicos: valorServicos,
      valor_produtos: valorProdutos,
      valor_total: valorTotal
    });
  };

  const handleChangeDesconto = (e) => {
    const desconto = parseFloat(e.target.value) || 0;
    const valorTotal = formData.valor_servicos + formData.valor_produtos - desconto;
    
    setFormData({
      ...formData,
      desconto,
      valor_total: valorTotal
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Cliente é obrigatório';
    }
    
    if (!formData.data_emissao) {
      newErrors.data_emissao = 'Data de emissão é obrigatória';
    }
    
    if (formData.itens.length === 0) {
      newErrors.itens = 'Adicione pelo menos um item à nota fiscal';
    } else {
      // Verificar se todos os itens têm descrição e valores válidos
      const itemInvalido = formData.itens.some(item => 
        !item.descricao.trim() || 
        item.quantidade <= 0 || 
        item.valor_unitario <= 0
      );
      
      if (itemInvalido) {
        newErrors.itens = 'Todos os itens devem ter descrição, quantidade e valor válidos';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Informações Básicas
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Número da Nota"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            disabled={!!nota?._id}
            helperText={nota?._id ? "Gerado automaticamente" : "Deixe em branco para gerar automaticamente"}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            required
            fullWidth
            label="Data de Emissão"
            name="data_emissao"
            type="date"
            value={formData.data_emissao}
            onChange={handleChange}
            error={!!errors.data_emissao}
            helperText={errors.data_emissao}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Forma de Pagamento</InputLabel>
            <Select
              name="forma_pagamento"
              value={formData.forma_pagamento}
              onChange={handleChange}
              label="Forma de Pagamento"
            >
              <MenuItem value="Dinheiro">Dinheiro</MenuItem>
              <MenuItem value="Cartão de Crédito">Cartão de Crédito</MenuItem>
              <MenuItem value="Cartão de Débito">Cartão de Débito</MenuItem>
              <MenuItem value="Pix">Pix</MenuItem>
              <MenuItem value="Transferência Bancária">Transferência Bancária</MenuItem>
              <MenuItem value="Boleto">Boleto</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={clientes}
            loading={loading.clientes}
            getOptionLabel={(option) => option.nome || ''}
            value={selectedCliente}
            onChange={handleClienteChange}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                fullWidth
                label="Cliente"
                error={!!errors.cliente_id}
                helperText={errors.cliente_id}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={ordensServico}
            loading={loading.ordens}
            getOptionLabel={(option) => `OS #${option.numero} - ${new Date(option.data_entrada).toLocaleDateString('pt-BR')}` || ''}
            value={selectedOrdem}
            onChange={handleOrdemChange}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            disabled={!selectedCliente}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Ordem de Serviço (opcional)"
                helperText={!selectedCliente ? 'Selecione um cliente primeiro' : 'Selecionar uma ordem preencherá automaticamente os itens'}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Itens da Nota Fiscal
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
            >
              Adicionar Item
            </Button>
          </Box>
          
          {errors.itens && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.itens}
            </Typography>
          )}
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="center">Quantidade</TableCell>
                  <TableCell align="right">Valor Unit. (R$)</TableCell>
                  <TableCell align="right">Valor Total (R$)</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.itens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhum item adicionado
                    </TableCell>
                  </TableRow>
                ) : (
                  formData.itens.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={item.tipo}
                            onChange={(e) => handleItemChange(index, 'tipo', e.target.value)}
                          >
                            <MenuItem value="Serviço">Serviço</MenuItem>
                            <MenuItem value="Produto">Produto</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={item.descricao}
                          onChange={(e) => handleItemChange(index, 'descricao', e.target.value)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantidade}
                          onChange={(e) => handleItemChange(index, 'quantidade', parseFloat(e.target.value) || 0)}
                          InputProps={{ inputProps: { min: 1, step: 1 } }}
                          sx={{ width: '80px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={item.valor_unitario}
                          onChange={(e) => handleItemChange(index, 'valor_unitario', parseFloat(e.target.value) || 0)}
                          InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                          sx={{ width: '100px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {item.valor_total.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveItem(index)}
                          size="small"
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
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Valores
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Valor Serviços (R$)"
            value={formData.valor_servicos.toFixed(2)}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Valor Produtos (R$)"
            value={formData.valor_produtos.toFixed(2)}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Desconto (R$)"
            name="desconto"
            type="number"
            value={formData.desconto}
            onChange={handleChangeDesconto}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Valor Total (R$)"
            value={formData.valor_total.toFixed(2)}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Informações Adicionais
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Observações"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </Grid>
        
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="contained" type="submit">
            Salvar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NotaFiscalForm;
