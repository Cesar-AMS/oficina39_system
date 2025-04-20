import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

const NotaFiscalPreview = ({ nota }) => {
  if (!nota) return null;

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 4, border: '1px solid #ddd' }}>
        {/* Cabeçalho */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            OFICINA 39
          </Typography>
          <Typography variant="body2">
            Rua das Ferramentas, 39 - Centro - Cidade - Estado
          </Typography>
          <Typography variant="body2">
            CNPJ: 00.000.000/0001-39 - Telefone: (00) 0000-0000
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Título */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            NOTA FISCAL DE SERVIÇO
          </Typography>
          <Typography variant="h6" color="primary">
            Nº {nota.numero || '[Será gerado automaticamente]'}
          </Typography>
        </Box>

        {/* Informações da Nota */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Data de Emissão:</Typography>
            <Typography variant="body2" gutterBottom>
              {nota.data_emissao ? new Date(nota.data_emissao).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}
            </Typography>

            <Typography variant="subtitle2">Cliente:</Typography>
            <Typography variant="body2" gutterBottom>
              {nota.cliente?.nome || 'N/A'}
            </Typography>

            <Typography variant="subtitle2">CPF/CNPJ:</Typography>
            <Typography variant="body2" gutterBottom>
              {nota.cliente?.documento || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Endereço:</Typography>
            <Typography variant="body2" gutterBottom>
              {nota.cliente?.endereco ? `${nota.cliente.endereco}, ${nota.cliente.numero}` : 'N/A'}
              {nota.cliente?.complemento ? ` - ${nota.cliente.complemento}` : ''}
              {nota.cliente?.bairro ? `, ${nota.cliente.bairro}` : ''}
              {nota.cliente?.cidade && nota.cliente?.estado ? `, ${nota.cliente.cidade}/${nota.cliente.estado}` : ''}
              {nota.cliente?.cep ? ` - CEP: ${nota.cliente.cep}` : ''}
            </Typography>

            <Typography variant="subtitle2">Ordem de Serviço:</Typography>
            <Typography variant="body2" gutterBottom>
              {nota.ordem_servico_id ? `#${nota.ordem_servico_id.numero || ''}` : 'N/A'}
            </Typography>

            <Typography variant="subtitle2">Forma de Pagamento:</Typography>
            <Typography variant="body2" gutterBottom>
              {nota.forma_pagamento || 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        {/* Itens da Nota */}
        <Typography variant="subtitle1" gutterBottom>
          Itens
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Quantidade</TableCell>
                <TableCell align="right">Valor Unit. (R$)</TableCell>
                <TableCell align="right">Valor Total (R$)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nota.itens && nota.itens.length > 0 ? (
                nota.itens.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.tipo}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell align="center">{item.quantidade}</TableCell>
                    <TableCell align="right">{item.valor_unitario.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.valor_total.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum item adicionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Valores */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Observações:</Typography>
            <Typography variant="body2" gutterBottom>
              {nota.observacoes || 'Nenhuma observação.'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px', mb: 1 }}>
                <Typography variant="subtitle2">Valor Serviços:</Typography>
                <Typography variant="body2">R$ {nota.valor_servicos?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px', mb: 1 }}>
                <Typography variant="subtitle2">Valor Produtos:</Typography>
                <Typography variant="body2">R$ {nota.valor_produtos?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px', mb: 1 }}>
                <Typography variant="subtitle2">Desconto:</Typography>
                <Typography variant="body2">R$ {nota.desconto?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Divider sx={{ width: '100%', maxWidth: '300px', my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px' }}>
                <Typography variant="subtitle1" fontWeight="bold">Valor Total:</Typography>
                <Typography variant="subtitle1" fontWeight="bold">R$ {nota.valor_total?.toFixed(2) || '0.00'}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Rodapé */}
        <Divider sx={{ mt: 4, mb: 2 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Esta nota fiscal é válida como comprovante de pagamento.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Oficina 39 - Excelência em serviços automotivos
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotaFiscalPreview;
