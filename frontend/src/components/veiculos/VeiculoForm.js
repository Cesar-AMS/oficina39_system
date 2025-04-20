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

const VeiculoForm = ({ veiculo, cliente, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    ano_fabricacao: '',
    ano_modelo: '',
    cor: '',
    quilometragem: '',
    chassi: '',
    renavam: '',
    combustivel: 'Gasolina',
    cliente_id: cliente ? cliente._id : '',
    observacoes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  useEffect(() => {
    if (veiculo) {
      setFormData({
        placa: veiculo.placa || '',
        marca: veiculo.marca || '',
        modelo: veiculo.modelo || '',
        ano_fabricacao: veiculo.ano_fabricacao || '',
        ano_modelo: veiculo.ano_modelo || '',
        cor: veiculo.cor || '',
        quilometragem: veiculo.quilometragem || '',
        chassi: veiculo.chassi || '',
        renavam: veiculo.renavam || '',
        combustivel: veiculo.combustivel || 'Gasolina',
        cliente_id: veiculo.cliente_id?._id || veiculo.cliente_id || '',
        observacoes: veiculo.observacoes || ''
      });
      
      if (veiculo.cliente_id && typeof veiculo.cliente_id === 'object') {
        setSelectedCliente(veiculo.cliente_id);
      }
    }
    
    // Se não estamos em modo de cliente específico, carregar lista de clientes
    if (!cliente) {
      fetchClientes();
    }
  }, [veiculo, cliente]);

  const fetchClientes = async () => {
    setLoadingClientes(true);
    try {
      const response = await axios.get('/api/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoadingClientes(false);
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.placa.trim()) {
      newErrors.placa = 'Placa é obrigatória';
    }
    
    if (!formData.marca.trim()) {
      newErrors.marca = 'Marca é obrigatória';
    }
    
    if (!formData.modelo.trim()) {
      newErrors.modelo = 'Modelo é obrigatório';
    }
    
    if (!formData.ano_fabricacao) {
      newErrors.ano_fabricacao = 'Ano de fabricação é obrigatório';
    } else if (isNaN(formData.ano_fabricacao) || formData.ano_fabricacao < 1900 || formData.ano_fabricacao > new Date().getFullYear() + 1) {
      newErrors.ano_fabricacao = 'Ano de fabricação inválido';
    }
    
    if (!formData.quilometragem) {
      newErrors.quilometragem = 'Quilometragem é obrigatória';
    } else if (isNaN(formData.quilometragem) || formData.quilometragem < 0) {
      newErrors.quilometragem = 'Quilometragem inválida';
    }
    
    if (!cliente && !formData.cliente_id) {
      newErrors.cliente_id = 'Cliente é obrigatório';
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
            Dados do Veículo
          </Typography>
        </Grid>
        
        {!cliente && (
          <Grid item xs={12}>
            <Autocomplete
              options={clientes}
              loading={loadingClientes}
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
        )}
        
        <Grid item xs={12} md={4}>
          <TextField
            required
            fullWidth
            label="Placa"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            error={!!errors.placa}
            helperText={errors.placa}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            required
            fullWidth
            label="Marca"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            error={!!errors.marca}
            helperText={errors.marca}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            required
            fullWidth
            label="Modelo"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            error={!!errors.modelo}
            helperText={errors.modelo}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            required
            fullWidth
            label="Ano de Fabricação"
            name="ano_fabricacao"
            type="number"
            value={formData.ano_fabricacao}
            onChange={handleChange}
            error={!!errors.ano_fabricacao}
            helperText={errors.ano_fabricacao}
            InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 1 } }}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Ano do Modelo"
            name="ano_modelo"
            type="number"
            value={formData.ano_modelo}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 2 } }}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Cor"
            name="cor"
            value={formData.cor}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            required
            fullWidth
            label="Quilometragem"
            name="quilometragem"
            type="number"
            value={formData.quilometragem}
            onChange={handleChange}
            error={!!errors.quilometragem}
            helperText={errors.quilometragem}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Chassi"
            name="chassi"
            value={formData.chassi}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Renavam"
            name="renavam"
            value={formData.renavam}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Combustível</InputLabel>
            <Select
              name="combustivel"
              value={formData.combustivel}
              onChange={handleChange}
              label="Combustível"
            >
              <MenuItem value="Gasolina">Gasolina</MenuItem>
              <MenuItem value="Etanol">Etanol</MenuItem>
              <MenuItem value="Flex">Flex</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
              <MenuItem value="GNV">GNV</MenuItem>
              <MenuItem value="Elétrico">Elétrico</MenuItem>
              <MenuItem value="Híbrido">Híbrido</MenuItem>
            </Select>
          </FormControl>
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
            rows={4}
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

export default VeiculoForm;
