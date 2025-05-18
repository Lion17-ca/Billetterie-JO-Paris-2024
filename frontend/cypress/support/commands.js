// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.contains('button', 'Se connecter').click();
  
  // Gérer l'authentification à deux facteurs si nécessaire
  cy.url().then(url => {
    if (url.includes('/mfa-verify')) {
      // Dans un environnement de test, on peut utiliser un code fixe
      cy.get('#totpCode').type('123456');
      cy.contains('button', 'Vérifier').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    }
  });
});

// Commande pour vérifier le consentement aux cookies
Cypress.Commands.add('acceptCookies', () => {
  cy.window().then(win => {
    // Si le consentement n'est pas déjà stocké, cliquer sur le bouton d'acceptation
    if (!win.localStorage.getItem('cookieConsent')) {
      cy.get('body').then($body => {
        if ($body.find('[data-testid="cookie-consent-modal"]').length > 0) {
          cy.contains('button', 'Accepter tous').click();
        }
      });
    }
  });
});

// Commande pour acheter un billet
Cypress.Commands.add('purchaseTicket', (eventName) => {
  // Aller à la page des offres
  cy.visit('/offers');
  
  // Sélectionner l'événement spécifié
  cy.contains('.card', eventName).first().click();
  
  // Ajouter au panier
  cy.contains('button', 'Ajouter au panier').click();
  
  // Aller au panier
  cy.contains('Panier').click();
  
  // Procéder au paiement
  cy.contains('button', 'Procéder au paiement').click();
  
  // Remplir les informations de paiement
  cy.get('#cardNumber').type('4242424242424242');
  cy.get('#cardExpiry').type('1225');
  cy.get('#cardCvc').type('123');
  cy.get('#cardName').type('Test User');
  
  // Finaliser l'achat
  cy.contains('button', 'Payer maintenant').click();
  
  // Vérifier la confirmation
  cy.url().should('include', '/purchase-confirmation');
  cy.contains('Votre achat a été confirmé').should('be.visible');
});

// Commande pour vérifier l'accessibilité de base
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y(null, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa']
    }
  });
});

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
