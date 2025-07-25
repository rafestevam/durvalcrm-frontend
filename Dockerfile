# =================================================================
# ESTÁGIO 1: BUILDER
# Usa Node.js 18 para compilar a aplicação Vue.js
# =================================================================
FROM docker.io/node:18-alpine as builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci --prefer-offline --no-audit

# Copia o código-fonte da aplicação
COPY . .

# Compila a aplicação para produção
RUN npm run build

# =================================================================
# ESTÁGIO 2: PRODUCTION
# Usa Nginx Alpine para servir os arquivos estáticos
# =================================================================
FROM docker.io/nginx:1.25-alpine

# Remove a configuração padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos compilados do estágio builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração customizada do Nginx (será criada se necessário)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]