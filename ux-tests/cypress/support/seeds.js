/**
 * Sistema de Seeds para Testes E2E
 *
 * Este arquivo contém funções para popular o banco de dados
 * com dados de teste antes da execução dos testes.
 */

/**
 * Cria um associado via API
 * @param {Object} associadoData - Dados do associado
 * @returns {Promise} Promise com o associado criado
 */
Cypress.Commands.add('seedAssociado', (associadoData) => {
  cy.log('🌱 Seeding associado: ' + associadoData.nomeCompleto)

  return cy.window().then((win) => {
    // Obter token do localStorage do window atual
    const token = win.localStorage.getItem('access_token')

    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl') || 'http://localhost:9080'}/durvalcrm/api/v1/associados`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: associadoData,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 201 || response.status === 200) {
        cy.log('✅ Associado criado via API: ' + response.body.id)
        return response.body
      } else {
        cy.log('⚠️ Falha ao criar associado via API: ' + response.status)
        return null
      }
    })
  })
})

/**
 * Remove todos os associados de teste
 * Útil para limpar o banco antes dos testes
 */
Cypress.Commands.add('cleanTestAssociados', () => {
  cy.log('🧹 Limpando associados de teste')

  return cy.window().then((win) => {
    const token = win.localStorage.getItem('access_token')

    // Buscar todos os associados
    return cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl') || 'http://localhost:9080'}/durvalcrm/api/v1/associados`,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body) {
        const testAssociados = response.body.filter(a =>
          a.nomeCompleto && (
            a.nomeCompleto.includes('Teste') ||
            a.nomeCompleto.includes('Cypress') ||
            a.email.includes('teste.com') ||
            a.email.includes('cypress')
          )
        )

        cy.log(`🧹 Encontrados ${testAssociados.length} associados de teste`)

        // Deletar cada associado de teste
        testAssociados.forEach(associado => {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl') || 'http://localhost:9080'}/durvalcrm/api/v1/associados/${associado.id}`,
            headers: {
              'Authorization': `Bearer ${token}`
            },
            failOnStatusCode: false
          })
        })
      }
    })
  })
})

/**
 * Popula o banco com dados necessários para os testes de edição e exclusão
 */
Cypress.Commands.add('seedTestData', () => {
  cy.log('🌱 Populando banco com dados de teste')

  // Fazer login primeiro para obter token e acessar a aplicação
  cy.login()

  // Navegar para associados para garantir que a página está carregada
  cy.navigateToAssociados()

  // Aguardar um pouco para garantir que o token está salvo e página carregou
  cy.wait(2000)

  // Criar associados via API diretamente
  const associados = [
    {
      nomeCompleto: 'Maria Oliveira Teste',
      cpf: '987.654.321-00',
      email: 'maria.seed@teste.com'
    },
    {
      nomeCompleto: 'Associado Para Editar',
      cpf: '999.888.777-66',
      email: 'editar.seed@teste.com'
    },
    {
      nomeCompleto: 'Associado Para Excluir',
      cpf: '777.666.555-44',
      email: 'excluir.seed@teste.com'
    }
  ]

  associados.forEach(associado => {
    cy.seedAssociado(associado)
  })

  // Aguardar para garantir que todos foram criados
  cy.wait(2000)
  cy.log('✅ Dados de teste populados')
})
