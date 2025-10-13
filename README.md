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
- **Vitest** - Framework de testes
- **Testing Library** - Utilitários de teste
- **happy-dom** - Simulação DOM para testes

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
│   │   └── __tests__/  # Testes de componentes comuns
│   ├── layout/      # Componentes de layout
│   └── associados/  # Componentes específicos de features
│       └── __tests__/  # Testes de componentes de associados
├── views/           # Páginas da aplicação
├── stores/          # Stores Pinia
│   └── __tests__/   # Testes de stores
├── services/        # Serviços e APIs
│   └── __tests__/   # Testes de services
├── utils/           # Utilitários
│   └── __tests__/   # Testes de utilitários
├── router/          # Configuração de rotas
├── types/           # Definições TypeScript
└── test/            # Configuração e utilitários de teste
    ├── setup.ts     # Configuração global de testes
    └── utils/       # Utilitários de teste
        ├── mockFactories.ts     # Factories para criar dados mock
        ├── apiMockHelpers.ts    # Helpers para mock de API
        ├── testHelpers.ts       # Helpers gerais de teste
        └── storeTestHelpers.ts  # Helpers para testes de Pinia
```

## 🔧 Configuração

1. **Variáveis de Ambiente**: Configure as variáveis no arquivo `.env.development`
2. **API Backend**: Certifique-se que o backend está rodando
3. **Keycloak**: Configure o Keycloak conforme documentação do backend

## 📱 Funcionalidades

- ✅ Autenticação via Keycloak com OAuth2/OIDC PKCE
- ✅ Gestão de Associados (CRUD completo)
- ✅ Gestão de Mensalidades
- ✅ Registro de Doações
- ✅ Registro de Vendas
- ✅ Dashboard com métricas
- ✅ Interface responsiva
- ✅ Validação de formulários
- ✅ Componentes reutilizáveis
- ✅ Framework de testes completo

## 🎨 Design System

O projeto utiliza um design system baseado em Tailwind CSS com componentes base reutilizáveis:

- **BaseButton**: Botão com variantes (primary, secondary, success, danger)
- **BaseInput**: Input com validação e formatação
- **BaseModal**: Modal responsivo
- **AlertMessage**: Alertas e notificações
- **LoadingSpinner**: Indicador de carregamento
- **NotificationTray**: Sistema de notificações toast

## 🔐 Autenticação

A autenticação é gerenciada via Keycloak com fluxo OAuth2/OIDC PKCE:

1. Usuário clica em "Entrar"
2. Geração de state CSRF e code verifier/challenge PKCE
3. Redirecionamento para Keycloak com parâmetros PKCE
4. Login no Keycloak
5. Callback com código de autorização e state
6. Validação de state (proteção CSRF)
7. Troca do código por tokens usando code verifier
8. Armazenamento seguro de tokens
9. Refresh automático de tokens em caso de 401

## 🧪 Testing Framework

O DurvalCRM Frontend implementa um framework de testes completo com Vitest e Testing Library. Ver **[TESTING-GUIDE.md](../TESTING-GUIDE.md)** para documentação completa.

### Executar Testes

```bash
# Todos os testes (single run - CI mode)
npm run test:run

# Modo watch (desenvolvimento)
npm run test

# Teste específico
npm run test -- src/components/common/__tests__/BaseButton.test.ts

# Com cobertura de código
npm run test:coverage

# Interface interativa
npm run test:ui
```

### Configuração de Testes

- **Framework**: Vitest 3.2+
- **Component Testing**: @testing-library/vue 8.1
- **API Mocking**: axios-mock-adapter 2.1
- **DOM Simulation**: happy-dom 18.0
- **Store Testing**: Pinia real (não mock)
- **Setup Global**: `src/test/setup.ts`

### Estrutura do Framework de Testes

```
src/test/
├── setup.ts                    # Configuração global (cleanup, console mock)
└── utils/                      # Utilitários de teste
    ├── mockFactories.ts        # Factories para dados mock
    ├── apiMockHelpers.ts       # Mock de requisições HTTP
    ├── testHelpers.ts          # Helpers gerais (router, storage, async)
    └── storeTestHelpers.ts     # Helpers para Pinia stores
```

### Test Utilities

#### 1. Mock Factories - Criação de Dados de Teste

```typescript
import {
  createMockAssociado,
  createMockMensalidade,
  createMockDoacao,
  createMockVenda,
  createMockArray,
  createMockPaginatedResponse
} from '@/test/utils/mockFactories'

// Criar mock com valores padrão
const associado = createMockAssociado()

// Customizar valores
const associadoCustom = createMockAssociado({
  nomeCompleto: 'Maria Santos',
  cpf: '987.654.321-00',
  ativo: false
})

// Criar arrays
const associados = createMockArray(
  (i) => createMockAssociado({ nomeCompleto: `Associado ${i}` }),
  10
)

