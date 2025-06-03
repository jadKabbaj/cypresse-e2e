import {slowCypressDown} from "cypress-slow-down";
// @ts-ignore
import params from '../params.json';

//slowCypressDown(500)


describe('template spec', () => {
  // @ts-ignore
  const numTel = '06' + Cypress._.random(10000000, 99999999).toString();

  // Mot de passe sécurisé (10+ chars, 1 maj, 1 chiffre, 1 spécial)
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specials = '!@#$%^&*';

  const randomChar = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

  const generateClientEmail = () => {
    const randomString = Math.random().toString(36).substring(2, 6); // 4 caractères aléatoires
    return `${randomString}@test.com`.toLowerCase();
  };

  const generateAAName = (baseName: string) => {
    const randomPart = Math.random().toString(36).substring(2, 6);
    return `aa-${baseName}-${randomPart}`.toLowerCase();
  };

  const email = generateClientEmail()
  const agentLastName = 'TEST';
  const agentFirstName = generateAAName('Agent');

  let mdp = [
    randomChar(lowercase),
    randomChar(uppercase),
    randomChar(numbers),
    randomChar(specials)
  ].join('');

  // Ajoute des caractères aléatoires jusqu'à 10
  const allChars = lowercase + uppercase + numbers + specials;
  while (mdp.length < 10) {
    mdp += randomChar(allChars);
  }

  // Mélange le résultat
  mdp = mdp.split('').sort(() => Math.random() - 0.5).join('');

  it('passes', () => {

    cy.viewport(412, 915)
    // @ts-ignore

    //Skip onboarding
    cy.skipOnboarding(params.url.urlb2cm)

    //Faire inscription
    cy.inscription(numTel ,mdp ,params.client.nomClient ,params.client.prenomClient ,email ,params.url.urlApi);

    //Créer un site
    cy.creerSite(params.site.libelleSite, params.site.adresseSite, params.site.instructionAcces,params.site.etageSite,params.site.animauxSurSite)

    //Demander intervention
    cy.demanderIntervention();

    cy.wait(1000)

    cy.getInterventionCode().then((idInter) => {
      cy.viewport(1000, 660)
      cy.skipLogin(params.identifiantsB2b.b2bUsername,params.identifiantsB2b.b2bPassword,params.url.urlb2b)
      cy.wait(1000)

      // @ts-ignore
      cy.creerCompteAgent(agentLastName,agentFirstName);
      // @ts-ignore
      cy.findRowByExactReference(idInter).within(() => {
        cy.get('[data-testid="compteRendu-test"]').click();
      });

    cy.affecterAgent(agentFirstName);
    // @ts-ignore
    cy.avoirCodeAppairage(agentFirstName).then((appairageCode) => {
      cy.visit(params.url.urlb2cm);
      cy.viewport(412, 915)
      cy.wait(1000)

      cy.contains('OK').click({force : true})
      // @ts-ignore
      cy.agentNobi(appairageCode,params.url.urlb2b, params.site.adresseSite, params.pointDeDepartAdress);
      // @ts-ignore
      //cy.visit(url);
      cy.skipLogin(params.identifiantsB2b.b2bUsername,params.identifiantsB2b.b2bPassword,params.url.urlb2b)

      cy.contains('Historique').click({force:true})
      // @ts-ignore
      cy.findRowByExactReference(idInter).within(() => {
        cy.get('[data-testid="compteRendu-test"]').click();
        cy.contains('Réalisation de la ronde extérieure Accès complet').should('be.visible');
        cy.contains('Réalisation de la ronde intérieure Accès partiel').should('be.visible');
      });

    })

    })

/*
    cy.viewport(1100,660)
    cy.login('jeanregistre', '6eb376d449c67b37397cb3e920c91180',params.url.urlb2b);
    cy.wait(1000)

    cy.getInterventionCode().then((idInter) => {
      cy.viewport(1000, 660)
      cy.skipLogin(params.identifiantsB2b.b2bUsername,params.identifiantsB2b.b2bPassword,params.url.urlb2b)
      cy.wait(1000)

      cy.contains('Historique').click({force: true})
      cy.contains('Voir plus').click({force: true})
      cy.contains('Réalisation de la ronde extérieure Accès complet').should('be.visible');
      cy.contains('Réalisation de la ronde intérieure Accès partiel').should('be.visible');
      // @ts-ignore
      cy.findRowByExactReference(idInter).within(() => {
        cy.get('[data-testid="compteRendu-test"]').click();
      });
    })
*/
  })
})
