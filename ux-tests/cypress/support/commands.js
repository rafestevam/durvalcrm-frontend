// ***********************************************
// Este arquivo é onde você pode criar comandos customizados
// e sobrescrever comandos existentes.
//
// Leia mais sobre comandos customizados aqui:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Comando customizado para fazer login no DurvalCRM via Keycloak
 *
 * @example
 * cy.login()
 * cy.login('customUser', 'customPassword')
 */
Cypress.Commands.add('login', (username, password) => {
  const user = username || Cypress.env('keycloakUsername')
  const pass = password || Cypress.env('keycloakPassword')

  cy.log('🔐 Iniciando login no DurvalCRM')

  // Visitar a página inicial
  cy.visit('/')

  // Clicar no botão "Entrar com Keycloak"
  cy.contains('button', 'Entrar com Keycloak', { timeout: 10000 })
    .should('be.visible')
    .click()

  // Aguardar redirecionamento para Keycloak
  cy.url({ timeout: 10000 }).should('include', '/realms/')

  // Preencher credenciais
  cy.get('#username', { timeout: 10000 })
    .should('be.visible')
    .type(user)

  cy.get('#password')
    .should('be.visible')
    .type(pass)

  // Submeter formulário
  cy.get('input[type="submit"]')
    .should('be.visible')
    .click()

  // Aguardar redirecionamento de volta para a aplicação
  cy.url({ timeout: 15000 }).should('include', '/crm/')

  // Verificar que está logado (dashboard carregado)
  cy.url().should('match', /\/(painel|dashboard)/)

  cy.log('✅ Login realizado com sucesso')
})

/**
 * Comando customizado para navegar para a página de associados
 *
 * @example
 * cy.navigateToAssociados()
 */
Cypress.Commands.add('navigateToAssociados', () => {
  cy.log('📍 Navegando para Associados')

  // Clicar no menu "Associados"
  cy.contains('a', 'Associados', { timeout: 10000 })
    .should('be.visible')
    .click()

  // Aguardar carregamento da lista
  cy.url({ timeout: 10000 }).should('include', '/associados')

  cy.log('✅ Página de Associados carregada')
})

/**
 * Comando customizado para abrir o formulário de novo associado
 *
 * @example
 * cy.openNovoAssociadoForm()
 */
Cypress.Commands.add('openNovoAssociadoForm', () => {
  cy.log('📝 Abrindo formulário de novo associado')

  // Clicar no botão "Novo" ou "Adicionar"
  cy.contains('button', /Novo|Adicionar/i, { timeout: 10000 })
    .should('be.visible')
    .click()

  // Aguardar modal ou formulário aparecer
  cy.wait(1000)

  cy.log('✅ Formulário aberto')
})

/**
 * Comando customizado para preencher formulário de associado
 *
 * @param {Object} associado - Dados do associado
 * @example
 * cy.fillAssociadoForm({
 *   nomeCompleto: 'João da Silva',
 *   cpf: '123.456.789-00',
 *   email: 'joao@example.com',
 *   telefone: '(11) 98765-4321',
 *   endereco: 'Rua Teste, 123',
 *   cidade: 'São Paulo',
 *   estado: 'SP',
 *   cep: '01234-567'
 * })
 */
Cypress.Commands.add('fillAssociadoForm', (associado) => {
  cy.log('✏️ Preenchendo formulário do associado')

  // Aguardar o modal estar visível
  cy.wait(1500)

  // Nome Completo
  if (associado.nomeCompleto) {
    cy.get('input[name="nomeCompleto"]').last()
      .clear({ force: true })
      .type(associado.nomeCompleto, { force: true })
  }

  // CPF
  if (associado.cpf) {
    cy.get('input[name="cpf"]').last()
      .clear({ force: true })
      .type(associado.cpf, { force: true })
  }

  // Email
  if (associado.email) {
    cy.get('input[name="email"]').last()
      .clear({ force: true })
      .type(associado.email, { force: true })
  }

  // Telefone
  if (associado.telefone) {
    cy.get('input[name="telefone"]').last()
      .clear({ force: true })
      .type(associado.telefone, { force: true })
  }

  cy.log('✅ Formulário preenchido')
})

/**
 * Comando customizado para salvar o formulário
 *
 * @example
 * cy.submitForm()
 */
Cypress.Commands.add('submitForm', () => {
  cy.log('💾 Salvando formulário')

  // Clicar no botão "Salvar", "Atualizar", "Confirmar" ou "Criar"
  cy.contains('button', /Salvar|Atualizar|Confirmar|Criar/i)
    .filter(':visible')
    .first()
    .click()

  cy.log('✅ Formulário submetido')
})
