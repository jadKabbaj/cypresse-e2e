// @ts-ignore
import params from '../params.json';

declare global {
    namespace Cypress {
        interface Chainable <Subject> {
           skipOnboarding(url :string): Chainable<void>;
           skipLogin(username:string,password:string, url: string): Chainable<void>;
           inscription(numTel:string, mdp:string, nom:string, prenom:string, email: string ,urlApi: string): Chainable<void>;
           creerSite(libelle: string, adresse: string, instructions:string, etage: string, animaux: string): Chainable<void>;
           getInterventionCode(): Chainable<string>;
           demanderIntervention(): Chainable<string>;
           findRowByExactReference(code: string): Chainable<void>;
           avoirCodeAppairage(nomAgent:string):Chainable<string>;
            avoirCodeAppairageRec(nomAgent:string):Chainable<string>;
            login(username: string, password:string, url:string): Chainable<void>;
           affecterAgent(agentName:string): Chainable<void>;
           agentNobi(appairageCode: string, url:string,adresseSite: string): Chainable<void>;
           creerCompteAgent(agentName:string, agentLastName: string):Chainable<void>;
           avoirAdresseViaCode():Chainable<string>;

        }
    }
}

// l'onboarding
// @ts-ignore
Cypress.Commands.add('skipOnboarding', (url:string) => {
    cy.log("url:",url)
    cy.visit(url); // URL de la page de login
    cy.get('body').then(($body) => {
        // @ts-ignore
        if ($body.text().includes('Choisir l\'autosurveillance ne veut pas dire être seul.')) {
            // Onboarding exists, proceed with clicks
            cy.get('ion-button[shape="round"]')
                .find('ion-icon[name="arrow-forward-sharp"]')
                .click({force: true});

            cy.get('ion-button[shape="round"]')
                .find('ion-icon[name="arrow-forward-sharp"]')
                .click({force: true});

            cy.get('ion-button.my-custom-button')
                .contains('Commencer')
                .click({force: true});
        } else {
            cy.log('Onboarding not found - skipping');
        }
    });
});

//Passe le login
// @ts-ignore
Cypress.Commands.add('skipLogin', (username:string,password:string, url: string) => {
    cy.visit(params.url.urlb2b)
    cy.wait(1000)
    cy.get('body').then(($body) => {
        // @ts-ignore
        if ($body.text().includes('Nom d\'utilisateur')) {
            // @ts-ignore
            cy.login(username, password, url);
        } else {
            cy.log('Login not found - skipping');
        }
    });
});

//Faire l'inscription
//@ts-ignore
Cypress.Commands.add('inscription',(numTel:string, mdp:string, nom:string, prenom:string, email:string, urlApi: string) =>{
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Janvier = 0
    const year = String(now.getFullYear()).slice(-2); // Prend les deux derniers chiffres
    const code = `${day}${month}${year}`.split(''); // Ex: ['3','0','0','5','2','5']

    cy.contains('Numéro').type('dev');
    cy.contains('Mot de passe').type('dev');
    cy.contains('Continuer').click({force : true})
    cy.get('#alert-input-1-0').clear().type(urlApi);
    cy.contains('OK').click({force : true})


    cy.contains('Numéro').type(numTel);
    cy.contains('Mot de passe').type(mdp);
    cy.contains('Continuer').click({force : true})



    cy.get('slb-six-digit-code input.native-input').each((input, index) => {
        if (index < code.length) {
            cy.wrap(input).type(code[index]);
        }
    });

    cy.contains('Nom').type(nom);
    cy.contains('Prénom').type(prenom);
    cy.contains('Adresse e-mail').type(email);
    cy.contains('Suivant').click({force : true});
})

