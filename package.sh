#!/bin/bash

# Script de empacotamento do Sistema Oficina 39
# Este script cria um arquivo zip contendo todo o sistema pronto para implantação

# Definir variáveis
SYSTEM_DIR="/home/ubuntu/oficina39_system"
OUTPUT_DIR="/home/ubuntu"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="oficina39_system_$TIMESTAMP.zip"

# Criar diretório temporário para organizar os arquivos
TEMP_DIR="/tmp/oficina39_package_$TIMESTAMP"
mkdir -p "$TEMP_DIR"

echo "Preparando pacote do Sistema Oficina 39..."

# Copiar arquivos para o diretório temporário
echo "Copiando arquivos do sistema..."
cp -r "$SYSTEM_DIR" "$TEMP_DIR/"

# Remover node_modules e outros arquivos desnecessários
echo "Removendo arquivos desnecessários..."
rm -rf "$TEMP_DIR/oficina39_system/backend/node_modules"
rm -rf "$TEMP_DIR/oficina39_system/frontend/node_modules"
rm -rf "$TEMP_DIR/oficina39_system/frontend/build"
find "$TEMP_DIR" -name ".git" -type d -exec rm -rf {} +
find "$TEMP_DIR" -name ".DS_Store" -type f -delete

# Criar arquivo .env de exemplo para o backend
echo "Criando arquivos de configuração de exemplo..."
cat > "$TEMP_DIR/oficina39_system/backend/.env.example" << EOL
# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Configurações do MongoDB
MONGO_URI=mongodb://localhost:27017/oficina39

# Configurações de JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRE=30d

# Outras configurações
UPLOAD_PATH=/caminho/para/uploads
EOL

# Criar arquivo .env de exemplo para o frontend
cat > "$TEMP_DIR/oficina39_system/frontend/.env.example" << EOL
REACT_APP_API_URL=http://seu-dominio.com/api
EOL

# Criar arquivo README.md na raiz do pacote
cat > "$TEMP_DIR/oficina39_system/README.md" << EOL
# Sistema Oficina 39

Sistema completo de gerenciamento para a Oficina 39, incluindo:
- Gestão de clientes e veículos
- Controle de estoque de peças
- Gerenciamento de ordens de serviço
- Emissão de notas fiscais
- Relatórios e dashboards

## Instalação

Consulte o guia de implantação em \`docs/deployment_guide.md\` para instruções detalhadas sobre como instalar e configurar o sistema.

## Requisitos

- Node.js 16.x ou superior
- MongoDB 5.0 ou superior
- Nginx (para produção)

## Estrutura do Projeto

- \`backend/\`: API RESTful (Node.js, Express, MongoDB)
- \`frontend/\`: Interface de usuário (React.js, Material UI)
- \`docs/\`: Documentação

## Suporte

Para obter suporte, entre em contato através do e-mail: suporte@oficina39.com.br
EOL

# Criar arquivo de instalação rápida
cat > "$TEMP_DIR/oficina39_system/install.sh" << EOL
#!/bin/bash

# Script de instalação rápida do Sistema Oficina 39

echo "Iniciando instalação do Sistema Oficina 39..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js não encontrado. Por favor, instale o Node.js 16.x ou superior."
    exit 1
fi

# Verificar se o MongoDB está instalado
if ! command -v mongod &> /dev/null; then
    echo "MongoDB não encontrado. Por favor, instale o MongoDB 5.0 ou superior."
    exit 1
fi

# Instalar dependências do backend
echo "Instalando dependências do backend..."
cd backend
npm install

# Configurar arquivo .env do backend
if [ ! -f .env ]; then
    echo "Configurando arquivo .env do backend..."
    cp .env.example .env
    echo "Por favor, edite o arquivo backend/.env com suas configurações."
fi

# Instalar dependências do frontend
echo "Instalando dependências do frontend..."
cd ../frontend
npm install

# Configurar arquivo .env do frontend
if [ ! -f .env ]; then
    echo "Configurando arquivo .env do frontend..."
    cp .env.example .env
    echo "Por favor, edite o arquivo frontend/.env com suas configurações."
fi

# Construir o frontend
echo "Construindo o frontend..."
npm run build

echo "Instalação concluída!"
echo "Para iniciar o sistema em modo de desenvolvimento:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "Para implantação em produção, consulte o guia em docs/deployment_guide.md"
EOL

# Tornar o script de instalação executável
chmod +x "$TEMP_DIR/oficina39_system/install.sh"

# Criar o arquivo zip
echo "Criando arquivo zip..."
cd "$TEMP_DIR"
zip -r "$OUTPUT_DIR/$PACKAGE_NAME" oficina39_system

# Limpar diretório temporário
echo "Limpando arquivos temporários..."
rm -rf "$TEMP_DIR"

echo "Pacote criado com sucesso: $OUTPUT_DIR/$PACKAGE_NAME"
echo "O sistema está pronto para ser implantado conforme as instruções no guia de implantação."
