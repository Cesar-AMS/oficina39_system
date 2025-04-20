# Documentação de Implantação - Sistema Oficina 39

Este documento fornece instruções detalhadas para a implantação do Sistema Oficina 39 em um servidor de produção.

## Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Instalação do Backend](#instalação-do-backend)
5. [Instalação do Frontend](#instalação-do-frontend)
6. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
7. [Configuração do Servidor Web](#configuração-do-servidor-web)
8. [Implantação com Docker](#implantação-com-docker)
9. [Segurança e Backup](#segurança-e-backup)
10. [Manutenção e Atualização](#manutenção-e-atualização)
11. [Solução de Problemas](#solução-de-problemas)

## Requisitos do Sistema

### Hardware Recomendado
- CPU: 2 núcleos ou mais
- RAM: 4GB ou mais
- Armazenamento: 20GB ou mais (dependendo do volume de dados esperado)

### Software Necessário
- Sistema Operacional: Ubuntu 20.04 LTS ou superior (recomendado), ou qualquer distribuição Linux moderna
- Node.js: versão 16.x ou superior
- MongoDB: versão 5.0 ou superior
- Nginx: versão 1.18 ou superior (para servidor web)
- Docker e Docker Compose (opcional, para implantação containerizada)

## Estrutura do Projeto

O sistema Oficina 39 é composto por duas partes principais:

1. **Backend**: API RESTful desenvolvida com Node.js, Express e MongoDB
2. **Frontend**: Interface de usuário desenvolvida com React.js e Material UI

```
oficina39_system/
├── backend/             # Código-fonte do backend
│   ├── controllers/     # Controladores da API
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── middleware/      # Middlewares
│   ├── config/          # Configurações
│   ├── utils/           # Utilitários
│   └── server.js        # Ponto de entrada do servidor
├── frontend/            # Código-fonte do frontend
│   ├── src/             # Código React
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── services/    # Serviços de API
│   │   └── utils/       # Utilitários
│   ├── public/          # Arquivos estáticos
│   └── package.json     # Dependências do frontend
├── docs/                # Documentação
└── docker/              # Arquivos Docker (opcional)
    ├── docker-compose.yml
    ├── Dockerfile.backend
    └── Dockerfile.frontend
```

## Configuração do Ambiente

### Instalação de Dependências no Ubuntu

```bash
# Atualizar repositórios
sudo apt update
sudo apt upgrade -y

# Instalar Node.js e npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node -v
npm -v

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Iniciar e habilitar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Instalar Nginx
sudo apt install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Instalar PM2 (gerenciador de processos para Node.js)
sudo npm install -g pm2
```

## Instalação do Backend

1. **Clonar o repositório ou fazer upload dos arquivos para o servidor**

```bash
# Se estiver usando Git
git clone <url-do-repositorio> /opt/oficina39
cd /opt/oficina39/backend

# Ou faça upload dos arquivos para o servidor e navegue até a pasta
cd /caminho/para/oficina39/backend
```

2. **Instalar dependências do backend**

```bash
npm install
```

3. **Configurar variáveis de ambiente**

Crie um arquivo `.env` na pasta raiz do backend:

```bash
nano .env
```

Adicione as seguintes configurações:

```
# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Configurações do MongoDB
MONGO_URI=mongodb://localhost:27017/oficina39

# Configurações de JWT
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_EXPIRE=30d

# Outras configurações
UPLOAD_PATH=/opt/oficina39/uploads
```

Salve o arquivo (Ctrl+O, Enter, Ctrl+X).

4. **Iniciar o backend com PM2**

```bash
pm2 start server.js --name oficina39-backend
pm2 save
pm2 startup
```

## Instalação do Frontend

1. **Navegar até a pasta do frontend**

```bash
cd /opt/oficina39/frontend
```

2. **Instalar dependências do frontend**

```bash
npm install
```

3. **Configurar variáveis de ambiente do frontend**

Crie um arquivo `.env` na pasta raiz do frontend:

```bash
nano .env
```

Adicione as seguintes configurações:

```
REACT_APP_API_URL=http://seu-dominio.com/api
```

Substitua `http://seu-dominio.com/api` pela URL real da sua API.

4. **Construir o frontend para produção**

```bash
npm run build
```

Isso criará uma pasta `build` com os arquivos estáticos otimizados para produção.

## Configuração do Banco de Dados

1. **Configurar segurança do MongoDB**

```bash
# Acessar o shell do MongoDB
mongo

# Criar banco de dados e usuário
use oficina39
db.createUser({
  user: "oficina39_user",
  pwd: "senha_segura",
  roles: [{ role: "readWrite", db: "oficina39" }]
})

# Sair do shell
exit
```

2. **Atualizar a configuração do MongoDB para habilitar autenticação**

```bash
sudo nano /etc/mongod.conf
```

Adicione ou modifique a seção de segurança:

```yaml
security:
  authorization: enabled
```

Reinicie o MongoDB:

```bash
sudo systemctl restart mongod
```

3. **Atualizar a string de conexão no arquivo .env do backend**

```
MONGO_URI=mongodb://oficina39_user:senha_segura@localhost:27017/oficina39
```

## Configuração do Servidor Web

1. **Configurar Nginx como proxy reverso**

```bash
sudo nano /etc/nginx/sites-available/oficina39
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirecionar para HTTPS (recomendado)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name seu-dominio.com www.seu-dominio.com;

    # Configurações SSL (adicione após obter certificados)
    # ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    # ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_prefer_server_ciphers on;

    # Frontend
    location / {
        root /opt/oficina39/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads {
        alias /opt/oficina39/uploads;
    }
}
```

2. **Ativar a configuração e reiniciar o Nginx**

```bash
sudo ln -s /etc/nginx/sites-available/oficina39 /etc/nginx/sites-enabled/
sudo nginx -t  # Testar a configuração
sudo systemctl restart nginx
```

3. **Configurar HTTPS com Let's Encrypt (recomendado)**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga as instruções na tela para obter e configurar os certificados SSL.

## Implantação com Docker

Alternativamente, você pode implantar o sistema usando Docker e Docker Compose.

1. **Instalar Docker e Docker Compose**

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.5.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Criar arquivo docker-compose.yml**

```bash
nano docker-compose.yml
```

Adicione o seguinte conteúdo:

```yaml
version: '3'

services:
  mongodb:
    image: mongo:5.0
    container_name: oficina39-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: rootpassword
      MONGO_INITDB_DATABASE: oficina39
    volumes:
      - mongodb_data:/data/db
    networks:
      - oficina39-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: oficina39-backend
    restart: always
    depends_on:
      - mongodb
    environment:
      PORT: 3000
      NODE_ENV: production
      MONGO_URI: mongodb://oficina39_user:senha_segura@mongodb:27017/oficina39
      JWT_SECRET: sua_chave_secreta_muito_segura
      JWT_EXPIRE: 30d
      UPLOAD_PATH: /app/uploads
    volumes:
      - uploads:/app/uploads
    networks:
      - oficina39-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: oficina39-frontend
    restart: always
    depends_on:
      - backend
    networks:
      - oficina39-network

  nginx:
    image: nginx:1.21
    container_name: oficina39-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - uploads:/var/www/uploads
    depends_on:
      - backend
      - frontend
    networks:
      - oficina39-network

networks:
  oficina39-network:
    driver: bridge

volumes:
  mongodb_data:
  uploads:
```

3. **Criar Dockerfile para o backend**

```bash
mkdir -p docker/backend
nano docker/backend/Dockerfile
```

Adicione o seguinte conteúdo:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

4. **Criar Dockerfile para o frontend**

```bash
mkdir -p docker/frontend
nano docker/frontend/Dockerfile
```

Adicione o seguinte conteúdo:

```dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.21-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

5. **Criar configuração do Nginx para Docker**

```bash
mkdir -p docker/nginx/conf.d
nano docker/nginx/conf.d/default.conf
```

Adicione o seguinte conteúdo:

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /var/www/uploads;
    }
}
```

6. **Iniciar os contêineres**

```bash
docker-compose up -d
```

## Segurança e Backup

### Configuração de Firewall

```bash
# Instalar UFW (Uncomplicated Firewall)
sudo apt install -y ufw

# Configurar regras básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Ativar o firewall
sudo ufw enable
```

### Backup do Banco de Dados

1. **Criar script de backup**

```bash
nano /opt/oficina39/scripts/backup.sh
```

Adicione o seguinte conteúdo:

```bash
#!/bin/bash

# Configurações
BACKUP_DIR="/opt/oficina39/backups"
MONGO_DATABASE="oficina39"
MONGO_USER="oficina39_user"
MONGO_PASSWORD="senha_segura"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.gz"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Realizar backup
mongodump --db=$MONGO_DATABASE --username=$MONGO_USER --password=$MONGO_PASSWORD --authenticationDatabase=$MONGO_DATABASE --archive=$BACKUP_FILE --gzip

# Manter apenas os últimos 7 backups
ls -tp $BACKUP_DIR/*.gz | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {}
```

2. **Tornar o script executável**

```bash
chmod +x /opt/oficina39/scripts/backup.sh
```

3. **Configurar backup automático com cron**

```bash
crontab -e
```

Adicione a seguinte linha para executar o backup diariamente às 2h da manhã:

```
0 2 * * * /opt/oficina39/scripts/backup.sh
```

## Manutenção e Atualização

### Atualização do Sistema

1. **Atualizar o código-fonte**

```bash
cd /opt/oficina39
git pull  # Se estiver usando Git

# Ou faça upload dos novos arquivos para o servidor
```

2. **Atualizar o backend**

```bash
cd /opt/oficina39/backend
npm install
pm2 restart oficina39-backend
```

3. **Atualizar o frontend**

```bash
cd /opt/oficina39/frontend
npm install
npm run build
```

### Monitoramento com PM2

```bash
# Verificar status dos serviços
pm2 status

# Visualizar logs
pm2 logs oficina39-backend

# Monitoramento em tempo real
pm2 monit
```

## Solução de Problemas

### Problemas Comuns e Soluções

1. **Erro de conexão com o MongoDB**
   - Verifique se o serviço MongoDB está em execução: `sudo systemctl status mongod`
   - Verifique as credenciais no arquivo `.env`
   - Verifique se o firewall permite conexões na porta 27017

2. **Erro 502 Bad Gateway no Nginx**
   - Verifique se o backend está em execução: `pm2 status`
   - Verifique os logs do Nginx: `sudo tail -f /var/log/nginx/error.log`
   - Verifique os logs do backend: `pm2 logs oficina39-backend`

3. **Problemas de permissão**
   - Verifique as permissões dos diretórios: `ls -la /opt/oficina39`
   - Ajuste as permissões se necessário: `sudo chown -R $USER:$USER /opt/oficina39`

4. **Problemas com certificados SSL**
   - Renovar certificados: `sudo certbot renew`
   - Verificar configuração SSL: `sudo nginx -t`

### Logs do Sistema

- **Logs do Nginx**: `/var/log/nginx/access.log` e `/var/log/nginx/error.log`
- **Logs do MongoDB**: `/var/log/mongodb/mongod.log`
- **Logs do PM2**: `pm2 logs`
- **Logs do Sistema**: `journalctl -xe`

## Suporte

Para obter suporte adicional, entre em contato com a equipe de desenvolvimento através do e-mail: suporte@oficina39.com.br
