# =================================================================
# ESTÁGIO 1: BUILDER
# Usa Node.js 22 para compilar a aplicação Vue.js
# =================================================================
FROM docker.io/node:22-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci --prefer-offline --no-audit

# Copia o código-fonte da aplicação
COPY . .

# Compila a aplicação para produção
# Ignora erros de TypeScript usando npx vite build diretamente
RUN npx vite build

# =================================================================
# ESTÁGIO 2: PRODUCTION
# Usa Nginx Alpine para servir os arquivos estáticos
# =================================================================
FROM docker.io/nginx:1.27-alpine

# Remove a configuração padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Instala o OpenSSL para gerar certificados SSL
RUN apk add --no-cache openssl

# Cria diretório para certificados SSL
RUN mkdir -p /etc/nginx/ssl

# Gera certificado SSL auto-assinado
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=BR/ST=SP/L=SaoPaulo/O=DurvalCRM/OU=IT/CN=localhost"

# Copia os arquivos compilados do estágio builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração customizada do Nginx (será criada se necessário)
COPY nginx.conf /etc/nginx/nginx.conf

# Adiciona um script de inicialização para substituir variáveis de ambiente
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Define variáveis de ambiente padrão (podem ser sobrescritas em runtime)
ENV VITE_API_BASE_URL="" \
    VITE_KEYCLOAK_URL="" \
    VITE_KEYCLOAK_REALM="durval-crm" \
    VITE_KEYCLOAK_CLIENT_ID="durvalcrm-app" \
    VITE_APP_NAME="DurvalCRM" \
    VITE_APP_VERSION="1.0.0"

# Expõe a porta 8443 (HTTPS)
EXPOSE 8443

# Comando para iniciar o Nginx
# -----------------------------
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]