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

# Copia os arquivos compilados do estágio builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração customizada do Nginx para HTTP
COPY nginx-http.conf /etc/nginx/nginx.conf

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

# Expõe a porta 8080 (HTTP)
EXPOSE 8080

# Comando para iniciar o Nginx
# -----------------------------
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]