//Créer Site
//@ts-ignore
Cypress.Commands.add('creerSite', (libelle: string, adresse: string, instructions:string, etage: string, animaux: string) =>{
    cy.contains('Libellé').type(libelle);
    cy.contains('Adresse').click({force :true})
    cy.contains('Votre adresse').type(adresse);
    cy.contains(adresse).click({force : true, multiple:true});
    cy.get('ion-toggle[formcontrolname="responsabilite"]').click({ force: true });
    cy.wait(500);
    cy.contains('Suivant').click({force : true});
    cy.wait(500);
    cy.get('body').then(($body) => {
        // @ts-ignore
        if ($body.text().includes('Avertissement')) {
            cy.contains('Continuer').click({force : true});
        }
        else {
            cy.log('Onboarding not found - skipping');

        }
        })

    cy.contains('ion-radio', 'Individuel')
        .should('not.have.attr', 'aria-checked', 'true')
        .click({ force: true })
        .should('have.attr', 'aria-checked', 'true');

    cy.contains('ion-radio', 'Oui')
        .should('not.have.attr', 'aria-checked', 'true')
        .click({ force: true })
        .should('have.attr', 'aria-checked', 'true');

    cy.contains('Instruction d\'acc').type(instructions);
    cy.contains('Numéro de l\'étage').type(etage);
    cy.contains('Présence d\'animaux').type(animaux);

    cy.get('ion-button').contains('Suivant').scrollIntoView();
    cy.get('ion-button').contains('Suivant').click();
    cy.wait(500);
    cy.get('ion-button').contains('Terminer').click({force : true});

    cy.contains(libelle).click({force : true});
    cy.wait(500);
    cy.scrollTo('bottom', { ensureScrollable: false })
    cy.contains('Description').click({force : true});
    cy.wait(500);
    cy.get('div.ion-padding div')
        .contains(instructions)
        .scrollIntoView()
        .should('exist')
        .and($el => {
            //@ts-ignore
            expect($el[0].offsetParent).to.not.be.null;
        });

    cy.get('div.ion-padding div')
        .contains(etage)
        .scrollIntoView()
        .should('exist')
        .and($el => {
            //@ts-ignore
            expect($el[0].offsetParent).to.not.be.null;
        });

    cy.get('ion-back-button').click({ force: true });

})

//Generer le code d'appairage et le copier
// @ts-ignore
Cypress.Commands.add('getInterventionCode', (): Cypress.Chainable<string> => {
    return cy.get('ion-title.title-default').then(($title) => {
        // @ts-ignore
        const fullText = $title.text().trim();

        // Regex plus permissive pour différents formats
        const codeMatch = fullText.match(/(\b\d{4}-\w{3}\b)/); // \w accepte lettres et chiffres

        if (!codeMatch) {
            // Log détaillé pour le débogage
            cy.log(`Texte complet du titre : "${fullText}"`);
            throw new Error(`Aucun code au format "XXXX-XXX" trouvé dans le titre. Texte trouvé : "${fullText}"`);
        }

        const code = codeMatch[0];
        cy.log(`Code d'intervention extrait : ${code}`);
        return cy.wrap(code);
    });
});

//trouver le code d'appairrage sur b2b
// @ts-ignore
Cypress.Commands.add('findRowByExactReference', (reference: string) => {
    return cy.get('tbody tr', { timeout: 10000 })
        .should('have.length.greaterThan', 0) // Ensure rows exist
        .then(() => {
            return cy.get(`tbody tr:has(td:nth-child(2):contains("${reference.trim()}"))`)
                .should('exist')
                .first();
        });
});

// Create the login command
// @ts-ignore
Cypress.Commands.add('login', (username: string, password: string, url:string) => {
    cy.log("url:",url)
    cy.visit(url); // URL de la page de login
  //  cy.get('body').then(($body) => {
        // @ts-ignore
       // if ($body.text().includes('Connexion à votre espace Pégase Sécurité')) {
            // Onboarding exists, proceed with clicks
            cy.get('input#username').type(username);
            cy.get('input#password').type(password);
            cy.get('button[type="submit"]').click();
            cy.url().should('include', '/');
            cy.get('noscript').should('not.be.visible');
           // cy.contains('Vue d\'ensemble').should('be.visible')
        //} else {
            cy.log('loging not found - skipping');
       // }
   // });

});

