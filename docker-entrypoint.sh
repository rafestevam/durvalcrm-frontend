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
            
            # Substitui as variáveis de ambiente usando envsubst
            envsubst "$vars" < "$file.bak" > "$file"
            
            # Substitui URLs hardcoded específicos por variáveis de ambiente
            if [ -n "$VITE_API_BASE_URL" ]; then
                # Remove /api do final da VITE_API_BASE_URL se existir
                API_BASE=$(echo "$VITE_API_BASE_URL" | sed 's|/api$||')
                # Substitui referências hardcoded
                sed -i "s|http://localhost:8082/api|${VITE_API_BASE_URL}|g" "$file"
                sed -i "s|http://localhost:8082|${API_BASE}|g" "$file"
                sed -i "s|http://52\.186\.176\.31:8082/api|${VITE_API_BASE_URL}|g" "$file"
                sed -i "s|http://52\.186\.176\.31:8082|${API_BASE}|g" "$file"
                sed -i "s|https://52\.186\.176\.31:8082/api|${VITE_API_BASE_URL}|g" "$file"
                sed -i "s|https://52\.186\.176\.31:8082|${API_BASE}|g" "$file"
                sed -i "s|https://52\.186\.176\.31/api|${VITE_API_BASE_URL}|g" "$file"
                sed -i "s|https://52\.186\.176\.31|${API_BASE}|g" "$file"
                sed -i "s|https://localhost:8443|${API_BASE}|g" "$file"
                sed -i "s|http://localhost:8443|${API_BASE}|g" "$file"
            fi
            
            # Remove o backup
            rm "$file.bak"
        fi
    done
    
    echo "✅ Variáveis de ambiente e URLs hardcoded substituídas com sucesso!"
}

# Executa a substituição das variáveis se necessário
if [ -n "$VITE_API_BASE_URL" ] || [ -n "$VITE_KEYCLOAK_URL" ]; then
    replace_env_vars
else
    echo "⚠️  Nenhuma variável de ambiente detectada, usando configurações padrão"
fi

# Exibe as configurações atuais
echo "📋 Configurações aplicadas:"
echo "   API_BASE_URL: ${VITE_API_BASE_URL:-'http://localhost:8080/api (padrão)'}"
echo "   KEYCLOAK_URL: ${VITE_KEYCLOAK_URL:-'usando padrão'}"
echo "   KEYCLOAK_REALM: ${VITE_KEYCLOAK_REALM:-'usando padrão'}"
echo "   KEYCLOAK_CLIENT_ID: ${VITE_KEYCLOAK_CLIENT_ID:-'usando padrão'}"
echo ""
if [ -n "$VITE_API_BASE_URL" ]; then
    echo "🔄 URLs hardcoded substituídas:"
    echo "   http://localhost:8082/* → $VITE_API_BASE_URL"
    echo "   http://52.186.176.31:8082/* → $VITE_API_BASE_URL"
    echo "   https://52.186.176.31:8082/* → $VITE_API_BASE_URL"
    echo "   https://52.186.176.31/* → $VITE_API_BASE_URL"
fi

# Executa o comando passado como argumento
echo "🎯 Iniciando Nginx..."
exec "$@"