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
  Autocomplete
} from '@mui/material';
import axios from 'axios';

const ProdutoForm = ({ produto, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    categoria: '',
    unidade: 'UN',
    preco_custo: '',
    preco_venda: '',
    quantidade_estoque: '',
    estoque_minimo: '',
    localizacao: '',
    fornecedor_id: '',
    observacoes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [fornecedores, setFornecedores] = useState([]);
  const [loadingFornecedores, setLoadingFornecedores] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState(null);

  useEffect(() => {
    if (produto) {
      setFormData({
        codigo: produto.codigo || '',
        nome: produto.nome || '',
        descricao: produto.descricao || '',
        categoria: produto.categoria || '',
        unidade: produto.unidade || 'UN',
        preco_custo: produto.preco_custo || '',
        preco_venda: produto.preco_venda || '',
        quantidade_estoque: produto.quantidade_estoque || '',
        estoque_minimo: produto.estoque_minimo || '',
        localizacao: produto.localizacao || '',
        fornecedor_id: produto.fornecedor?._id || produto.fornecedor_id || '',
        observacoes: produto.observacoes || ''
      });
      
      if (produto.fornecedor && typeof produto.fornecedor === 'object') {
        setSelectedFornecedor(produto.fornecedor);
      }
    }
    
    fetchFornecedores();
  }, [produto]);

  const fetchFornecedores = async () => {
    setLoadingFornecedores(true);
    try {
      const response = await axios.get('/api/fornecedores');
      setFornecedores(response.data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    } finally {
      setLoadingFornecedores(false);
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

  const handleFornecedorChange = (event, newValue) => {
    setSelectedFornecedor(newValue);
    setFormData({
      ...formData,
      fornecedor_id: newValue ? newValue._id : ''
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    }
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.categoria.trim()) {
      newErrors.categoria = 'Categoria é obrigatória';
    }
    
    if (!formData.preco_venda) {
      newErrors.preco_venda = 'Preço de venda é obrigatório';
    } else if (isNaN(formData.preco_venda) || formData.preco_venda < 0) {
      newErrors.preco_venda = 'Preço de venda inválido';
    }
    
    if (!formData.quantidade_estoque && formData.quantidade_estoque !== 0) {
      newErrors.quantidade_estoque = 'Quantidade em estoque é obrigatória';
    } else if (isNaN(formData.quantidade_estoque) || formData.quantidade_estoque < 0) {
      newErrors.quantidade_estoque = 'Quantidade em estoque inválida';
    }
    
    if (!formData.estoque_minimo && formData.estoque_minimo !== 0) {
      newErrors.estoque_minimo = 'Estoque mínimo é obrigatório';
    } else if (isNaN(formData.estoque_minimo) || formData.estoque_minimo < 0) {
      newErrors.estoque_minimo = 'Estoque mínimo inválido';
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
            Dados do Produto
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            required
            fullWidth
            label="Código"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            error={!!errors.codigo}
            helperText={errors.codigo}
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <TextField
            required
            fullWidth
            label="Nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            error={!!errors.nome}
            helperText={errors.nome}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descrição"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            error={!!errors.categoria}
            helperText={errors.categoria}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Unidade</InputLabel>
            <Select
              name="unidade"
              value={formData.unidade}
              onChange={handleChange}
              label="Unidade"
            >
              <MenuItem value="UN">Unidade (UN)</MenuItem>
              <MenuItem value="PC">Peça (PC)</MenuItem>
              <MenuItem value="KG">Quilograma (KG)</MenuItem>
              <MenuItem value="L">Litro (L)</MenuItem>
              <MenuItem value="M">Metro (M)</MenuItem>
              <MenuItem value="CX">Caixa (CX)</MenuItem>
              <MenuItem value="PAR">Par (PAR)</MenuItem>
              <MenuItem value="KIT">Kit (KIT)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Preços e Estoque
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Preço de Custo (R$)"
            name="preco_custo"
            type="number"
            value={formData.preco_custo}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            required
            fullWidth
            label="Preço de Venda (R$)"
            name="preco_venda"
            type="number"
            value={formData.preco_venda}
            onChange={handleChange}
            error={!!errors.preco_venda}
            helperText={errors.preco_venda}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            required
            fullWidth
            label="Quantidade em Estoque"
            name="quantidade_estoque"
            type="number"
            value={formData.quantidade_estoque}
            onChange={handleChange}
            error={!!errors.quantidade_estoque}
            helperText={errors.quantidade_estoque}
            InputProps={{ inputProps: { min: 0, step: 1 } }}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            required
            fullWidth
            label="Estoque Mínimo"
            name="estoque_minimo"
            type="number"
            value={formData.estoque_minimo}
            onChange={handleChange}
            error={!!errors.estoque_minimo}
            helperText={errors.estoque_minimo}
            InputProps={{ inputProps: { min: 0, step: 1 } }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Localização no Estoque"
            name="localizacao"
            value={formData.localizacao}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={fornecedores}
            loading={loadingFornecedores}
            getOptionLabel={(option) => option.nome || ''}
            value={selectedFornecedor}
            onChange={handleFornecedorChange}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Fornecedor"
              />
            )}
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

export default ProdutoForm;
