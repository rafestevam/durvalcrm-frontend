# DurvalCRM Frontend - Configuração Docker

Este documento descreve como configurar o frontend do DurvalCRM usando variáveis de ambiente no Docker.

## Variáveis de Ambiente Disponíveis

O container suporta as seguintes variáveis de ambiente que podem ser configuradas em runtime:

| Variável | Descrição | Padrão | Exemplo |
|----------|-----------|---------|---------|
| `VITE_API_BASE_URL` | URL base da API backend | `http://localhost:8082/api` | `https://localhost:8443/api` |
| `VITE_KEYCLOAK_URL` | URL do servidor Keycloak | `http://localhost:8080` | `https://localhost:8443` |
| `VITE_KEYCLOAK_REALM` | Nome do realm no Keycloak | `durval-crm` | `durval-crm` |
| `VITE_KEYCLOAK_CLIENT_ID` | ID do client no Keycloak | `durvalcrm-app` | `durvalcrm-app` |
| `VITE_APP_NAME` | Nome da aplicação | `DurvalCRM` | `DurvalCRM` |
| `VITE_APP_VERSION` | Versão da aplicação | `1.0.0` | `1.0.0` |

## Substituição de URLs Hardcoded

O script de inicialização (`docker-entrypoint.sh`) automaticamente substitui as seguintes referências hardcoded nos arquivos JavaScript compilados:

- `http://localhost:8082/*` → `$VITE_API_BASE_URL`
- `http://52.186.176.31:8082/*` → `$VITE_API_BASE_URL`
- `https://52.186.176.31:8082/*` → `$VITE_API_BASE_URL`

## Exemplos de Uso

### Docker Run
```bash
docker run -d \
  -p 8443:8443 \
  -e VITE_API_BASE_URL="https://localhost:8443/api" \
  -e VITE_KEYCLOAK_URL="https://localhost:8443" \
  --name durvalcrm-frontend \
  rafestevam/durvalcrm-frontend:latest
```

### Docker Compose
```yaml
services:
  durvalcrm-frontend:
    image: rafestevam/durvalcrm-frontend:latest
    ports:
      - "8443:8443"
    environment:
      - VITE_API_BASE_URL=https://localhost:8443/api
      - VITE_KEYCLOAK_URL=https://localhost:8443
      - VITE_KEYCLOAK_REALM=durval-crm
      - VITE_KEYCLOAK_CLIENT_ID=durvalcrm-app
      - VITE_APP_NAME=DurvalCRM
      - VITE_APP_VERSION=1.0.0
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: durvalcrm-frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: durvalcrm-frontend
  template:
    metadata:
      labels:
        app: durvalcrm-frontend
    spec:
      containers:
      - name: frontend
        image: rafestevam/durvalcrm-frontend:latest
        ports:
        - containerPort: 8443
        env:
        - name: VITE_API_BASE_URL
          value: "https://your-domain.com/api"
        - name: VITE_KEYCLOAK_URL
          value: "https://your-domain.com"
```

## Logs de Inicialização

Durante a inicialização, o container mostrará logs indicando:
- Quais arquivos JavaScript estão sendo processados
- Quais variáveis de ambiente estão sendo aplicadas
- Quais URLs hardcoded foram substituídas

Exemplo:
```
🚀 Iniciando DurvalCRM Frontend...
📝 Processando arquivo: /usr/share/nginx/html/assets/index-CyHnt_RG.js
✅ Variáveis de ambiente e URLs hardcoded substituídas com sucesso!
📋 Configurações aplicadas:
   API_BASE_URL: https://localhost:8443/api
   KEYCLOAK_URL: https://localhost:8443
   KEYCLOAK_REALM: durval-crm
   KEYCLOAK_CLIENT_ID: durvalcrm-app

🔄 URLs hardcoded substituídas:
   http://localhost:8082/* → https://localhost:8443/api
   http://52.186.176.31:8082/* → https://localhost:8443/api
   https://52.186.176.31:8082/* → https://localhost:8443/api
🎯 Iniciando Nginx...
```

## Notas Importantes

1. **Runtime Configuration**: As variáveis são aplicadas durante a inicialização do container, não durante o build
2. **Backup Automático**: O script cria backups temporários dos arquivos antes da modificação
3. **Idempotência**: O script pode ser executado múltiplas vezes sem causar problemas
4. **Fallback**: Se nenhuma variável de ambiente for fornecida, o container usa configurações padrão