//Creer un Compte agent
// @ts-ignore
Cypress.Commands.add('creerCompteAgent', (agentName:string, agentLastName: string) => {

    cy.get('[data-testid="ajouter-test"]').click();
    cy.wait(1000)

    cy.get('[data-testid="ajouter-utilisateur-test"]').click();

    cy.contains('Nom').type(agentLastName);
    cy.contains('Prénom').type(agentName);

    cy.get('[data-testid="role-select"]')
        .should('be.visible')
        .within(() => {
            cy.get('select').select('Agent', { force: true });
        });

    cy.get('[data-testid="sauvegarder-test"]').click();
});

// Create the login command
// @ts-ignore
Cypress.Commands.add('demanderIntervention', () => {
    cy.contains('Demander une prestation').click({force :true})
    cy.wait(1000)
    cy.contains('ion-card', 'Intervention').should('be.visible').click();
    cy.contains('Oui').click({force :true})
    cy.get('img.leaflet-marker-icon[src*="marker-point"]').eq(0).click({ force: true });
    cy.contains('Choisir').click({force :true})
    cy.contains('Payer').click({force :true})
});

//Generer le code d'appairage et le copier
// @ts-ignore
Cypress.Commands.add('avoirCodeAppairage', (nomAgent: string) => {
        cy.contains('Gestion').click();
        cy.get('[data-testid="compteMobile-test"]').click({ force: true});
        cy.get('[data-testid="filterAgent-test"]').type(nomAgent);
        cy.wait(1500)
        cy.get('[data-testid="appairrage-test"]').click({ force: true});
        cy.get('[data-testid="genererCode-test"]').click({ force: true})
            .then(() => {
                return cy.contains('Réappairage en cours (code :', { timeout: 10000 })
                    .invoke('text')
                    .then((text) => {
                        // @ts-ignore
                        const codeMatch = text.match(/(IN2STG)\s*-\s*[0-9]+\s*-\s*[A-Z]+\s*-\s*[0-9]+/);
                        if (codeMatch?.[0]) {
                            return codeMatch[0].replace(/\s+/g, ''); // Remove any spaces
                        }
                        throw new Error(`Impossible de trouver le code  IN2STG dans le texte: "${text}"`);
                    });
            });

});
// @ts-ignore
Cypress.Commands.add('avoirCodeAppairageRec', (nomAgent: string) => {
    cy.contains('Gestion').click();
    cy.get('[data-testid="compteMobile-test"]').click({ force: true});
    cy.get('[data-testid="filterAgent-test"]').type(nomAgent);
    cy.wait(1500)
    cy.get('[data-testid="appairrage-test"]').click({ force: true});
    cy.get('[data-testid="genererCode-test"]').click({ force: true})
        .then(() => {
            return cy.contains('Réappairage en cours (code :', { timeout: 10000 })
                .invoke('text')
                .then((text) => {
                    // @ts-ignore
                    const codeMatch = text.match(/(IN2REC)\s*-\s*[0-9]+\s*-\s*[A-Z]+\s*-\s*[0-9]+/);
                    if (codeMatch?.[0]) {
                        return codeMatch[0].replace(/\s+/g, ''); // Remove any spaces
                    }
                    throw new Error(`Impossible de trouver le code  IN2STG dans le texte: "${text}"`);
                });
        });

});

//Copier l'adresse
// @ts-ignore
Cypress.Commands.add('avoirAdresseViaCode', () => {
    return cy.contains('Adresse :', { timeout: 10000 })
        .parent() // Monter au conteneur qui contient à la fois "Adresse :" et l'adresse
        .invoke('text')
        .then((text) => {
            // @ts-ignore
            const match = text.match(/Adresse\s*:\s*(.+)/);
            if (match && match[1]) {
                return match[1].trim();
            }
            throw new Error(`Impossible d'extraire l'adresse dans le texte: "${text}"`);
        });
});

//Faire n gardiennage coté nobi mobil command
// @ts-ignore
// Sous-commandes décomposées

// 1. Authentification
Cypress.Commands.add('nobiAuthenticate', (appairageCode: string, url: string) => {
    const authData = {
        username: appairageCode,
        password: appairageCode,
        device: "Browser",
        rememberMe: true
    };

    return cy.request({
        method: 'POST',
        url: url + 'api/authenticate',
        body: authData,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        // @ts-ignore
    }).then((response) => response.body.id_token);
});

