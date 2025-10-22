// ***********************************************************
// Este arquivo é processado e carregado automaticamente antes
// de seus arquivos de teste.
//
// Você pode alterar a localização deste arquivo ou desligar
// a importação automática de arquivos de suporte nas configurações.
//
// Leia mais aqui:
// https://on.cypress.io/configuration
// ***********************************************************

// Importar comandos customizados
import './commands'
import './seeds'

// Configurações globais
Cypress.on('uncaught:exception', (err, runnable) => {
  // Previne que erros de aplicação falhem o teste
  // Em produção, você pode querer logar esses erros
  console.log('Uncaught exception:', err.message)

  // Retornar false previne que o Cypress falhe o teste
  return false
})

// Hook executado antes de cada teste
beforeEach(() => {
  // Limpar localStorage e sessionStorage antes de cada teste
  cy.clearLocalStorage()
  cy.clearCookies()
})
