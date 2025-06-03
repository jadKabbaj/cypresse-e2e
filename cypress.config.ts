import { defineConfig } from "cypress";

// @ts-ignore
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    chromeWebSecurity: false,
    experimentalStudio: true,
    experimentalInteractiveRunEvents: true,
    experimentalMemoryManagement: true,
    baseUrl: 'https://b2cm.staging.seculib.intoo.best/',
    specPattern: [
      'cypress/e2e/UseCaseComplet.cy.ts',
      'cypress/e2e/UseCaseAgentRespRobot.cy.ts'
    ],
    supportFile: 'cypress/support/e2e.ts'
  },
});