// Criar resposta paginada
const paginated = createMockPaginatedResponse(associados, 1, 10)
```

#### 2. API Mock Helpers - Mock de Requisições

```typescript
import { createMockApiHelper } from '@/test/utils/apiMockHelpers'
import axios from 'axios'

const mockApi = createMockApiHelper(axios)

// Mock GET
mockApi.onGet('/api/v1/associados', mockData, 200)

// Mock POST
mockApi.onPost('/api/v1/associados', newData, 201)

// Mock erro
mockApi.onError('get', '/api/v1/associados', 500, 'Server error')

// Mock erro de rede
mockApi.onNetworkError('get', '/api/v1/associados')

// Mock timeout
mockApi.onTimeout('get', '/api/v1/associados')

// Limpar e restaurar
mockApi.reset()
mockApi.restore()
```

#### 3. Test Helpers - Utilitários Gerais

```typescript
import {
  createMockRouter,
  flushPromises,
  wait,
  setupMockStorage,
  suppressConsole,
  typeInInput,
  submitForm
} from '@/test/utils/testHelpers'

// Router mock
const router = createMockRouter()

// Aguardar promessas
await flushPromises()

// Storage mock
const { localStorage, sessionStorage } = setupMockStorage()
localStorage.setItem('key', 'value')

// Suprimir console
const restore = suppressConsole()
// ... testes ...
restore()

// Simular digitação
await typeInInput(input, 'João Silva')

// Submit de form
await submitForm(form)
```

#### 4. Store Test Helpers - Testes de Pinia

```typescript
import {
  setupTestPinia,
  createMockStore,
  waitForStoreAction,
  spyOnStoreAction,
  assertStoreState
} from '@/test/utils/storeTestHelpers'

// Setup Pinia
setupTestPinia()

// Criar store mock
const mockStore = createMockStore('associados', {
  associados: [],
  loading: false
})

// Aguardar ação
await waitForStoreAction(() => store.fetchAssociados())

// Spy em ação
const spy = spyOnStoreAction(store, 'fetchAssociados')

// Validar estado
assertStoreState(store, {
  loading: false,
  error: null
})
```

### Exemplo: Teste de Componente

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { createMockAssociado } from '@/test/utils/mockFactories'
import AssociadoForm from '../AssociadoForm.vue'

describe('AssociadoForm', () => {
  it('deve renderizar com dados do associado', () => {
    const associado = createMockAssociado()

    render(AssociadoForm, {
      props: { associado }
    })

    expect(screen.getByDisplayValue(associado.nomeCompleto))
      .toBeInTheDocument()
  })

  it('deve emitir evento submit', async () => {
    const { emitted } = render(AssociadoForm)

    await fireEvent.update(screen.getByLabelText('Nome'), 'João Silva')
    await fireEvent.click(screen.getByText('Salvar'))

    expect(emitted()).toHaveProperty('submit')
  })
})
```

### Exemplo: Teste de Store

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAssociadosStore } from '@/stores/associados'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { createMockAssociado } from '@/test/utils/mockFactories'

describe('Associados Store', () => {
  let mockApi: MockAdapter
  let store: ReturnType<typeof useAssociadosStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAssociadosStore()
    mockApi = new MockAdapter(axios)
  })

  it('deve buscar associados com sucesso', async () => {
    const mocks = [createMockAssociado(), createMockAssociado()]
    mockApi.onGet('/api/v1/associados').reply(200, mocks)

    await store.fetchAssociados()

    expect(store.associados).toHaveLength(2)
    expect(store.loading).toBe(false)
  })
})
```

### Exemplo: Teste de Service

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { MensalidadeService } from '@/services/mensalidade'
import { createMockMensalidade } from '@/test/utils/mockFactories'

describe('MensalidadeService', () => {
  let mockApi: MockAdapter
  let service: MensalidadeService

  beforeEach(() => {
    mockApi = new MockAdapter(axios)
    service = new MensalidadeService()
  })

  it('deve listar mensalidades', async () => {
    const mocks = [createMockMensalidade(), createMockMensalidade()]
    mockApi.onGet('/api/v1/mensalidades').reply(200, mocks)

    const result = await service.listarTodas()

    expect(result).toHaveLength(2)
  })
})
```

### Best Practices para Testes

1. **Use Testing Library queries**: Prefira `getByRole`, `getByLabelText`
2. **Teste comportamento do usuário**: Não teste implementação
3. **Mock APIs com axios-mock-adapter**: Use os helpers fornecidos
4. **Use factories para dados**: createMockAssociado, createMockMensalidade
5. **Setup/teardown adequado**: beforeEach/afterEach
6. **Teste componentes isoladamente**: Mock dependências externas
7. **Use Pinia real**: Não faça mock das stores
8. **AAA Pattern**: Arrange, Act, Assert

### Exemplos Completos

Ver exemplos em:
- `src/components/associados/__tests__/AssociadoForm.example.test.ts`
- `src/stores/__tests__/associados.example.test.ts`
- `src/services/__tests__/mensalidade.example.test.ts`

## 📄 Licença

Este projeto está sob a licença Apache 2.0.
