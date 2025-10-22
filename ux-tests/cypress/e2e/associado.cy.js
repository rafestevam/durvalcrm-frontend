/**
 * Teste E2E - Criar Associado
 *
 * Este teste simula o fluxo completo de criação de um novo associado
 * no DurvalCRM através da interface de usuário.
 *
 * Pré-requisitos:
 * - DurvalCRM rodando em http://localhost:9080/crm/
 * - Keycloak configurado e rodando
 * - Usuário com credenciais válidas (padrão: admin/admin)
 *
 * Execução:
 *   npm test                    # Headless
 *   npm run cypress:open        # Modo interativo
 *   npm run test:headed         # Com navegador visível
 */

describe('Gestão de Associados', () => {
  // Carregar dados de teste do arquivo de fixtures
  let associadoData

  before(() => {
    // Carregar dados de teste do arquivo de fixtures
    cy.fixture('associado').then((data) => {
      associadoData = data
    })
  })

  beforeEach(() => {
    // Fazer login antes de cada teste
    cy.login()
  })

  describe('Criar Novo Associado', () => {
    it('deve criar um novo associado com dados completos', () => {
      // Navegar para a página de associados
      cy.navigateToAssociados()

      // Abrir formulário de novo associado
      cy.openNovoAssociadoForm()

      // Preencher formulário com dados de teste
      cy.fillAssociadoForm(associadoData.associadoTeste)

      // Salvar formulário
      cy.submitForm()

      // Aguardar retorno para a lista de associados
      cy.url({ timeout: 10000 }).should('include', '/associados')
      cy.wait(2000)

      // Verificar que o associado aparece na lista
      cy.contains(associadoData.associadoTeste.nomeCompleto, { timeout: 5000 })
        .should('be.visible')

      cy.log('✅ Associado criado com sucesso!')
    })

    it('deve criar um associado com dados mínimos', () => {
      cy.navigateToAssociados()

      // Criar um associado com dados mínimos primeiro
      cy.openNovoAssociadoForm()
      cy.fillAssociadoForm({
        nomeCompleto: 'Maria Oliveira Teste Minimo',
        cpf: '987.654.321-00',
        email: 'maria.minimo@teste.com'
      })
      cy.submitForm()

      // Aguardar retorno para a lista de associados
      cy.url({ timeout: 10000 }).should('include', '/associados')
      cy.wait(2000)

      // Verificar que o associado aparece na lista (sem usar busca)
      cy.contains('Maria Oliveira Teste Minimo', { timeout: 5000 })
        .should('be.visible')

      cy.log('✅ Associado com dados mínimos criado com sucesso!')
    })

    it('deve validar campos obrigatórios', () => {
      cy.navigateToAssociados()
      cy.openNovoAssociadoForm()

      // Tentar salvar formulário vazio
      cy.submitForm()

      // Verificar mensagens de validação
      // (Ajuste os seletores conforme sua implementação)
      cy.get('input:invalid, .error, .is-invalid').should('exist')

      cy.log('✅ Validação de campos obrigatórios funcionando')
    })

    it('deve validar formato de CPF', () => {
      cy.navigateToAssociados()
      cy.openNovoAssociadoForm()

      // Preencher com CPF inválido
      cy.fillAssociadoForm({
        nomeCompleto: 'Teste CPF Inválido',
        cpf: '111.111.111-11', // CPF inválido
        email: 'teste@teste.com'
      })

      cy.submitForm()

      // Verificar mensagem de erro de validação
      // (Ajuste conforme sua implementação)
      cy.contains(/cpf.*inválido|formato.*incorreto/i, { timeout: 5000 })
        .should('exist')

      cy.log('✅ Validação de CPF funcionando')
    })

    it('deve validar formato de email', () => {
      cy.navigateToAssociados()
      cy.openNovoAssociadoForm()

      // Aguardar modal estar visível
      cy.wait(1500)

      // Preencher com email inválido
      cy.get('input[name="nomeCompleto"]').last()
        .type('Teste Email Inválido', { force: true })

      cy.get('input[name="cpf"]').last()
        .type('123.456.789-00', { force: true })

      cy.get('input[name="email"]').last()
        .type('email-invalido', { force: true })

      cy.submitForm()

      // Verificar validação de email
      cy.get('input[type="email"]:invalid').should('exist')

      cy.log('✅ Validação de email funcionando')
    })

    it('deve cancelar a criação de associado', () => {
      cy.navigateToAssociados()
      cy.openNovoAssociadoForm()

      // Aguardar modal estar visível
      cy.wait(1500)

      // Preencher alguns dados
      cy.get('input[name="nomeCompleto"]').last()
        .type('Teste Cancelamento', { force: true })

      // Procurar e clicar no botão "Cancelar"
      cy.get('button')
        .contains(/Cancelar|Fechar/i)
        .click({ force: true })

      // Aguardar modal fechar
      cy.wait(1000)

      // Verificar que o modal fechou
      cy.url().should('include', '/associados')

      // Verificar que o associado não foi criado
      cy.contains('Teste Cancelamento').should('not.exist')

      cy.log('✅ Cancelamento funcionando corretamente')
    })
  })

  describe('Visualizar Associados', () => {
    it('deve listar associados existentes', () => {
      cy.navigateToAssociados()

      // Verificar que a página de associados está carregada
      cy.contains('Gestão de Associados', { timeout: 10000 })
        .should('be.visible')

      // Verificar que o botão de adicionar está visível (indica que a página carregou)
      cy.contains('button', /Novo|Adicionar/i)
        .should('be.visible')

      cy.log('✅ Lista de associados carregada')
    })

    it('deve buscar associado por nome', () => {
      cy.navigateToAssociados()

      // Criar um associado primeiro para garantir que existe
      cy.openNovoAssociadoForm()
      cy.fillAssociadoForm({
        nomeCompleto: 'Teste Busca Cypress',
        cpf: '555.666.777-88',
        email: 'busca@teste.com'
      })
      cy.submitForm()

      // Aguardar retorno para a lista de associados
      cy.url({ timeout: 10000 }).should('include', '/associados')
      cy.wait(3000)

      // Buscar pelo associado criado (fora do modal)
      cy.get('input[type="search"], input[placeholder*="buscar" i], input[placeholder*="pesquisar" i]')
        .first()
        .should('be.visible')
        .clear({ force: true })
        .type('Teste Busca Cypress', { force: true })

      // Aguardar um pouco para a busca processar
      cy.wait(1000)

      // Verificar que o associado aparece nos resultados
      cy.contains('Teste Busca Cypress', { timeout: 5000 })
        .should('be.visible')

      cy.log('✅ Busca funcionando corretamente')
    })
  })

  describe('Editar Associado', () => {
    it('deve editar dados de um associado existente', () => {
      cy.navigateToAssociados()

      const nomeOriginal = 'Associado Para Editar Teste'

      // Criar um associado primeiro
      cy.openNovoAssociadoForm()
      cy.fillAssociadoForm({
        nomeCompleto: nomeOriginal,
        cpf: '999.888.777-66',
        email: 'editar@teste.com'
      })
      cy.submitForm()

      // Aguardar retorno para a lista de associados
      cy.url({ timeout: 10000 }).should('include', '/associados')
      cy.wait(2000)

      // Procurar o associado e clicar em editar (sem usar busca)
      cy.contains(nomeOriginal, { timeout: 5000 }).should('be.visible')

      // Clicar no botão de editar (ajuste o seletor conforme sua implementação)
      cy.contains(nomeOriginal)
        .parents('tr, .card, .list-item, div')
        .first()
        .find('button')
        .contains(/Editar/i)
        .click({ force: true })

      // Aguardar modal de edição abrir
      cy.wait(2000)

      // Modificar o nome
      const novoNome = 'Associado Editado Cypress'
      cy.get('input[name="nomeCompleto"]').last()
        .clear({ force: true })
        .type(novoNome, { force: true })

      // Salvar alterações
      cy.submitForm()
      cy.wait(2000)

      // Verificar que o novo nome aparece na lista (sem usar busca)
      cy.contains(novoNome, { timeout: 5000 })
        .should('be.visible')

      cy.log('✅ Edição funcionando corretamente')
    })
  })

  describe('Excluir Associado', () => {
    it('deve excluir um associado', () => {
      cy.navigateToAssociados()

      const nomeParaExcluir = 'Associado Para Excluir Teste'

      // Criar um associado primeiro
      cy.openNovoAssociadoForm()
      cy.fillAssociadoForm({
        nomeCompleto: nomeParaExcluir,
        cpf: '777.666.555-44',
        email: 'excluir@teste.com'
      })
      cy.submitForm()

      // Aguardar retorno para a lista de associados
      cy.url({ timeout: 10000 }).should('include', '/associados')
      cy.wait(2000)

      // Procurar o associado e clicar em excluir (sem usar busca)
      cy.contains(nomeParaExcluir, { timeout: 5000 }).should('be.visible')

      cy.contains(nomeParaExcluir)
        .parents('tr, .card, .list-item, div')
        .first()
        .find('button')
        .contains(/Excluir/i)
        .click({ force: true })

      // Confirmar exclusão (se houver modal de confirmação)
      cy.contains('button', /Confirmar|Sim|Excluir/i, { timeout: 5000 })
        .click({ force: true })

      // Verificar que o associado foi removido
      cy.wait(2000)
      cy.contains(nomeParaExcluir).should('not.exist')

      cy.log('✅ Exclusão funcionando corretamente')
    })
  })
})
