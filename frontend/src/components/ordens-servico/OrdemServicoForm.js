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
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddCircleOutlineIcon
} from '@mui/icons-material';
import axios from 'axios';

const OrdemServicoForm = ({ ordem, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    numero: '',
    data_entrada: new Date().toISOString().split('T')[0],
    data_previsao: '',
    data_conclusao: '',
    cliente_id: '',
    veiculo_id: '',
    status: 'Aberta',
    descricao_problema: '',
    diagnostico: '',
    servicos: [],
    pecas: [],
    valor_servicos: 0,
    valor_pecas: 0,
    desconto: 0,
    valor_total: 0,
    observacoes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedVeiculo, setSelectedVeiculo] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState({
    clientes: false,
    veiculos: false,
    produtos: false,
    servicos: false
  });

  useEffect(() => {
    fetchClientes();
    fetchProdutos();
    fetchServicos();
    
    if (ordem) {
      const ordemData = {
        ...ordem,
        data_entrada: ordem.data_entrada ? new Date(ordem.data_entrada).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        data_previsao: ordem.data_previsao ? new Date(ordem.data_previsao).toISOString().split('T')[0] : '',
        data_conclusao: ordem.data_conclusao ? new Date(ordem.data_conclusao).toISOString().split('T')[0] : '',
        cliente_id: ordem.cliente_id?._id || ordem.cliente_id || '',
        veiculo_id: ordem.veiculo_id?._id || ordem.veiculo_id || '',
        servicos: ordem.servicos || [],
        pecas: ordem.pecas || [],
        valor_servicos: ordem.valor_servicos || 0,
        valor_pecas: ordem.valor_pecas || 0,
        desconto: ordem.desconto || 0,
        valor_total: ordem.valor_total || 0
      };
      
      setFormData(ordemData);
      
      if (ordem.cliente_id) {
        if (typeof ordem.cliente_id === 'object') {
          setSelectedCliente(ordem.cliente_id);
        } else {
          fetchClienteById(ordem.cliente_id);
        }
      }
      
      if (ordem.veiculo_id) {
        if (typeof ordem.veiculo_id === 'object') {
          setSelectedVeiculo(ordem.veiculo_id);
        } else {
          fetchVeiculoById(ordem.veiculo_id);
        }
      }
    }
  }, [ordem]);

  useEffect(() => {
    if (selectedCliente) {
      fetchVeiculosByCliente(selectedCliente._id);
    } else {
      setVeiculos([]);
      setSelectedVeiculo(null);
      setFormData(prev => ({
        ...prev,
        veiculo_id: ''
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

  const fetchVeiculosByCliente = async (clienteId) => {
    setLoading(prev => ({ ...prev, veiculos: true }));
    try {
      const response = await axios.get(`/api/veiculos/cliente/${clienteId}`);
      setVeiculos(response.data);
    } catch (error) {
      console.error('Erro ao buscar veículos do cliente:', error);
    } finally {
      setLoading(prev => ({ ...prev, veiculos: false }));
    }
  };

  const fetchVeiculoById = async (veiculoId) => {
    try {
      const response = await axios.get(`/api/veiculos/${veiculoId}`);
      setSelectedVeiculo(response.data);
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
    }
  };

  const fetchProdutos = async () => {
    setLoading(prev => ({ ...prev, produtos: true }));
    try {
      const response = await axios.get('/api/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(prev => ({ ...prev, produtos: false }));
    }
  };

  const fetchServicos = async () => {
    setLoading(prev => ({ ...prev, servicos: true }));
    try {
      const response = await axios.get('/api/servicos');
      setServicos(response.data);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setLoading(prev => ({ ...prev, servicos: false }));
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

  const handleVeiculoChange = (event, newValue) => {
    setSelectedVeiculo(newValue);
    setFormData({
      ...formData,
      veiculo_id: newValue ? newValue._id : ''
    });
    
    if (errors.veiculo_id) {
      setErrors({
        ...errors,
        veiculo_id: null
      });
    }
  };

  const handleAddServico = (servico) => {
    const novoServico = {
      servico_id: servico._id,
      nome: servico.nome,
      descricao: servico.descricao,
      valor: servico.valor,
      tempo_estimado: servico.tempo_estimado
    };
    
    const novosServicos = [...formData.servicos, novoServico];
    
    const valorServicos = novosServicos.reduce((total, item) => total + item.valor, 0);
    const valorTotal = valorServicos + formData.valor_pecas - formData.desconto;
    
    setFormData({
      ...formData,
      servicos: novosServicos,
      valor_servicos: valorServicos,
      valor_total: valorTotal
    });
  };

  const handleRemoveServico = (index) => {
    const novosServicos = [...formData.servicos];
    novosServicos.splice(index, 1);
    
    const valorServicos = novosServicos.reduce((total, item) => total + item.valor, 0);
    const valorTotal = valorServicos + formData.valor_pecas - formData.desconto;
    
    setFormData({
      ...formData,
      servicos: novosServicos,
      valor_servicos: valorServicos,
      valor_total: valorTotal
    });
  };

  const handleAddPeca = (produto) => {
    // Verificar se o produto já está na lista
    const pecaExistente = formData.pecas.findIndex(p => p.produto_id === produto._id);
    
    let novasPecas;
    
    if (pecaExistente >= 0) {
      // Atualizar quantidade se já existir
      novasPecas = [...formData.pecas];
      novasPecas[pecaExistente].quantidade += 1;
      novasPecas[pecaExistente].valor_total = novasPecas[pecaExistente].quantidade * novasPecas[pecaExistente].valor_unitario;
    } else {
      // Adicionar nova peça
      const novaPeca = {
        produto_id: produto._id,
        codigo: produto.codigo,
        nome: produto.nome,
        quantidade: 1,
        valor_unitario: produto.preco_venda,
        valor_total: produto.preco_venda
      };
      
      novasPecas = [...formData.pecas, novaPeca];
    }
    
    const valorPecas = novasPecas.reduce((total, item) => total + item.valor_total, 0);
    const valorTotal = formData.valor_servicos + valorPecas - formData.desconto;
    
    setFormData({
      ...formData,
      pecas: novasPecas,
      valor_pecas: valorPecas,
      valor_total: valorTotal
    });
  };

  const handleChangePecaQuantidade = (index, quantidade) => {
    if (quantidade < 1) return;
    
    const novasPecas = [...formData.pecas];
    novasPecas[index].quantidade = quantidade;
    novasPecas[index].valor_total = quantidade * novasPecas[index].valor_unitario;
    
    const valorPecas = novasPecas.reduce((total, item) => total + item.valor_total, 0);
    const valorTotal = formData.valor_servicos + valorPecas - formData.desconto;
    
    setFormData({
      ...formData,
      pecas: novasPecas,
      valor_pecas: valorPecas,
      valor_total: valorTotal
    });
  };

  const handleRemovePeca = (index) => {
    const novasPecas = [...formData.pecas];
    novasPecas.splice(index, 1);
    
    const valorPecas = novasPecas.reduce((total, item) => total + item.valor_total, 0);
    const valorTotal = formData.valor_servicos + valorPecas - formData.desconto;
    
    setFormData({
      ...formData,
      pecas: novasPecas,
      valor_pecas: valorPecas,
      valor_total: valorTotal
    });
  };

  const handleChangeDesconto = (e) => {
    const desconto = parseFloat(e.target.value) || 0;
    const valorTotal = formData.valor_servicos + formData.valor_pecas - desconto;
    
    setFormData({
      ...formData,
      desconto,
      valor_total: valorTotal
    });
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Cliente é obrigatório';
    }
    
    if (!formData.veiculo_id) {
      newErrors.veiculo_id = 'Veículo é obrigatório';
    }
    
    if (!formData.data_entrada) {
      newErrors.data_entrada = 'Data de entrada é obrigatória';
    }
    
    if (formData.servicos.length === 0 && formData.pecas.length === 0) {
      newErrors.geral = 'Adicione pelo menos um serviço ou peça';
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
            label="Número da OS"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            disabled={!!ordem?._id}
            helperText={ordem?._id ? "Gerado automaticamente" : "Deixe em branco para gerar automaticamente"}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            required
            fullWidth
            label="Data de Entrada"
            name="data_entrada"
            type="date"
            value={formData.data_entrada}
            onChange={handleChange}
            error={!!errors.data_entrada}
            helperText={errors.data_entrada}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Previsão de Conclusão"
            name="data_previsao"
            type="date"
            value={formData.data_previsao}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
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
            options={veiculos}
            loading={loading.veiculos}
            getOptionLabel={(option) => `${option.marca} ${option.modelo} (${option.placa})` || ''}
            value={selectedVeiculo}
            onChange={handleVeiculoChange}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            disabled={!selectedCliente}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                fullWidth
                label="Veículo"
                error={!!errors.veiculo_id}
                helperText={errors.veiculo_id || (!selectedCliente ? 'Selecione um cliente primeiro' : '')}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="Aberta">Aberta</MenuItem>
              <MenuItem value="Em Andamento">Em Andamento</MenuItem>
              <MenuItem value="Concluída">Concluída</MenuItem>
              <MenuItem value="Cancelada">Cancelada</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {formData.status === 'Concluída' && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data de Conclusão"
              name="data_conclusao"
              type="date"
              value={formData.data_conclusao}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descrição do Problema"
            name="descricao_problema"
            value={formData.descricao_problema}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Diagnóstico"
            name="diagnostico"
            value={formData.diagnostico}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleChangeTab}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Serviços" />
              <Tab label="Peças" />
            </Tabs>
            
            {tabValue === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Serviços
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={servicos}
                      loading={loading.servicos}
                      getOptionLabel={(option) => `${option.nome} - R$ ${option.valor.toFixed(2)}` || ''}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          handleAddServico(newValue);
                        }
                      }}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          label="Adicionar Serviço"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {params.InputProps.endAdornment}
                                <IconButton color="primary" edge="end">
                                  <AddCircleOutlineIcon />
                                </IconButton>
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Serviço</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell align="right">Valor (R$)</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.servicos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Nenhum serviço adicionado
                          </TableCell>
                        </TableRow>
                      ) : (
                        formData.servicos.map((servico, index) => (
                          <TableRow key={index}>
                            <TableCell>{servico.nome}</TableCell>
                            <TableCell>{servico.descricao}</TableCell>
                            <TableCell align="right">{servico.valor.toFixed(2)}</TableCell>
                            <TableCell align="center">
                              <IconButton 
                                color="error" 
                                onClick={() => handleRemoveServico(index)}
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
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Peças e Produtos
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={produtos}
                      loading={loading.produtos}
                      getOptionLabel={(option) => `${option.codigo} - ${option.nome} - R$ ${option.preco_venda.toFixed(2)}` || ''}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          handleAddPeca(newValue);
                        }
                      }}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          label="Adicionar Peça/Produto"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {params.InputProps.endAdornment}
                                <IconButton color="primary" edge="end">
                                  <AddCircleOutlineIcon />
                                </IconButton>
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Peça/Produto</TableCell>
                        <TableCell align="right">Valor Unit. (R$)</TableCell>
                        <TableCell align="center">Quantidade</TableCell>
                        <TableCell align="right">Valor Total (R$)</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.pecas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Nenhuma peça adicionada
                          </TableCell>
                        </TableRow>
                      ) : (
                        formData.pecas.map((peca, index) => (
                          <TableRow key={index}>
                            <TableCell>{peca.codigo}</TableCell>
                            <TableCell>{peca.nome}</TableCell>
                            <TableCell align="right">{peca.valor_unitario.toFixed(2)}</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleChangePecaQuantidade(index, peca.quantidade - 1)}
                                  disabled={peca.quantidade <= 1}
                                >
                                  -
                                </IconButton>
                                <Typography sx={{ mx: 1 }}>{peca.quantidade}</Typography>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleChangePecaQuantidade(index, peca.quantidade + 1)}
                                >
                                  +
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align="right">{peca.valor_total.toFixed(2)}</TableCell>
                            <TableCell align="center">
                              <IconButton 
                                color="error" 
                                onClick={() => handleRemovePeca(index)}
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
              </Box>
            )}
          </Paper>
        </Grid>
        
        {(errors.geral) && (
          <Grid item xs={12}>
            <Typography color="error">{errors.geral}</Typography>
          </Grid>
        )}
        
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
            label="Valor Peças (R$)"
            value={formData.valor_pecas.toFixed(2)}
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

export default OrdemServicoForm;
