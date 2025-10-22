# DurvalCRM - Testes E2E com Cypress

Testes end-to-end (E2E) automatizados de interface de usuário para validar fluxos críticos do DurvalCRM usando Cypress.

## 🎯 Sobre

Este projeto contém testes automatizados que simulam interações reais de usuários com a interface do DurvalCRM, garantindo que funcionalidades críticas como criação, edição e exclusão de associados funcionem corretamente.

## 📋 Pré-requisitos

- **Node.js** 18+ instalado
- **DurvalCRM** rodando em ambiente de desenvolvimento (`http://localhost:9080/crm/`)
- **Keycloak** configurado e acessível
- Usuário com credenciais válidas (padrão: tesouraria / cairbar@2025)

## 🚀 Instalação

1. Navegue até o diretório de testes:

```bash
cd ux-tests
```

2. Instale as dependências:

```bash
npm install
```

Isso instalará o Cypress e todas as dependências necessárias.

## 📁 Estrutura do Projeto

```
ux-tests/
├── cypress/
│   ├── e2e/                      # Testes E2E
│   │   └── associado.cy.js       # Testes de associados (CRUD completo)
│   ├── fixtures/                 # Dados de teste
│   │   └── associado.json        # Dados de associados para testes
│   ├── support/                  # Comandos e configurações globais
│   │   ├── commands.js           # Comandos customizados (login, fillForm, etc)
│   │   └── e2e.js                # Setup global dos testes
│   ├── screenshots/              # Screenshots de falhas (auto-gerado)
│   └── videos/                   # Vídeos das execuções (auto-gerado)
├── cypress.config.js             # Configuração do Cypress
├── package.json                  # Dependências e scripts
└── README.md                     # Este arquivo
```

## 🧪 Executando os Testes

### Modo Interativo (Recomendado para Desenvolvimento)

Abre a interface gráfica do Cypress onde você pode selecionar e executar testes individualmente:

```bash
npm run cypress:open
```

### Modo Headless (CI/CD)

Executa todos os testes sem interface gráfica:

```bash
npm test
```

ou

```bash
npm run cypress:run
```

### Modo Headed (Navegador Visível)

Executa os testes com o navegador visível, útil para debug:

```bash
npm run test:headed
```

### Executar em Navegadores Específicos

```bash
# Chrome
npm run test:chrome

# Firefox
npm run test:firefox

# Edge
npm run test:edge
```

## 🔧 Configuração

### Variáveis de Ambiente

Você pode customizar o comportamento dos testes usando variáveis de ambiente:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `CYPRESS_BASE_URL` | URL base da aplicação | `http://localhost:9080/crm` |
| `KEYCLOAK_USERNAME` | Usuário para login | `tesouraria` |
| `KEYCLOAK_PASSWORD` | Senha para login | `cairbar@2025` |

**Exemplo:**

```bash
CYPRESS_BASE_URL=http://localhost:8080/crm \
KEYCLOAK_USERNAME=admin \
KEYCLOAK_PASSWORD=admin123 \
npm test
```

### Arquivo .env (Opcional)

Crie um arquivo `.env` na raiz do projeto `ux-tests`:

```bash
# .env
CYPRESS_BASE_URL=http://localhost:9080/crm
KEYCLOAK_USERNAME=tesouraria
KEYCLOAK_PASSWORD=cairbar@2025
```

Depois, use `dotenv` para carregar as variáveis:

```bash
npm install dotenv
node -r dotenv/config node_modules/.bin/cypress run
```

## 📝 Testes Disponíveis

### Gestão de Associados (`associado.cy.js`)

Este arquivo contém testes completos para o módulo de associados:

#### 1. **Criar Novo Associado**
- ✅ Criar associado com dados completos
- ✅ Criar associado com dados mínimos
- ✅ Validar campos obrigatórios
- ✅ Validar formato de CPF
- ✅ Validar formato de email
- ✅ Cancelar criação de associado

#### 2. **Visualizar Associados**
- ✅ Listar associados existentes
- ✅ Buscar associado por nome

#### 3. **Editar Associado**
- ✅ Editar dados de associado existente

#### 4. **Excluir Associado**
- ✅ Excluir associado com confirmação

### Executar Teste Específico

```bash
# Modo interativo - selecione o teste na UI
npm run cypress:open

# Modo headless - especifique o arquivo
npx cypress run --spec "cypress/e2e/associado.cy.js"
```

## 🛠️ Comandos Customizados

O Cypress foi estendido com comandos customizados para facilitar os testes:

### `cy.login(username, password)`

Faz login no sistema via Keycloak:

```javascript
cy.login() // Usa credenciais padrão
cy.login('tesouraria', 'cairbar@2025') // Credenciais customizadas
```

### `cy.navigateToAssociados()`

Navega para a página de associados:

```javascript
cy.navigateToAssociados()
```

### `cy.openNovoAssociadoForm()`

Abre o formulário de novo associado:

```javascript
cy.openNovoAssociadoForm()
```

