# DurvalCRM Testing Guide

Este guia fornece documentação completa sobre o framework de testes unitários implementado para o DurvalCRM, cobrindo tanto o backend (Java/Jakarta EE) quanto o frontend (Vue 3/TypeScript).

## Índice

- [Visão Geral](#visão-geral)
- [Backend Testing (Java)](#backend-testing-java)
  - [Estrutura e Ferramentas](#estrutura-e-ferramentas-backend)
  - [Test Utilities](#test-utilities)
  - [Exemplos de Testes](#exemplos-de-testes-backend)
- [Frontend Testing (TypeScript)](#frontend-testing-typescript)
  - [Estrutura e Ferramentas](#estrutura-e-ferramentas-frontend)
  - [Test Utilities](#test-utilities-frontend)
  - [Exemplos de Testes](#exemplos-de-testes-frontend)
- [Melhores Práticas](#melhores-práticas)
- [Executando os Testes](#executando-os-testes)
- [Cobertura de Código](#cobertura-de-código)

## Visão Geral

O framework de testes do DurvalCRM foi projetado para facilitar a criação e manutenção de testes unitários de alta qualidade em todo o projeto. Os principais objetivos são:

- **Simplicidade**: APIs fluentes e intuitivas
- **Reutilização**: Componentes reutilizáveis para cenários comuns
- **Isolamento**: Testes independentes e sem efeitos colaterais
- **Velocidade**: Execução rápida com mocks e in-memory databases
- **Manutenibilidade**: Código de teste fácil de ler e manter

## Backend Testing (Java)

### Estrutura e Ferramentas Backend

#### Stack de Testes
- **JUnit 4.13.2**: Framework de testes
- **Mockito 5.4**: Mocking e stubbing
- **H2 Database**: Database in-memory para testes
- **JaCoCo**: Cobertura de código
- **Jakarta EE 10**: APIs para testes de integração

#### Estrutura de Diretórios

```
durvalcrm-j2ee/src/test/java/
├── br/org/cecairbar/durvalcrm/
│   ├── test/
│   │   ├── base/              # Classes base para testes
│   │   │   ├── BaseUseCaseTest.java
│   │   │   ├── BaseRepositoryTest.java
│   │   │   └── BaseResourceTest.java
│   │   └── util/              # Utilidades de teste
│   │       ├── TestDataBuilder.java
│   │       ├── MockFactory.java
│   │       └── TestAssertions.java
│   ├── examples/              # Exemplos de testes
│   │   ├── MensalidadeUseCaseExampleTest.java
│   │   └── VendaResourceExampleTest.java
│   ├── domain/model/          # Testes de entidades de domínio
│   ├── application/usecase/   # Testes de casos de uso
│   └── infrastructure/web/    # Testes de recursos REST
└── resources/
    └── META-INF/
        └── persistence.xml    # Configuração H2 para testes
```

### Test Utilities

#### 1. TestDataBuilder

Builder pattern para criar objetos de teste com valores padrão sensatos.

```java
import static br.org.cecairbar.durvalcrm.test.util.TestDataBuilder.*;

// Criar um associado com valores padrão
Associado associado = umAssociado().build();

// Customizar valores
Associado associadoCustomizado = umAssociado()
    .comNome("Maria Santos")
    .comCpf("987.654.321-00")
    .comEmail("maria@example.com")
    .ativo()
    .build();

// Criar mensalidade
Mensalidade mensalidade = umaMensalidade()
    .paraAssociado(associadoId)
    .referencia(5, 2024)
    .comValor(new BigDecimal("10.90"))
    .build();

// Criar doação
Doacao doacao = umaDoacao()
    .deAssociado(associado)
    .comValor(new BigDecimal("50.00"))
    .confirmada()
    .build();

// Criar venda
Venda venda = umaVenda()
    .comDescricao("Venda de livros")
    .comValor(new BigDecimal("30.00"))
    .comOrigem(OrigemVenda.BAZAR)
    .build();
```

#### 2. MockFactory

Factory para criar mocks de repositórios e serviços.

```java
import static br.org.cecairbar.durvalcrm.test.util.MockFactory.*;

// Criar mocks de repositórios
AssociadoRepository mockRepository = mockAssociadoRepository();
MensalidadeRepository mockMensalidadeRepo = mockMensalidadeRepository();
DoacaoRepository mockDoacaoRepo = mockDoacaoRepository();
VendaRepository mockVendaRepo = mockVendaRepository();

// Resetar mocks entre testes
MockFactory.resetMocks(mockRepository, mockMensalidadeRepo);
```

#### 3. TestAssertions

Assertions fluentes para validar objetos de domínio.

```java
import static br.org.cecairbar.durvalcrm.test.util.TestAssertions.*;

// Assertions de Associado
assertAssociado(associado)
    .hasId(expectedId)
    .hasNome("João Silva")
    .hasCpf("123.456.789-00")
    .isAtivo();

// Assertions de Mensalidade
assertMensalidade(mensalidade)
    .pertenceAoAssociado(associadoId)
    .hasReferencia(5, 2024)
    .hasValor(new BigDecimal("10.90"))
    .isPendente()
    .naoTemPagamento();

// Assertions de Doação
assertDoacao(doacao)
    .deAssociado(associado)
    .hasTipo(TipoDoacao.UNICA)
    .hasValor(new BigDecimal("50.00"))
    .isConfirmada();

// Assertions de Venda
assertVenda(venda)
    .hasOrigem(OrigemVenda.CANTINA)
    .hasValor(new BigDecimal("25.00"))
    .hasFormaPagamento(FormaPagamento.DINHEIRO);
```

#### 4. Base Test Classes

Classes base que fornecem setup comum para diferentes tipos de testes.

**BaseUseCaseTest**: Para testes de use cases
```java
public class MeuUseCaseTest extends BaseUseCaseTest {

    @Before
    public void setUp() {
        super.setUp();
        // Setup específico do teste
    }

    @Test
    public void deveFazerAlgo() {
        // Teste
    }

    // Helper para validar regras de negócio
    assertBusinessRuleViolation(
        () -> useCase.metodoQueDeveFalhar(),
        "Mensagem esperada"
    );
}
```

**BaseRepositoryTest**: Para testes de repositório com EntityManager
```java
public class MeuRepositoryTest extends BaseRepositoryTest {

    @Before
    public void setUp() {
        super.setUp();
        repository = new MeuRepositoryImpl(entityManager);
    }

    @Test
    public void deveSalvarEntidade() {
        beginTransaction();
        // Operações no banco
        commitTransaction();

        flushAndClear();
        // Validações
    }
}
```

**BaseResourceTest**: Para testes de recursos REST
```java
public class MeuResourceTest extends BaseResourceTest {

    @Before
    public void setUp() {
        super.setUp();
        mockUseCase = mock(MeuUseCase.class);
        resource = new MeuResource(mockUseCase);
    }

    @Test
    public void deveRetornarOk() {
        Response response = resource.buscar();
        assertOk(response);
        assertNotNull(response.getEntity());
    }
}
```

### Exemplos de Testes Backend

#### Teste de Use Case

```java
public class MensalidadeUseCaseTest extends BaseUseCaseTest {

    private MensalidadeUseCaseImpl useCase;
    private MensalidadeRepository mockRepository;

    @Before
    public void setUp() {
        super.setUp();
        mockRepository = MockFactory.mockMensalidadeRepository();
        useCase = new MensalidadeUseCaseImpl(mockRepository);
    }

    @Test
    public void deveCriarNovaMensalidade() {
        // Arrange
        UUID associadoId = UUID.randomUUID();
        Mensalidade mensalidade = TestDataBuilder.umaMensalidade()
            .paraAssociado(associadoId)
            .build();

        when(mockRepository.save(any())).thenReturn(mensalidade);

        // Act
        Mensalidade resultado = useCase.criar(associadoId, 5, 2024,
            new BigDecimal("10.90"));

        // Assert
        assertMensalidade(resultado)
            .pertenceAoAssociado(associadoId)
            .isPendente();
        verify(mockRepository).save(any());
    }

    @Test
    public void deveLancarExcecaoParaValorNegativo() {
        assertBusinessRuleViolation(
            () -> useCase.criar(UUID.randomUUID(), 5, 2024,
                new BigDecimal("-10.00")),
            "Valor deve ser positivo"
        );
    }
}
```

#### Teste de Resource (REST)

```java
public class VendaResourceTest extends BaseResourceTest {

    private VendaResource resource;
    private VendaUseCase mockUseCase;

    @Before
    public void setUp() {
        super.setUp();
        mockUseCase = mock(VendaUseCase.class);
        resource = new VendaResource(mockUseCase);
    }

    @Test
    public void deveCriarVenda() {
        // Arrange
        VendaDTO dto = new VendaDTO();
        dto.setDescricao("Nova venda");
        dto.setValor(new BigDecimal("30.00"));

        Venda vendaCriada = TestDataBuilder.umaVenda()
            .comDescricao(dto.getDescricao())
            .build();

        when(mockUseCase.criar(any())).thenReturn(vendaCriada);

        // Act
        Response response = resource.criar(dto);

        // Assert
        assertCreated(response);
        verify(mockUseCase).criar(any());
    }

    @Test
    public void deveRetornar404ParaIdInexistente() {
        // Arrange
        when(mockUseCase.buscarPorId(any())).thenReturn(Optional.empty());

        // Act
        Response response = resource.buscarPorId(UUID.randomUUID());

        // Assert
        assertNotFound(response);
    }
}
```

## Frontend Testing (TypeScript)

### Estrutura e Ferramentas Frontend

#### Stack de Testes
- **Vitest**: Framework de testes rápido e moderno
- **@testing-library/vue**: Testing utilities para Vue
- **@vue/test-utils**: Utilitários oficiais do Vue
- **axios-mock-adapter**: Mock de requisições HTTP
- **happy-dom**: DOM simulation
- **@vitest/ui**: Interface visual para testes

#### Estrutura de Diretórios

```
durvalcrm-frontend/src/
├── test/
│   ├── setup.ts                    # Configuração global dos testes
│   └── utils/                      # Utilidades de teste
│       ├── mockFactories.ts        # Factories para criar dados mock
│       ├── apiMockHelpers.ts       # Helpers para mock de API
│       ├── testHelpers.ts          # Helpers gerais
│       └── storeTestHelpers.ts     # Helpers para testes de store
├── components/
│   └── **/__tests__/               # Testes de componentes
├── stores/
│   └── __tests__/                  # Testes de stores
├── services/
│   └── __tests__/                  # Testes de services
└── utils/
    └── __tests__/                  # Testes de utilities
```

### Test Utilities Frontend

#### 1. Mock Factories

Factories para criar objetos mock com valores padrão.

```typescript
import {
  createMockAssociado,
  createMockMensalidade,
  createMockDoacao,
  createMockVenda,
  createMockUsuario,
  createMockArray,
  createMockPaginatedResponse
} from '@/test/utils/mockFactories'

// Criar um associado mock
const associado = createMockAssociado()

// Customizar valores
const associadoCustomizado = createMockAssociado({
  nomeCompleto: 'Maria Santos',
  cpf: '987.654.321-00',
  ativo: false
})

// Criar array de mocks
const associados = createMockArray(
  (index) => createMockAssociado({ nomeCompleto: `Associado ${index}` }),
  10
)

// Criar resposta paginada
const paginatedResponse = createMockPaginatedResponse(associados, 1, 10)
```

#### 2. API Mock Helpers

Utilitários para mockar requisições HTTP com axios-mock-adapter.

```typescript
import { createMockApiHelper } from '@/test/utils/apiMockHelpers'
import axios from 'axios'

const mockApi = createMockApiHelper(axios)

// Mock de GET bem-sucedido
mockApi.onGet('/api/v1/associados', associados, 200)

// Mock de POST
mockApi.onPost('/api/v1/associados', novoAssociado, 201)

// Mock de erro
mockApi.onError('get', '/api/v1/associados', 500, 'Erro no servidor')

// Mock de erro de rede
mockApi.onNetworkError('get', '/api/v1/associados')

// Mock de timeout
mockApi.onTimeout('get', '/api/v1/associados')

// Resetar mocks
mockApi.reset()

// Restaurar axios original
mockApi.restore()
```

#### 3. Test Helpers

Helpers gerais para testes.

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

// Criar router mock
const router = createMockRouter()

// Aguardar promessas
await flushPromises()

// Aguardar tempo específico
await wait(100)

// Setup storage mock
const { localStorage, sessionStorage } = setupMockStorage()

// Suprimir console durante testes
const restore = suppressConsole()
// ... testes ...
restore()

// Simular digitação
await typeInInput(input, 'texto')

// Simular submit de formulário
await submitForm(form)
```

#### 4. Store Test Helpers

Helpers específicos para testes de Pinia stores.

```typescript
import {
  setupTestPinia,
  createMockStore,
  waitForStoreAction,
  spyOnStoreAction,
  assertStoreState
} from '@/test/utils/storeTestHelpers'

// Setup Pinia para teste
setupTestPinia()

// Criar store mock
const mockStore = createMockStore('associados', {
  associados: [],
  loading: false
}, {
  fetchAssociados: vi.fn()
})

// Aguardar ação da store
await waitForStoreAction(() => store.fetchAssociados())

// Spy em ação
const spy = spyOnStoreAction(store, 'fetchAssociados')

// Validar estado
assertStoreState(store, {
  loading: false,
  error: null
})
```

### Exemplos de Testes Frontend

#### Teste de Componente

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

    expect(screen.getByDisplayValue(associado.nomeCompleto)).toBeInTheDocument()
    expect(screen.getByDisplayValue(associado.cpf)).toBeInTheDocument()
  })

  it('deve emitir evento submit com dados do formulário', async () => {
    const { emitted } = render(AssociadoForm)

    await fireEvent.update(screen.getByLabelText('Nome'), 'João Silva')
    await fireEvent.click(screen.getByText('Salvar'))

    expect(emitted()).toHaveProperty('submit')
    expect(emitted().submit[0][0]).toMatchObject({
      nomeCompleto: 'João Silva'
    })
  })
})
```

#### Teste de Store

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
    const mockAssociados = [
      createMockAssociado(),
      createMockAssociado()
    ]

    mockApi.onGet('/api/v1/associados').reply(200, mockAssociados)

    await store.fetchAssociados()

    expect(store.associados).toHaveLength(2)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('deve tratar erro ao buscar associados', async () => {
    mockApi.onGet('/api/v1/associados').reply(500)

    await expect(store.fetchAssociados()).rejects.toThrow()
    expect(store.error).toBeTruthy()
  })
})
```

#### Teste de Service

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
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

  afterEach(() => {
    mockApi.restore()
  })

  it('deve listar todas as mensalidades', async () => {
    const mockMensalidades = [
      createMockMensalidade(),
      createMockMensalidade()
    ]

    mockApi.onGet('/api/v1/mensalidades').reply(200, mockMensalidades)

    const resultado = await service.listarTodas()

    expect(resultado).toHaveLength(2)
  })

  it('deve marcar mensalidade como paga', async () => {
    const mensalidadePaga = createMockMensalidade({
      status: 'PAGA',
      metodoPagamento: 'PIX'
    })

    mockApi.onPut('/api/v1/mensalidades/123/pagar')
      .reply(200, mensalidadePaga)

    const resultado = await service.marcarComoPaga('123', 'PIX')

    expect(resultado.status).toBe('PAGA')
    expect(resultado.metodoPagamento).toBe('PIX')
  })
})
```

## Melhores Práticas

### Gerais

1. **AAA Pattern**: Organize testes em Arrange, Act, Assert
2. **Nome Descritivo**: Use nomes que descrevem o comportamento esperado
3. **Um Teste, Uma Responsabilidade**: Cada teste deve validar apenas um comportamento
4. **Isolamento**: Testes não devem depender uns dos outros
5. **Dados Limpos**: Use builders e factories para criar dados de teste
6. **Mocks Apropriados**: Mock apenas dependências externas

### Backend (Java)

1. Use `TestDataBuilder` para criar objetos de teste
2. Prefira `BaseUseCaseTest`, `BaseRepositoryTest`, ou `BaseResourceTest`
3. Use `TestAssertions` para validações fluentes
4. Mock apenas repositórios e serviços externos
5. Teste regras de negócio nos use cases
6. Teste endpoints HTTP nos resources
7. Use H2 para testes de repositório

### Frontend (TypeScript)

1. Use `@testing-library/vue` queries semânticas
2. Teste comportamento do usuário, não implementação
3. Mock APIs com `axios-mock-adapter`
4. Use factories para criar dados mock
5. Setup/teardown adequado em `beforeEach`/`afterEach`
6. Teste componentes isoladamente
7. Teste stores com Pinia real, não mock

## Executando os Testes

### Backend

```bash
# Executar todos os testes
cd durvalcrm-j2ee
mvn test

# Executar teste específico
mvn test -Dtest=AssociadoTest

# Executar com cobertura
mvn test jacoco:report

# Ver relatório de cobertura
open target/site/jacoco/index.html
```

### Frontend

```bash
# Executar todos os testes
cd durvalcrm-frontend
npm run test:run

# Executar em modo watch
npm run test

# Executar teste específico
npm run test -- src/components/common/__tests__/BaseButton.test.ts

# Cobertura de código
npm run test:coverage

# Interface visual
npm run test:ui
```

## Cobertura de Código

### Backend

O projeto usa JaCoCo com as seguintes metas:

- **Mínimo Geral**: 30% linha, 25% branch
- **Pacotes Críticos**: 85% linha (domain.model, application.usecase.impl)

**Exclusões**:
- DTOs
- Mappers (gerados por MapStruct)
- Configurações
- Exception handlers
- Entities (JPA)
- Infrastructure repositories
- Services externos

### Frontend

O projeto usa Vitest com `@vitest/coverage-v8`:

```bash
npm run test:coverage
```

O relatório é gerado em `coverage/index.html`.

## Conclusão

Este framework de testes fornece uma base sólida para garantir a qualidade do código do DurvalCRM. Use os exemplos e utilitários fornecidos como referência para criar novos testes, mantendo sempre o foco em testes claros, confiáveis e manuteníveis.

Para dúvidas ou sugestões de melhorias, consulte a equipe de desenvolvimento ou abra uma issue no repositório do projeto.