// 2. Récupération des coordonnées
// @ts-ignore
Cypress.Commands.add('nobiGetCoordinates', (address: string) => {
    return cy.request({
        method: 'GET',
        url: 'https://api.staging.seculib.intoo.best/particulier/geo/search',
        // @ts-ignore
        qs: { query: address },
        headers: { 'Accept': 'application/json' }
        // @ts-ignore
    }).then((response) => response.body[0].location);
});

// 3. Récupération du créneau
// @ts-ignore
Cypress.Commands.add('nobiGetNextCreneau', (url: string, authToken: string) => {
    // @ts-ignore
    return cy.request({
        method: 'GET',
        url: url + 'mobile/me/creneaux/prochain',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
        }
        // @ts-ignore
    }).then((response) => response.body.prochains[0].id);
});

//Récupération des ids des champs du CR
// @ts-ignore
// Récupération des IDs des champs "Ronde extérieure" et "Ronde intérieure"
Cypress.Commands.add('nobiGetRondeFieldsIds', (url: string, authToken: string) => {
    return cy.request({
        method: 'GET',
        url: url + 'mobile/me/creneaux/prochain',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
        }
    }).then((response) => {
        // @ts-ignore
        const champs = response.body.courant.champsPersonnalises;
        // @ts-ignore
        const rondeExterieur = champs.find(champ =>
            champ.libelle === "Réalisation de la ronde extérieure"
        );
        // @ts-ignore
        const rondeInterieur = champs.find(champ =>
            champ.libelle === "Réalisation de la ronde intérieure"
        );

        return {
            rondeExterieurId: rondeExterieur.id,
            rondeInterieurId: rondeInterieur.id,
            rondeExterieurChoix: rondeExterieur.choix,
            rondeInterieurChoix: rondeInterieur.choix
        };
    });
});

// 4. Début d'intervention
// @ts-ignore
Cypress.Commands.add('nobiStartIntervention', (url: string, authToken: string, creneauId: string, coordinates: any) => {
    const vacationId = crypto.randomUUID();

    return cy.request({
        method: 'POST',
        url: url + 'mobile/me/actions',
        body: [{
            type: "DEBUT_INTER_PONCTUELLE_EVENT",
            instant: new Date().toISOString(),
            idCreneau: creneauId,
            idVacation: vacationId,
            debut: new Date().toISOString(),
            idConsignes: [],
            champsPersonnalises: [],
            coordinates: {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            }
        }],
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    }).then(() => vacationId); // Retourne l'ID de vacation pour les étapes suivantes
});

// 5. Simulation de déplacement
// @ts-ignore
Cypress.Commands.add('nobiSimulateMovement', (url: string, authToken: string, vacationId: string, startCoords: any, endCoords: any) => {
    const sendLocation = (lat: number, long: number) => {
        return cy.request({
            method: 'POST',
            url: url + 'mobile/me/location',
            body: {
                vacationId: vacationId,
                latitude: lat,
                longitude: long,
                batteryLevel: 1
            },
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            failOnStatusCode: false
        }).then((response) => {
            // @ts-ignore
            if (response.status !== 200) {
                // @ts-ignore
                cy.log(`Échec envoi géoloc: ${response.status} - ${JSON.stringify(response.body)}`);
            }
        });
    };

    const getIntermediatePoint = (start: number, end: number, ratio: number) => {
        return start + (end - start) * ratio;
    };

    return cy.wrap([0.2, 0.5, 0.8, 1.0], { log: false }).each((ratio: number) => {
        const currentLat = getIntermediatePoint(startCoords.latitude, endCoords.latitude, ratio);
        const currentLong = getIntermediatePoint(startCoords.longitude, endCoords.longitude, ratio);

        return sendLocation(currentLat, currentLong)
            .then(() => cy.wait(params.delaiEntreEnvoieGeolocMS, { log: false }));
    });
});

