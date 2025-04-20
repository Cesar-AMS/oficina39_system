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
  Typography
} from '@mui/material';

const ClienteForm = ({ cliente, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    tipo: 'Pessoa Física',
    telefone: '',
    celular: '',
    email: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    observacoes: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        cpf_cnpj: cliente.cpf_cnpj || '',
        tipo: cliente.tipo || 'Pessoa Física',
        telefone: cliente.telefone || '',
        celular: cliente.celular || '',
        email: cliente.email || '',
        endereco: {
          logradouro: cliente.endereco?.logradouro || '',
          numero: cliente.endereco?.numero || '',
          complemento: cliente.endereco?.complemento || '',
          bairro: cliente.endereco?.bairro || '',
          cidade: cliente.endereco?.cidade || '',
          estado: cliente.endereco?.estado || '',
          cep: cliente.endereco?.cep || ''
        },
        observacoes: cliente.observacoes || ''
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpar erro do campo quando ele for alterado
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.cpf_cnpj.trim()) {
      newErrors.cpf_cnpj = 'CPF/CNPJ é obrigatório';
    } else if (formData.tipo === 'Pessoa Física' && formData.cpf_cnpj.length !== 11 && formData.cpf_cnpj.length !== 14) {
      newErrors.cpf_cnpj = 'CPF inválido';
    } else if (formData.tipo === 'Pessoa Jurídica' && formData.cpf_cnpj.length !== 14 && formData.cpf_cnpj.length !== 18) {
      newErrors.cpf_cnpj = 'CNPJ inválido';
    }
    
    if (!formData.telefone.trim() && !formData.celular.trim()) {
      newErrors.telefone = 'Pelo menos um telefone é obrigatório';
      newErrors.celular = 'Pelo menos um telefone é obrigatório';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
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
            Dados Pessoais
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Nome / Razão Social"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            error={!!errors.nome}
            helperText={errors.nome}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              label="Tipo"
            >
              <MenuItem value="Pessoa Física">Pessoa Física</MenuItem>
              <MenuItem value="Pessoa Jurídica">Pessoa Jurídica</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            required
            fullWidth
            label={formData.tipo === 'Pessoa Física' ? 'CPF' : 'CNPJ'}
            name="cpf_cnpj"
            value={formData.cpf_cnpj}
            onChange={handleChange}
            error={!!errors.cpf_cnpj}
            helperText={errors.cpf_cnpj}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            error={!!errors.telefone}
            helperText={errors.telefone}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Celular"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            error={!!errors.celular}
            helperText={errors.celular}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Endereço
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Logradouro"
            name="endereco.logradouro"
            value={formData.endereco.logradouro}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Número"
            name="endereco.numero"
            value={formData.endereco.numero}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Complemento"
            name="endereco.complemento"
            value={formData.endereco.complemento}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Bairro"
            name="endereco.bairro"
            value={formData.endereco.bairro}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Cidade"
            name="endereco.cidade"
            value={formData.endereco.cidade}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Estado"
            name="endereco.estado"
            value={formData.endereco.estado}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="CEP"
            name="endereco.cep"
            value={formData.endereco.cep}
            onChange={handleChange}
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

export default ClienteForm;
