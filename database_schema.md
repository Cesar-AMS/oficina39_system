# Esquema do Banco de Dados - MongoDB

Este documento descreve o esquema do banco de dados MongoDB para o Sistema de Gerenciamento da Oficina 39.

## Coleções

### Clientes
```javascript
{
  _id: ObjectId,
  nome: String,
  cpf_cnpj: String,
  tipo: String, // "Pessoa Física" ou "Pessoa Jurídica"
  telefone: String,
  celular: String,
  email: String,
  endereco: {
    rua: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String
  },
  data_cadastro: Date,
  ultima_atualizacao: Date,
  observacoes: String,
  ativo: Boolean
}
```

### Veiculos
```javascript
{
  _id: ObjectId,
  cliente_id: ObjectId, // Referência ao cliente
  placa: String,
  marca: String,
  modelo: String,
  ano_fabricacao: Number,
  ano_modelo: Number,
  cor: String,
  chassi: String,
  quilometragem: Number,
  combustivel: String, // "Gasolina", "Etanol", "Diesel", "Flex", etc.
  data_cadastro: Date,
  ultima_atualizacao: Date,
  observacoes: String,
  historico_manutencao: [
    {
      data: Date,
      quilometragem: Number,
      descricao: String
    }
  ]
}
```

### Produtos
```javascript
{
  _id: ObjectId,
  codigo: String,
  nome: String,
  descricao: String,
  categoria: String,
  fornecedor_id: ObjectId, // Referência ao fornecedor
  preco_custo: Number,
  preco_venda: Number,
  margem_lucro: Number,
  unidade_medida: String, // "Unidade", "Litro", "Kg", etc.
  estoque_atual: Number,
  estoque_minimo: Number,
  estoque_maximo: Number,
  localizacao_estoque: String,
  data_cadastro: Date,
  ultima_atualizacao: Date,
  codigo_barras: String,
  ncm: String, // Nomenclatura Comum do Mercosul
  ativo: Boolean
}
```

### Fornecedores
```javascript
{
  _id: ObjectId,
  razao_social: String,
  nome_fantasia: String,
  cnpj: String,
  inscricao_estadual: String,
  telefone: String,
  email: String,
  endereco: {
    rua: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String
  },
  contato_nome: String,
  contato_telefone: String,
  contato_email: String,
  produtos_fornecidos: [ObjectId], // Referências aos produtos
  data_cadastro: Date,
  ultima_atualizacao: Date,
  observacoes: String,
  ativo: Boolean
}
```

### Servicos
```javascript
{
  _id: ObjectId,
  codigo: String,
  nome: String,
  descricao: String,
  categoria: String,
  preco: Number,
  tempo_estimado: Number, // Em minutos
  data_cadastro: Date,
  ultima_atualizacao: Date,
  ativo: Boolean
}
```

### OrdemServico
```javascript
{
  _id: ObjectId,
  numero: String,
  cliente_id: ObjectId, // Referência ao cliente
  veiculo_id: ObjectId, // Referência ao veículo
  data_entrada: Date,
  data_previsao: Date,
  data_conclusao: Date,
  status: String, // "Aberta", "Em andamento", "Aguardando peças", "Concluída", "Entregue", "Cancelada"
  quilometragem: Number,
  diagnostico: String,
  observacoes_cliente: String,
  observacoes_internas: String,
  itens_servico: [
    {
      servico_id: ObjectId, // Referência ao serviço
      descricao: String,
      valor: Number,
      mecanico_id: ObjectId, // Referência ao funcionário
      tempo_gasto: Number, // Em minutos
      status: String // "Pendente", "Em andamento", "Concluído"
    }
  ],
  itens_produto: [
    {
      produto_id: ObjectId, // Referência ao produto
      descricao: String,
      quantidade: Number,
      valor_unitario: Number,
      valor_total: Number
    }
  ],
  valor_servicos: Number,
  valor_produtos: Number,
  desconto: Number,
  valor_total: Number,
  forma_pagamento: String,
  parcelas: Number,
  nota_fiscal_id: ObjectId, // Referência à nota fiscal
  responsavel_id: ObjectId, // Funcionário responsável
  data_cadastro: Date,
  ultima_atualizacao: Date
}
```

