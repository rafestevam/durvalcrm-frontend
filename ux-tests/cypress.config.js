const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // URL base da aplicação
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:9080/crm',

    // Configurações de viewport
    viewportWidth: 1920,
    viewportHeight: 1080,

    // Timeouts
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,

    // Configurações de vídeo e screenshots
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',

    // Configurações de teste
    retries: {
      runMode: 2,      // Retry 2x quando rodando em CI
      openMode: 0      // Não retry em modo interativo
    },

    // Variáveis de ambiente (podem ser sobrescritas via .env ou CLI)
    env: {
      keycloakUsername: process.env.KEYCLOAK_USERNAME || 'tesouraria',
      keycloakPassword: process.env.KEYCLOAK_PASSWORD || 'cairbar@2025',
    },

    setupNodeEvents(on, config) {
      // Configurar para usar modo incógnito no Chrome
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Modo incógnito para Chrome/Edge
          launchOptions.args.push('--incognito')
        }

        if (browser.family === 'firefox') {
          // Modo privado para Firefox
          launchOptions.args.push('-private')
        }

        return launchOptions
      })

      return config
    },
  },
})
