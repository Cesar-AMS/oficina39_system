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
