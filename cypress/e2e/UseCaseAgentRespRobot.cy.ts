import {slowCypressDown} from "cypress-slow-down";
// @ts-ignore
import params from '../params.json';

//slowCypressDown(500)


describe('UseCase Robot', () => {

    // @ts-ignore
    const idInter = Cypress.env('TEST_ID_INTER');
    //const idInter = '2506-RXN'

    const generateAAName = (baseName: string) => {
        const randomPart = Math.random().toString(36).substring(2, 6);
        return `aa-${baseName}-${randomPart}`.toLowerCase();
    };

    const agentLastName = 'TEST';
    const agentFirstName = generateAAName('Agent');



    it('passes', () => {
        cy.viewport(1000, 660);
        cy.skipLogin(params.identifiantsB2b.b2bUsername, params.identifiantsB2b.b2bPassword, params.url.urlb2b);
        cy.wait(1000);

        cy.creerCompteAgent(agentLastName, agentFirstName);

        cy.findRowByExactReference(idInter).within(() => {
            cy.get('[data-testid="compteRendu-test"]').click();
        });

        // Récupère l'adresse, puis continue
        cy.avoirAdresseViaCode().then((adresseSite) => {

            cy.log("Adresse: " + adresseSite);

            cy.affecterAgent(agentFirstName);

            // @ts-ignore
            cy.avoirCodeAppairageRec(agentFirstName).then((appairageCode) => {
                cy.wait(1000);
                // @ts-ignore
                cy.agentNobiRobot(appairageCode, params.url.urlb2b, adresseSite, params.pointDeDepartAdress);
            });
        });
    });
});


