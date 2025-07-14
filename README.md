# DurvalCRM Frontend

Frontend do sistema DurvalCRM, desenvolvido com Vue.js 3, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Vue.js 3** - Framework progressivo
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento
- **Tailwind CSS** - Framework CSS utility-first
- **Heroicons** - Ícones
- **Axios** - Cliente HTTP

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## 🏗️ Estrutura do Projeto

```
src/
├── assets/          # Assets estáticos
├── components/      # Componentes Vue
│   ├── common/      # Componentes reutilizáveis
│   ├── layout/      # Componentes de layout
│   └── associados/  # Componentes específicos
├── views/           # Páginas da aplicação
├── stores/          # Stores Pinia
├── services/        # Serviços e APIs
├── utils/           # Utilitários
└── router/          # Configuração de rotas
```

## 🔧 Configuração

1. **Variáveis de Ambiente**: Configure as variáveis no arquivo `.env.development`
2. **API Backend**: Certifique-se que o backend está rodando na porta 8082
3. **Keycloak**: Configure o Keycloak conforme documentação do backend

## 📱 Funcionalidades

- ✅ Autenticação via Keycloak
- ✅ Gestão de Associados (CRUD)
- ✅ Interface responsiva
- ✅ Validação de formulários
- ✅ Componentes reutilizáveis
- 🔄 Gestão de Mensalidades (em desenvolvimento)
- 🔄 Registro de Vendas (em desenvolvimento)
- 🔄 Reconciliação de Pagamentos (em desenvolvimento)

## 🎨 Design System

O projeto utiliza um design system baseado em Tailwind CSS com componentes base reutilizáveis:

- **BaseButton**: Botão com variantes (primary, secondary, success, danger)
- **BaseInput**: Input com validação e formatação
- **BaseModal**: Modal responsivo
- **AlertMessage**: Alertas e notificações
- **LoadingSpinner**: Indicador de carregamento

## 🔐 Autenticação

A autenticação é gerenciada via Keycloak com fluxo OAuth2/OIDC:

1. Usuário clica em "Entrar"
2. Redirecionamento para Keycloak
3. Login no Keycloak
4. Callback com código de autorização
5. Troca do código por token JWT
6. Armazenamento do token e dados do usuário

## 📄 Licença

Este projeto está sob a licença Apache 2.0.
