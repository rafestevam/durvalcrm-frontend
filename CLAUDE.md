# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DurvalCRM is a membership management system for associations, managing members (associados), monthly payments (mensalidades), donations (doações), and sales (vendas).

Act as an expert fullstack developer.

**Project Structure:**
- **Root directory**: Contains this CLAUDE.md and project documentation
- **durvalcrm-j2ee/**: Backend Jakarta EE application (primary working directory for backend tasks)
- **durvalcrm-frontend/**: Vue 3 frontend application
- **durvalcrm-deployment/**: Deployment configurations and infrastructure
- **durvalcrm-keycloak-theme/**: Custom Keycloak theme

## Tech Stack

### Backend (durvalcrm-j2ee/)
- **Framework**: Jakarta EE 10 (J2EE) for WildFly 37
- **Java**: 17
- **Database**: PostgreSQL 12+
- **Persistence**: JPA 2.2 with Hibernate 6.2
- **REST**: JAX-RS 2.1
- **Mapping**: MapStruct 1.6
- **Build**: Maven
- **Note**: Originally built with Quarkus, converted to J2EE for WildFly deployment

### Frontend (durvalcrm-frontend/)
- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Authentication**: Keycloak JS adapter
- **HTTP Client**: Axios

### Infrastructure
- **App Server**: WildFly 37
- **Deployment**: Podman Compose for local dev, shell scripts + Maven profiles for staging/production
- **Environments**: Development (local), Staging (Vagrant VM), Production (cloud VPS)

## Essential Commands

### Backend (durvalcrm-j2ee/)
```bash
# Build WAR package
mvn clean package

# Run unit tests
mvn test

# Run specific test
mvn test -Dtest=TestClassName

# Run specific test method
mvn test -Dtest=TestClassName#methodName

# Deploy to WildFly (requires server running)
mvn wildfly:deploy

# Build & deploy to staging
mvn clean package deploy -Pstaging

# Build & deploy to production
mvn clean package wildfly:deploy -Pproduction

# Generate test coverage report (output: target/site/jacoco/index.html)
mvn test jacoco:report

# Skip tests during build
mvn clean package -DskipTests
```

### Frontend (durvalcrm-frontend/)
```bash
# Development server
npm run dev

# Development server for staging
npm run dev:staging

# Type checking
npm run type-check

# Linting
npm run lint

# Production build (for nginx)
npm run build:nginx

# Production build (for WildFly)
npm run build:wildfly

# Run tests (all)
npm run test:run

# Run specific test file
npm run test -- src/components/common/__tests__/BaseButton.test.ts

# Run tests in watch mode
npm run test

# Test coverage
npm run test:coverage

# Test with interactive UI
npm run test:ui
```

### Full Stack Local Development
```bash
# Start PostgreSQL + Keycloak
podman-compose up -d

# Backend dev mode (separate terminal)
cd durvalcrm-j2ee && mvn wildfly:deploy

# Frontend dev mode (separate terminal)
cd durvalcrm-frontend && npm run dev
```

## Architecture

### Backend - Clean Architecture/DDD

```
br.org.cecairbar.durvalcrm/
├── domain/                    # Core business entities and repository interfaces
│   ├── model/                 # Entities: Associado, Mensalidade, Doacao, Venda
│   └── repository/            # Repository interfaces
├── application/               # Application logic layer
│   ├── usecase/               # Use case implementations (business operations)
│   │   ├── impl/              # Use case interface implementations
│   │   ├── mensalidade/       # Monthly payment use cases
│   │   ├── venda/             # Sales use cases
│   │   ├── dashboard/         # Dashboard use cases
│   │   └── doacao/            # Donation use cases (in application/doacao/)
│   ├── dto/                   # Data Transfer Objects
│   ├── mapper/                # MapStruct mappers for DTO↔Entity conversion
│   └── service/               # Application services (PIX, email, etc)
└── infrastructure/            # External concerns
    ├── web/resource/          # JAX-RS REST endpoints (@Path)
    ├── persistence/           # JPA entities & repository implementations
    │   ├── entity/            # JPA entity classes
    │   └── repository/        # JPA repository implementations
    └── scheduler/             # EJB @Schedule jobs for monthly billing
```

**Key Patterns:**
- Repository pattern with JPA EntityManager (converted from Quarkus Panache)
- MapStruct for DTO mapping (configured with CDI component model)
- CDI for dependency injection
- **No authentication/authorization** - all endpoints are open (security removed as requested)
- REST endpoints follow pattern: `/durvalcrm/api/v1/{resource}`

**Important Notes:**
- Uses `jakarta.*` imports (not `javax.*`) for Jakarta EE 10
- DataSource JNDI: `java:jboss/datasources/DurvalCRMDS`
- WAR packaging with context root `/durvalcrm`
- Persistence unit: `durvalcrm-pu` (configured in persistence.xml)

### Frontend - Vue 3 Composition API

```
src/
├── components/              # Reusable components
│   ├── common/              # Base UI primitives
│   │   ├── BaseButton       # Button with variants (primary, secondary, success, danger)
│   │   ├── BaseInput        # Input with validation and mask support
│   │   ├── BaseModal        # Modal dialog with overlay
│   │   ├── AlertMessage     # Alert notifications
│   │   ├── LoadingSpinner   # Loading indicator
│   │   └── NotificationTray # Toast notification system
│   ├── layout/              # Layout structure
│   │   ├── AppLayout        # Main layout wrapper
│   │   ├── AppHeader        # Header with user menu
│   │   └── AppNavigation    # Sidebar navigation
│   ├── associados/          # Members feature components
│   ├── mensalidades/        # Monthly payments components
│   ├── doacoes/             # Donations components
│   └── charts/              # Chart.js wrapper components
├── views/                   # Page-level route components
├── stores/                  # Pinia state management
│   ├── auth.ts              # Authentication state & session management
│   ├── associados.ts        # Members state
│   ├── mensalidades.ts      # Monthly payments state
│   ├── vendas.ts            # Sales state
│   └── doacoes.ts           # Donations state
├── services/                # API communication layer
│   ├── api.ts               # Axios instance with interceptors (token injection, error handling)
│   ├── auth.ts              # OAuth2 PKCE flow, token refresh, session validation
│   ├── associados.ts        # Members API calls
│   ├── mensalidade.ts       # Monthly payments API calls
│   ├── vendas.ts            # Sales API calls
│   └── doacaoService.ts     # Donations API calls
├── router/                  # Vue Router with auth guards
│   └── index.ts             # Route definitions & navigation guards
├── composables/             # Reusable composition functions
│   └── useNotification.ts   # Toast notification composable
├── utils/                   # Utility functions
│   ├── constants.ts         # App constants (routes, API config)
│   ├── formatters.ts        # Data formatting (CPF, phone, currency)
│   ├── validators.ts        # Input validation (CPF, email)
│   └── dateUtils.ts         # Date manipulation helpers
├── types/                   # TypeScript type definitions
└── test/                    # Test configuration
    └── setup.ts             # Vitest setup file
```

**Key Patterns:**
- **Composition API**: All components use `<script setup>` syntax
- **Service Layer**: Centralized API client in `services/api.ts` with automatic token injection and 401 retry logic
- **State Management**: Pinia stores for global state (auth, entities)
- **Authentication**: Custom OAuth2/OIDC PKCE implementation in `services/auth.ts`
  - State-based CSRF protection with sessionStorage
  - Code verifier/challenge generation for PKCE
  - Automatic token refresh on 401 errors via axios interceptor
  - Session validation with fallback to local storage
- **Route Guards**: `router/index.ts` validates authentication before protected routes
- **Composables**: Reusable logic extracted to composables (e.g., `useNotification`)
- **Type Safety**: Full TypeScript coverage with interfaces in `types/` and `services/types.ts`
- **Styling**: Tailwind CSS utility classes throughout

**Environment Configuration:**
- **Build Modes**: `development`, `staging`, `production` (configured via `.env.*` files)
- **Deployment Targets**:
  - NGINX: `npm run build:nginx` → base path `/crm/`
  - WildFly: `npm run build:wildfly` → base path `/durvalcrm-frontend/`
- **Development Proxy**: Vite proxies `/api` to local NGINX (port 9080) or staging server
- **Environment Variables**:
  - `VITE_API_BASE_URL`: API base URL (default: `/api`)
  - `VITE_APP_BASE_URL`: Application base path (default: `/crm`)
  - `VITE_KEYCLOAK_URL`: Keycloak server URL
  - `VITE_KEYCLOAK_REALM`: Keycloak realm name
  - `VITE_KEYCLOAK_CLIENT_ID`: OAuth2 client ID

**Authentication Flow:**
1. User clicks "Entrar" → `authService.redirectToLogin()` (auth.ts:113)
2. Generate OAuth2 state + PKCE code verifier/challenge
3. Save state, redirect_uri, client_id, code_verifier to sessionStorage
4. Redirect to Keycloak authorization endpoint with PKCE params
5. User authenticates in Keycloak
6. Keycloak redirects to `/auth/callback` with authorization code + state
7. `authService.handleCallback()` (auth.ts:166) validates state (CSRF check)
8. Exchange code for tokens using PKCE code verifier via `/api/auth/callback`
9. Store access_token, refresh_token, token_expires_at in localStorage
10. Fetch user info from `/api/auth/user-info` and store in Pinia + localStorage
11. Redirect to dashboard

**Token Refresh Strategy:**
- Axios response interceptor (api.ts:73) catches 401 errors
- Attempts refresh via `authService.refreshToken()` (auth.ts:50)
- On success: retries original request with new token
- On failure: clears auth state and redirects to login

**Session Validation:**
- Route guard calls `authStore.validateSession()` (stores/auth.ts:62) before protected routes
- Checks localStorage for token, validates expiry
- If expiring soon (< 30 seconds), proactively logs out
- Otherwise validates with backend `/api/auth/validate`
- Falls back to local validation on network errors if token not expired

## Key Business Logic

1. **Monthly Payment Generation**: EJB scheduled job (`@Schedule`) runs monthly to create R$10.90 charges for all active members
2. **Payment Status Transitions**: PENDENTE → VENCIDA automatically after due date
3. **Member Management**: Soft delete pattern (marks as inactive rather than hard delete)
4. **PIX Integration**: QR code generation for payments (currently mock implementation)
5. **Donations**: Recorded separately from monthly payments (mensalidade_id can be null)
6. **Sales**: Track cantina, bazar, and book sales

## Database Schema

**Key Tables:**
- `associados`: Member information (nome_completo, cpf, email, telefone, ativo)
- `mensalidades`: Monthly payment records with status tracking
- `doacoes`: Donation records
- `vendas`: Sales records (cantina, bazaar, books)

**Important Constraints:**
- UNIQUE constraint on `mensalidades`: (associado_id, mes_referencia, ano_referencia)
- CPF validation enforced

## Deployment

### Environments
- **Development**: Local with podman-compose
- **Staging**: Vagrant VM (localhost:9443) - uses SSH tunnel for deployment
- **Production**: Cloud VPS (cecairbar.org.br, durvalcrm.org)

### Build Profiles
Maven profiles control deployment configuration:
- `development` (default): localhost:9991
- `staging`: SSH-based deployment to Vagrant VM
- `production`: Remote deployment to production server

### Deployment Scripts
Located in `durvalcrm-j2ee/` root:
- `build.sh`: Maven build automation with validation and reporting
  - Usage: `./build.sh [--profile=prod] [--skip-tests] [--clean-only]`
- `deploy.sh`: WildFly deployment with database configuration
  - Usage: `./deploy.sh [--wildfly-host=HOST] [--db-host=HOST] [--no-build]`
- `pipeline.sh`: Complete CI/CD pipeline (build → test → deploy → verify)
  - Usage: `./pipeline.sh --env=production --server=IP`
- `dev-tools.sh`: Development utilities (quick-build, wildfly-status, db-status, api-test, etc)
  - Usage: `./dev-tools.sh [command]` (run without args to see available commands)
- `setup-database.sh`: Database initialization script
- `deploy-staging.sh`: Staging-specific deployment via SSH
- `deploy-production.sh`: Production-specific deployment

See `durvalcrm-j2ee/BUILD-DEPLOY-GUIDE.md` for comprehensive deployment documentation.

## API Endpoints

Base URL pattern: `https://[domain]/durvalcrm/api/v1/`

**No authentication required** for any endpoint.

- `GET /associados` - List members with pagination and search
- `POST /associados` - Create new member
- `PUT /associados/{id}` - Update member
- `DELETE /associados/{id}` - Soft delete member (sets ativo=false)
- `GET /mensalidades` - List monthly payments with filters
- `POST /mensalidades/gerar` - Generate monthly charges
- `GET /doacoes` - List donations
- `POST /doacoes` - Register donation
- `GET /vendas` - List sales
- `POST /vendas` - Register sale
- `GET /dashboard` - Dashboard metrics
- `GET /health` - Health check

## Testing

DurvalCRM implements a comprehensive unit testing framework for both backend and frontend. See **[TESTING-GUIDE.md](TESTING-GUIDE.md)** for complete documentation.

### Backend Testing Framework
- **Framework**: JUnit 4.13.2 for unit tests
- **Mocking**: Mockito 5.4 for dependency mocking
- **Coverage**: JaCoCo (minimum: 30% line, 25% branch)
- **Test DB**: H2 in-memory database (configured in src/test/resources/META-INF/persistence.xml)
- **Coverage report**: `mvn test jacoco:report` generates report at `target/site/jacoco/index.html`
- **Coverage excludes**: DTOs, MapStruct generated mappers (*Impl.class), JPA entities, infrastructure repositories, services, schedulers
- **High coverage targets**: Domain models (85% line), Use case implementations (85% line)

**Test Utilities** (durvalcrm-j2ee/src/test/java/.../test/):
- **TestDataBuilder**: Fluent builders for creating test data (Associado, Mensalidade, Doacao, Venda)
  ```java
  Associado associado = umAssociado()
      .comNome("João Silva")
      .comCpf("123.456.789-00")
      .ativo()
      .build();
  ```
- **MockFactory**: Factory for creating repository mocks
- **TestAssertions**: Fluent assertions for domain entities
  ```java
  assertAssociado(associado)
      .hasNome("João Silva")
      .hasCpf("123.456.789-00")
      .isAtivo();
  ```
- **Base Test Classes**:
  - `BaseUseCaseTest` - For testing use cases with business logic
  - `BaseRepositoryTest` - For testing repositories with H2 database
  - `BaseResourceTest` - For testing REST endpoints

**Example Tests** (durvalcrm-j2ee/src/test/java/.../examples/):
- `MensalidadeUseCaseExampleTest.java` - Complete use case test
- `VendaResourceExampleTest.java` - Complete REST resource test

### Frontend Testing Framework
- **Framework**: Vitest 3.2+ (configured in vite.config.ts)
- **Component testing**: @testing-library/vue 8.1
- **API mocking**: axios-mock-adapter 2.1
- **DOM simulation**: happy-dom 18.0 (default, jsdom available as fallback)
- **Test setup**: `src/test/setup.ts` configures global test environment
- **Commands**:
  - `npm run test:run` - Single test run (CI mode)
  - `npm run test` - Watch mode for development
  - `npm run test:coverage` - Generate coverage report
  - `npm run test:ui` - Interactive test UI
  - `npm run test -- path/to/test.ts` - Run specific test file
- **Test Location**: Tests colocated in `__tests__/` directories next to source files

**Test Utilities** (durvalcrm-frontend/src/test/utils/):
- **mockFactories.ts**: Factories for creating mock data
  ```typescript
  const associado = createMockAssociado({ nomeCompleto: 'João Silva' })
  const mensalidades = createMockArray((i) => createMockMensalidade(), 10)
  ```
- **apiMockHelpers.ts**: Helpers for mocking API calls
  ```typescript
  const mockApi = createMockApiHelper(axios)
  mockApi.onGet('/api/v1/associados', mockData, 200)
  mockApi.onError('post', '/api/v1/associados', 400, 'Validation error')
  ```
- **testHelpers.ts**: General utilities (router, storage, async helpers)
- **storeTestHelpers.ts**: Pinia store testing utilities
  ```typescript
  setupTestPinia()
  await waitForStoreAction(() => store.fetchAssociados())
  assertStoreState(store, { loading: false, error: null })
  ```

**Example Tests** (durvalcrm-frontend/src/):
- `components/associados/__tests__/AssociadoForm.example.test.ts` - Component test
- `stores/__tests__/associados.example.test.ts` - Store test
- `services/__tests__/mensalidade.example.test.ts` - Service test

### Testing Best Practices
1. **AAA Pattern**: Arrange, Act, Assert structure
2. **Descriptive Names**: Tests describe expected behavior
3. **Isolation**: Tests don't depend on each other
4. **Use Builders**: TestDataBuilder and mock factories
5. **Mock Appropriately**: Only mock external dependencies
6. **Test Behavior**: Not implementation details

## Development Workflow

1. **Backend Changes**: Edit Java code → `mvn clean package` → `mvn wildfly:deploy`
2. **Frontend Changes**: Edit Vue files → Hot reload automatic with `npm run dev`
3. **API Contract Changes**: Update DTOs → Update services → Update components
4. **Database Changes**: Update JPA entities → Update domain models → Run tests
5. **Commit**: Ensure tests pass before committing

## Important Notes

### General
- All dates use ISO format (YYYY-MM-DD)
- CPF validation is enforced on the backend

### Backend
- **No authentication/authorization** - all backend endpoints are public (security layer removed as requested)
- MapStruct mappers must be ordered: Lombok → Lombok-MapStruct binding → MapStruct processor
- WildFly requires PostgreSQL JDBC driver installed as module
- Uses `jakarta.*` imports (not `javax.*`) for Jakarta EE 10

### Frontend
- **Authentication required** - Frontend implements full OAuth2/OIDC PKCE flow with Keycloak
- Backend endpoints are open, but frontend enforces auth at route level
- Two deployment modes:
  - **NGINX**: `npm run build:nginx` → static files with base path `/crm/`
  - **WildFly**: `npm run build:wildfly` → static files with base path `/durvalcrm-frontend/`
- API calls automatically include JWT token via axios interceptor
- Token refresh happens automatically on 401 responses
- Session state stored in localStorage (tokens, user info) and sessionStorage (OAuth state)
- Route guards in `router/index.ts` protect authenticated routes
- Constants centralized in `src/utils/constants.ts` (routes, API config, app settings)