// Fetch custom field IDs first, then use them in arrival event
// @ts-ignore
Cypress.Commands.add('nobiArriveeSurSite', (url: string, authToken: string, creneauId: string, coordinates: any) => {
    // First get the field IDs from the current creneau
    return cy.request({
        method: 'GET',
        url: url + 'mobile/me/creneaux/prochain',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
        }
    }).then((getResponse) => {
        // Extract the custom fields
        // @ts-ignore
        const champs = getResponse.body.courant.champsPersonnalises;

        // Find the specific fields we need
        // @ts-ignore
        const retardField = champs.find(f =>
            f.libelle.includes("retard pour la ou les raisons suivantes")
        );
        // @ts-ignore
        const accesField = champs.find(f =>
            f.libelle === "Accès au site" && f.type === "BOOLEAN"
        );

        // Now make the arrival request with these IDs
        return cy.request({
            method: 'POST',
            url: url + 'mobile/me/actions',
            failOnStatusCode: false,
            body: [{
                type: "ARRIVEE_SUR_SITE_EVENT",
                coordinates: {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude
                },
                champsPersonnalises: [
                    {
                        id: retardField.id,
                        libelle: retardField.libelle,
                        valeur: [],
                        etape: "ARRIVEE_SUR_SITE",
                        type: "CHECKBOX_LIST",
                        groupe: "Arrivée sur site",
                        required: null,
                        boutonPlus: "Autre",
                        choix: retardField.choix
                    },
                    {
                        id: accesField.id,
                        libelle: accesField.libelle,
                        valeur: true,
                        etape: "ACCES_AU_SITE",
                        type: "BOOLEAN",
                        groupe: "Accès au site",
                        required: true,
                        boutonPlus: null,
                        choix: []
                    }
                ],
                id: crypto.randomUUID(),
                idAffectation: creneauId,
                instant: new Date().toISOString(),
                time: new Date().toISOString()
            }],
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((response) => {
            // @ts-ignore
            if (response.status !== 200) {
                // @ts-ignore
                cy.log('Erreur détaillée:', JSON.stringify(response.body, null, 2));
            }
            return response;
        });
    });
});
// 7. Agent declare info
// @ts-ignore
Cypress.Commands.add('nobiAgentDeclareInfo', (coordinates: any, vacationId: string, url: string, authToken: string) => {
    // @ts-ignore
    return cy.request({
        method: 'POST',
        url: url + 'mobile/me/actions',
        body: [
            {
                coordinates: {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                },
                idVacation: vacationId,
                instant: new Date().toISOString(),
                photo: [],
                texte: "Je vois le chat à l'interieur",
                type: "INFO_VACATION",
            },
        ],
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`, // ✅ Authentification ici
        }
        // @ts-ignore
    }).then((response) => response);
});

// 8. Agent declare anomalie
// @ts-ignore
Cypress.Commands.add('nobiAgentDeclareAnomalie', (coordinates: any, vacationId: string, url: string, authToken: string) => {
    // @ts-ignore
    return cy.request({
        method: 'POST',
        url: url + 'mobile/me/actions',
        body: [
            {
                coordinates: {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                },
                idVacation: vacationId,
                instant: new Date().toISOString(),
                photo: [],
                texte: "La fenetre est cassée",
                type: "ANOMALIE_INTER_PONCTUELLE",
                avecZone: false
            },
        ],
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        }
        // @ts-ignore
    }).then((response) => response);
});

// 8. Agent remplit CR
// @ts-ignore
Cypress.Commands.add('nobiRemplirCompteRendu', (url: string, authToken: string, creneauId: string, coordinates: any) => {
    // @ts-ignore
    return cy.nobiGetRondeFieldsIds(url, authToken).then((ids) => {
        const requestBody = [{
            type: "COMPTE_RENDU_EVENT",
            coordinates: {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            },
            champsPersonnalises: [
                {
                    boutonPlus: null,
                    choix: ids.rondeExterieurChoix,
                    etape: "COMPTE_RENDU",
                    groupe: "Ronde extérieure",
                    id: ids.rondeExterieurId,
                    libelle: "Réalisation de la ronde extérieure",
                    reference: null,
                    required: true,
                    type: "RADIO_LIST",
                    valeur: "Accès complet"
                },
                {
                    boutonPlus: null,
                    choix: ids.rondeInterieurChoix,
                    etape: "COMPTE_RENDU",
                    groupe: "Ronde intérieure",
                    id: ids.rondeInterieurId,
                    libelle: "Réalisation de la ronde intérieure",
                    reference: null,
                    required: true,
                    type: "RADIO_LIST",
                    valeur: "Accès partiel"
                }
            ],
            idAffectation: creneauId,
            instant: new Date().toISOString()
        }];

        cy.log('Sending request with body:', JSON.stringify(requestBody, null, 2));

        // Then return the request
        return cy.request({
            method: 'POST',
            url: url + 'mobile/me/actions',
            failOnStatusCode: false,
            body: requestBody,
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    });
});
// 3. Fix the nobiFinVacationPonctuelle command
// @ts-ignore

Cypress.Commands.add('nobiFinVacationPonctuelle', (url: string, authToken: string, creneauId: string, coordinates: any) => {
    const now = new Date();
    const finTime = new Date();

    const requestBody = [{
        type: "FIN_VACATION_INTER_PONCTUELLE_EVENT",
        coordinates: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
        },
        champsPersonnalises: [],
        idCreneau: creneauId,
        instant: now.toISOString(),
        fin: finTime.toISOString(),
        signature: null
    }];

    // ✅ BEST FIX: Move all logging outside the .then() callback
    cy.log('Request body:', JSON.stringify(requestBody, null, 2));

    return cy.request({
        method: 'POST',
        url: url + 'mobile/me/actions',
        failOnStatusCode: false,
        body: requestBody,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then((response) => {
        // Use console.log instead of cy.log to avoid mixing commands
        // @ts-ignore
        console.log('Response status:', response.status);
        // @ts-ignore
        console.log('Response body:', JSON.stringify(response.body, null, 2));
// @ts-ignore
        if (response.status !== 200) {
            // @ts-ignore
            console.log('Request failed with status:', response.status);
        } else {
            console.log('Request successful');
        }

        return response;
    });
});


// Alternative command for fallback
// @ts-ignore
Cypress.Commands.add('nobiFinVacationPonctuelleAlt', (url: string, authToken: string, creneauId: string, coordinates: any) => {
    const now = new Date();
    const finTime = new Date(now.getTime() + 2000); // 2 seconds later for fin time

    const requestBody = [{
        type: "FIN_VACATION_INTER_PONCTUELLE_EVENT",
        coordinates: {
            latitude: parseFloat(coordinates.latitude.toString()),
            longitude: parseFloat(coordinates.longitude.toString())
        },
        champsPersonnalises: [],
        idCreneau: creneauId,
        instant: now.toISOString(),
        fin: finTime.toISOString(),
        signature: null
    }];

    cy.log('Alternative request body:', JSON.stringify(requestBody, null, 2));

    return cy.request({
        method: 'POST',
        url: url + 'mobile/me/actions',
        failOnStatusCode: false,
        body: requestBody,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then((response) => {
        // @ts-ignore
        cy.log('Alternative response status:', response.status);
        // @ts-ignore
        cy.log('Alternative response body:', JSON.stringify(response.body, null, 2));
        return cy.wrap(response);
    });
});

// Updated main command - FIXED VERSION
// @ts-ignore
Cypress.Commands.add('agentNobi', (appairageCode: string, url: string, adresseArrivee: string, adresseDepart: string) => {
    // @ts-ignore
    return cy.nobiAuthenticate(appairageCode, url).then((authToken) => {
        // @ts-ignore
        return cy.nobiGetCoordinates(adresseArrivee).then((coordinatesArrivee) => {
            // @ts-ignore
            return cy.nobiGetCoordinates(adresseDepart).then((coordinatesDepart) => {
                // @ts-ignore
                return cy.nobiGetNextCreneau(url, authToken).then((creneauId) => {
                    // @ts-ignore
                    return cy.nobiStartIntervention(url, authToken, creneauId, coordinatesArrivee).then((vacationId) => {

                        // DOM interactions - these need to be separate from API calls
                        cy.wait(3000);
                        cy.contains('Notre agent prend en charge votre demande.').should('be.visible');

                        // API call - separate from DOM chain
                        // @ts-ignore
                        cy.nobiSimulateMovement(url, authToken, vacationId, coordinatesDepart, coordinatesArrivee);

                        // API call - separate from DOM chain
                        // @ts-ignore

                        cy.nobiArriveeSurSite(url, authToken, creneauId, coordinatesArrivee);

                        //cy.contains('La porte est elle ouverte ? : Non').should('be.visible');
                        cy.wait(8000);
                        cy.wait(8000);
                        cy.contains('Accès au site : Oui').should('be.visible');
                        // API calls - separate from DOM chain
                        // @ts-ignore
                        cy.nobiAgentDeclareInfo(coordinatesArrivee, vacationId, url, authToken);
                        // @ts-ignore
                        cy.nobiAgentDeclareAnomalie(coordinatesArrivee, vacationId, url, authToken);

                        // DOM interactions
                        cy.wait(3000);
                        cy.contains('Je vois le chat à l\'interieur').should('be.visible');
                        cy.wait(3000);
                        cy.contains('La fenetre est cassée').should('be.visible');

                        // API call - separate from DOM chain
                        // @ts-ignore
                        cy.nobiRemplirCompteRendu(url, authToken, creneauId, coordinatesArrivee);

                        // DOM interactions

                        cy.wait(2000);
                        cy.contains('Réalisation de la ronde extérieure : Accès complet').should('be.visible');
                        cy.wait(2000);
                        cy.contains('Réalisation de la ronde intérieure : Accès partiel').should('be.visible');

                        // Final API call
                          //@ts-ignore
                        cy.nobiFinVacationPonctuelle(url, authToken, creneauId, coordinatesArrivee);
                    });
                });
            });
        });
    });
});
//Passe le login
// @ts-ignore
Cypress.Commands.add('affecterAgent', (agentName:string) => {
    cy.contains("Affecter un agent").click()
    cy.contains("Agent à affecter").type(agentName)
    cy.contains(agentName).click()
    cy.get('button.btn.btn-outline-primary').click();
});

// Commande principale refactorisée
// @ts-ignore
Cypress.Commands.add('agentNobiRobot', (appairageCode: string, url: string, adresseArrivee: string, adresseDepart: string) => {
    // 1. Authentification
    // @ts-ignore
    cy.nobiAuthenticate(appairageCode, url).then((authToken) => {
        // 2. Récupération des coordonnées
        // @ts-ignore
        cy.nobiGetCoordinates(adresseArrivee).then((coordinatesArrivee) => {
            // @ts-ignore
            cy.nobiGetCoordinates(adresseDepart).then((coordinatesDepart) => {
                // 3. Récupération du créneau
                // @ts-ignore
                cy.nobiGetNextCreneau(url, authToken).then((creneauId) => {
                    // 4. Début d'intervention
                    // @ts-ignore
                    cy.nobiStartIntervention(url, authToken, creneauId, coordinatesArrivee).then((vacationId) => {
                        // 5. Simulation de déplacement
                        // @ts-ignore
                        cy.nobiSimulateMovement(url, authToken, vacationId, coordinatesDepart, coordinatesArrivee).then(() => {
                            // 6. Arrivée sur site
                            // @ts-ignore
                            cy.nobiArriveeSurSite(url, authToken, creneauId, coordinatesArrivee)
                            cy.wait(2000).then(() => {
                                cy.wait(8000);
                                // @ts-ignore
                                cy.nobiAgentDeclareInfo(coordinatesArrivee, vacationId, url, authToken).then(()=>{
                                    cy.wait(8000);
                                    // @ts-ignore
                                    cy.nobiAgentDeclareAnomalie(coordinatesArrivee, vacationId, url, authToken).then(()=>{
                                        cy.wait(8000);
                                        // @ts-ignore
                                        cy.nobiRemplirCompteRendu(url, authToken, creneauId, coordinatesArrivee)
                                        cy.wait(20000);
                                        // @ts-ignore
                                        cy.nobiFinVacationPonctuelle(url, authToken, creneauId, coordinatesArrivee);

                                    })
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