### NotasFiscais
```javascript
{
  _id: ObjectId,
  numero: String,
  serie: String,
  ordem_servico_id: ObjectId, // Referência à ordem de serviço
  cliente_id: ObjectId, // Referência ao cliente
  data_emissao: Date,
  valor_total: Number,
  itens: [
    {
      descricao: String,
      quantidade: Number,
      valor_unitario: Number,
      valor_total: Number,
      ncm: String,
      cfop: String
    }
  ],
  impostos: {
    base_calculo_icms: Number,
    valor_icms: Number,
    base_calculo_iss: Number,
    valor_iss: Number,
    pis: Number,
    cofins: Number
  },
  chave_acesso: String,
  status: String, // "Emitida", "Cancelada"
  xml: String, // XML da nota fiscal
  pdf: String, // Caminho para o PDF da nota
  data_cadastro: Date,
  ultima_atualizacao: Date
}
```

### Funcionarios
```javascript
{
  _id: ObjectId,
  nome: String,
  cpf: String,
  rg: String,
  data_nascimento: Date,
  telefone: String,
  celular: String,
  email: String,
  endereco: {
    rua: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String
  },
  cargo: String,
  departamento: String,
  data_admissao: Date,
  data_demissao: Date,
  salario: Number,
  comissao: Number,
  usuario_id: ObjectId, // Referência ao usuário do sistema
  data_cadastro: Date,
  ultima_atualizacao: Date,
  ativo: Boolean
}
```

### Usuarios
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  senha_hash: String,
  salt: String,
  funcionario_id: ObjectId, // Referência ao funcionário
  perfil: String, // "Administrador", "Gerente", "Mecânico", "Atendente", etc.
  permissoes: [String], // Lista de permissões
  ultimo_acesso: Date,
  data_cadastro: Date,
  ultima_atualizacao: Date,
  ativo: Boolean,
  token_reset_senha: String,
  expiracao_token_reset: Date
}
```

### MovimentacaoEstoque
```javascript
{
  _id: ObjectId,
  produto_id: ObjectId, // Referência ao produto
  tipo: String, // "Entrada", "Saída", "Ajuste"
  quantidade: Number,
  motivo: String,
  documento_referencia: String, // Nota fiscal, ordem de serviço, etc.
  documento_id: ObjectId, // ID do documento de referência
  responsavel_id: ObjectId, // Funcionário responsável
  data_movimentacao: Date,
  observacoes: String,
  data_cadastro: Date
}
```

### Financeiro
```javascript
{
  _id: ObjectId,
  tipo: String, // "Receita", "Despesa"
  categoria: String,
  descricao: String,
  valor: Number,
  data_vencimento: Date,
  data_pagamento: Date,
  forma_pagamento: String,
  status: String, // "Pendente", "Pago", "Atrasado", "Cancelado"
  documento_referencia: String,
  documento_id: ObjectId, // ID do documento de referência (OS, NF, etc.)
  cliente_fornecedor_id: ObjectId, // Cliente ou fornecedor
  responsavel_id: ObjectId, // Funcionário responsável
  observacoes: String,
  data_cadastro: Date,
  ultima_atualizacao: Date
}
```

### Agendamentos
```javascript
{
  _id: ObjectId,
  cliente_id: ObjectId, // Referência ao cliente
  veiculo_id: ObjectId, // Referência ao veículo
  data_hora: Date,
  servico_id: ObjectId, // Referência ao serviço
  descricao: String,
  status: String, // "Agendado", "Confirmado", "Cancelado", "Concluído"
  responsavel_id: ObjectId, // Funcionário responsável
  observacoes: String,
  data_cadastro: Date,
  ultima_atualizacao: Date
}
```

### Configuracoes
```javascript
{
  _id: ObjectId,
  empresa: {
    razao_social: String,
    nome_fantasia: String,
    cnpj: String,
    inscricao_estadual: String,
    telefone: String,
    email: String,
    endereco: {
      rua: String,
      numero: String,
      complemento: String,
      bairro: String,
      cidade: String,
      estado: String,
      cep: String
    },
    logo: String // Caminho para o arquivo da logo
  },
  fiscal: {
    regime_tributario: String,
    ambiente_nfe: String, // "Produção" ou "Homologação"
    serie_nfe: String,
    proxima_numeracao_nfe: Number,
    certificado_digital: String, // Caminho para o certificado
    senha_certificado: String // Criptografada
  },
  sistema: {
    tema: String,
    itens_por_pagina: Number,
    backup_automatico: Boolean,
    intervalo_backup: Number // Em dias
  },
  ultima_atualizacao: Date
}
```

### Logs
```javascript
{
  _id: ObjectId,
  usuario_id: ObjectId, // Referência ao usuário
  acao: String,
  entidade: String, // "Cliente", "Produto", "OrdemServico", etc.
  entidade_id: ObjectId,
  detalhes: Object, // Detalhes da ação
  ip: String,
  data_hora: Date
}
```
