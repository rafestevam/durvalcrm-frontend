#!/bin/sh
set -e

# Script para substituir variáveis de ambiente no runtime
# Isso permite configurar a aplicação sem precisar reconstruir a imagem

echo "🚀 Iniciando DurvalCRM Frontend..."

# Função para substituir variáveis de ambiente
replace_env_vars() {
    # Lista de variáveis de ambiente para substituir
    vars='$VITE_API_BASE_URL $VITE_KEYCLOAK_URL $VITE_KEYCLOAK_REALM $VITE_KEYCLOAK_CLIENT_ID'
    
    # Substitui as variáveis nos arquivos JavaScript
    for file in /usr/share/nginx/html/assets/*.js; do
        if [ -f "$file" ]; then
            echo "📝 Processando arquivo: $file"
            # Cria um backup do arquivo original
            cp "$file" "$file.bak"
            
            # Substitui as variáveis de ambiente
            envsubst "$vars" < "$file.bak" > "$file"
            
            # Remove o backup
            rm "$file.bak"
        fi
    done
    
    echo "✅ Variáveis de ambiente substituídas com sucesso!"
}

# Executa a substituição das variáveis se necessário
if [ -n "$VITE_API_BASE_URL" ] || [ -n "$VITE_KEYCLOAK_URL" ]; then
    replace_env_vars
else
    echo "⚠️  Nenhuma variável de ambiente detectada, usando configurações padrão"
fi

# Exibe as configurações atuais
echo "📋 Configurações:"
echo "   API_BASE_URL: ${VITE_API_BASE_URL:-'usando padrão'}"
echo "   KEYCLOAK_URL: ${VITE_KEYCLOAK_URL:-'usando padrão'}"
echo "   KEYCLOAK_REALM: ${VITE_KEYCLOAK_REALM:-'usando padrão'}"
echo "   KEYCLOAK_CLIENT_ID: ${VITE_KEYCLOAK_CLIENT_ID:-'usando padrão'}"

# Executa o comando passado como argumento
echo "🎯 Iniciando Nginx..."
exec "$@"