### `cy.fillAssociadoForm(associado)`

Preenche o formulário de associado:

```javascript
cy.fillAssociadoForm({
  nomeCompleto: 'João Silva',
  cpf: '123.456.789-00',
  email: 'joao@example.com',
  telefone: '(11) 98765-4321',
  endereco: 'Rua Teste, 123',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01234-567'
})
```

### `cy.submitForm()`

Submete o formulário atual:

```javascript
cy.submitForm()
```

## 🎬 Vídeos e Screenshots

### Screenshots

Quando um teste falha, o Cypress automaticamente tira um screenshot e salva em:

```
cypress/screenshots/
```

### Vídeos

Quando executando em modo headless, o Cypress grava vídeos de todos os testes em:

```
cypress/videos/
```

Para desabilitar vídeos (economizar espaço):

```javascript
// cypress.config.js
video: false
```

## 🐛 Debug e Solução de Problemas

### 1. Teste Falha no Login

**Erro:** `Timed out retrying: Expected to find element: button, but never found it`

**Solução:**
- Verifique se o DurvalCRM está rodando em `http://localhost:9080/crm/`
- Verifique se o Keycloak está acessível
- Confirme que as credenciais estão corretas (tesouraria / cairbar@2025)

```bash
# Teste manual
curl http://localhost:9080/crm/
```

### 2. Elemento Não Encontrado

**Erro:** `Timed out retrying: Expected to find element...`

**Solução:**
- Verifique se os seletores CSS/XPath no teste estão corretos
- Aumente o timeout se a página carregar lentamente
- Use o modo interativo para inspecionar a página

### 3. Timeouts

**Erro:** `Timed out after 10000ms`

**Solução:**

Ajuste os timeouts na configuração:

```javascript
// cypress.config.js
defaultCommandTimeout: 15000, // Aumentar para 15s
pageLoadTimeout: 60000        // Aumentar para 60s
```

### 4. Navegador Não Inicia

**Solução:**

```bash
# Limpar cache do Cypress
npx cypress cache clear

# Reinstalar Cypress
npm uninstall cypress
npm install cypress --save-dev
```

### 5. Modo Incógnito Não Funciona

O Cypress está configurado para sempre usar modo incógnito (janela anônima) para garantir sessões limpas. Isso está configurado em `cypress.config.js`:

```javascript
on('before:browser:launch', (browser, launchOptions) => {
  if (browser.family === 'chromium') {
    launchOptions.args.push('--incognito')
  }
  if (browser.family === 'firefox') {
    launchOptions.args.push('-private')
  }
  return launchOptions
})
```

## 📊 Relatórios

### Mochawesome (Opcional)

Para gerar relatórios HTML bonitos:

```bash
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator

# Executar testes com reporter
npx cypress run --reporter mochawesome
```

## 🔄 Integração Contínua (CI/CD)

### GitHub Actions

Exemplo de workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          working-directory: ux-tests
          start: npm run dev
          wait-on: 'http://localhost:9080/crm'
```

## ✍️ Escrevendo Novos Testes

Para adicionar novos testes:

1. Crie um arquivo `.cy.js` em `cypress/e2e/`:

```javascript
describe('Meu Novo Teste', () => {
  beforeEach(() => {
    cy.login()
  })

  it('deve fazer algo específico', () => {
    // Seu teste aqui
    cy.visit('/minha-rota')
    cy.get('#meu-elemento').should('be.visible')
  })
})
```

2. Execute o teste:

```bash
npm run cypress:open
# Selecione seu novo arquivo na UI
```

## 📚 Recursos e Documentação

- [Documentação Oficial do Cypress](https://docs.cypress.io/)
- [Melhores Práticas Cypress](https://docs.cypress.io/guides/references/best-practices)
- [API de Comandos Cypress](https://docs.cypress.io/api/table-of-contents)
- [Seletores CSS](https://www.w3schools.com/cssref/css_selectors.asp)

## 🤝 Boas Práticas

1. ✅ **Execute testes localmente** antes de fazer commit
2. ✅ **Use dados de teste** que não conflitem com dados reais
3. ✅ **Limpe dados criados** após os testes (use hooks `after` ou `afterEach`)
4. ✅ **Não use sleeps fixos** - prefira `cy.wait()` em requests ou `should()` para aguardar elementos
5. ✅ **Mantenha testes independentes** - cada teste deve funcionar sozinho
6. ✅ **Use comandos customizados** para evitar duplicação de código

## 🎯 Próximos Passos

- [ ] Adicionar testes para Mensalidades
- [ ] Adicionar testes para Doações
- [ ] Adicionar testes para Vendas
- [ ] Adicionar testes de dashboard
- [ ] Adicionar testes de relatórios
- [ ] Configurar testes visual regression (Percy/Applitools)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a seção "Debug e Solução de Problemas"
2. Consulte a documentação do Cypress
3. Abra uma issue no repositório do projeto

---

**Versão:** 1.0.0
**Última atualização:** Outubro 2025
**Autor:** DurvalCRM Team
