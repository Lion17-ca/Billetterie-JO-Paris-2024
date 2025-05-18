// Test E2E pour le parcours d'achat de billet
describe('Parcours d\'achat de billet', () => {
  // Utilisateur de test
  const testUser = {
    email: `test-user-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    firstName: 'Test',
    lastName: 'User'
  };

  // Avant chaque test, nous nous assurons d'être déconnectés
  beforeEach(() => {
    // Nettoyer le localStorage pour s'assurer qu'aucun utilisateur n'est connecté
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('permet à un nouvel utilisateur de s\'inscrire, se connecter et acheter un billet', () => {
    // 1. Inscription d'un nouvel utilisateur
    cy.contains('Inscription').click();
    cy.url().should('include', '/register');

    // Remplir le formulaire d'inscription
    cy.get('#firstName').type(testUser.firstName);
    cy.get('#lastName').type(testUser.lastName);
    cy.get('#email').type(testUser.email);
    cy.get('#password').type(testUser.password);
    cy.get('#confirmPassword').type(testUser.password);
    cy.get('#terms').check();
    cy.get('#privacy').check();

    // Soumettre le formulaire
    cy.contains('button', 'S\'inscrire').click();

    // Vérifier que l'inscription a réussi et que l'utilisateur est redirigé vers la page de configuration MFA
    cy.url().should('include', '/mfa-setup');
    cy.contains('Configuration de l\'authentification à deux facteurs').should('be.visible');

    // Simuler la configuration MFA (dans un environnement de test, on peut contourner cette étape)
    // Note: Dans un environnement réel, il faudrait scanner le QR code et entrer le code TOTP
    cy.window().then((win) => {
      // Simuler l'entrée d'un code TOTP valide
      // Dans un environnement de test, on peut modifier le comportement de l'API pour accepter un code fixe
      cy.get('#totpCode').type('123456');
      cy.contains('button', 'Vérifier et activer').click();
    });

    // Vérifier que l'utilisateur est redirigé vers la page d'accueil après la configuration MFA
    cy.url().should('include', '/');
    cy.contains('Bienvenue sur la billetterie officielle').should('be.visible');

    // 2. Se connecter avec le compte créé
    cy.contains('Connexion').click();
    cy.url().should('include', '/login');

    // Remplir le formulaire de connexion
    cy.get('#email').type(testUser.email);
    cy.get('#password').type(testUser.password);
    cy.contains('button', 'Se connecter').click();

    // Vérifier que l'utilisateur est redirigé vers la page de vérification MFA
    cy.url().should('include', '/mfa-verify');
    cy.contains('Vérification à deux facteurs').should('be.visible');

    // Simuler l'entrée d'un code TOTP valide
    cy.get('#totpCode').type('123456');
    cy.contains('button', 'Vérifier').click();

    // Vérifier que l'utilisateur est connecté et redirigé vers la page d'accueil
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Mon Profil').should('be.visible');
    cy.contains('Déconnexion').should('be.visible');

    // 3. Naviguer vers la page des offres
    cy.contains('Billets').click();
    cy.url().should('include', '/offers');
    cy.contains('Offres disponibles').should('be.visible');

    // 4. Sélectionner un événement et voir ses détails
    cy.contains('.card', 'Natation').first().click();
    cy.url().should('include', '/event/');
    cy.contains('Ajouter au panier').should('be.visible');

    // 5. Ajouter l'événement au panier
    cy.contains('button', 'Ajouter au panier').click();
    cy.contains('Ajouté au panier').should('be.visible');

    // 6. Aller au panier
    cy.contains('Panier').click();
    cy.url().should('include', '/cart');
    cy.contains('Mon Panier').should('be.visible');

    // Vérifier que l'événement est bien dans le panier
    cy.contains('Natation').should('be.visible');

    // 7. Procéder au paiement
    cy.contains('button', 'Procéder au paiement').click();
    cy.url().should('include', '/checkout');
    cy.contains('Paiement').should('be.visible');

    // 8. Remplir les informations de paiement
    cy.get('#cardNumber').type('4242424242424242');
    cy.get('#cardExpiry').type('1225');
    cy.get('#cardCvc').type('123');
    cy.get('#cardName').type('Test User');

    // 9. Finaliser l'achat
    cy.contains('button', 'Payer maintenant').click();

    // 10. Vérifier la confirmation d'achat
    cy.url().should('include', '/purchase-confirmation');
    cy.contains('Votre achat a été confirmé').should('be.visible');
    cy.contains('Voir mes billets').should('be.visible');

    // 11. Aller à la page "Mes billets"
    cy.contains('Voir mes billets').click();
    cy.url().should('include', '/my-tickets');
    cy.contains('Mes Billets').should('be.visible');

    // 12. Vérifier que le billet acheté est présent
    cy.contains('Natation').should('be.visible');
    cy.get('.qr-code').should('be.visible');

    // 13. Vérifier qu'on peut voir les détails du billet
    cy.contains('button', 'Voir les détails').first().click();
    cy.contains('Détails du billet').should('be.visible');
    cy.get('.qr-code-large').should('be.visible');

    // 14. Se déconnecter
    cy.contains('Déconnexion').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Connexion').should('be.visible');
    cy.contains('Inscription').should('be.visible');
  });

  it('vérifie que les préférences de confidentialité peuvent être gérées', () => {
    // Se connecter d'abord
    cy.login(testUser.email, testUser.password); // Commande personnalisée définie dans cypress/support/commands.js

    // Aller à la page de profil
    cy.contains('Mon Profil').click();
    cy.url().should('include', '/profile');

    // Vérifier que la section des préférences de confidentialité est présente
    cy.contains('Préférences de confidentialité').should('be.visible');

    // Modifier les préférences
    cy.get('#marketing-emails').check();
    cy.get('#third-party-sharing').uncheck();
    cy.contains('button', 'Enregistrer mes préférences').click();

    // Vérifier que les préférences ont été enregistrées
    cy.contains('Préférences mises à jour avec succès').should('be.visible');

    // Recharger la page pour vérifier que les préférences persistent
    cy.reload();
    cy.get('#marketing-emails').should('be.checked');
    cy.get('#third-party-sharing').should('not.be.checked');
  });

  it('permet à un utilisateur de demander la suppression de ses données', () => {
    // Se connecter d'abord
    cy.login(testUser.email, testUser.password);

    // Aller à la page de suppression des données
    cy.visit('/data-deletion-request');
    cy.contains('Demande de Suppression des Données').should('be.visible');

    // Remplir le formulaire
    cy.get('#formEmail').type(testUser.email);
    cy.get('#formReason').type('Test de demande de suppression');
    cy.get('#formConfirmation').check();

    // Soumettre la demande
    cy.contains('button', 'Demander la suppression de mes données').click();

    // Vérifier que la demande a été soumise avec succès
    cy.contains('Demande envoyée avec succès').should('be.visible');
  });
});

// Commandes personnalisées à ajouter dans cypress/support/commands.js
// Cypress.Commands.add('login', (email, password) => {
//   cy.visit('/login');
//   cy.get('#email').type(email);
//   cy.get('#password').type(password);
//   cy.contains('button', 'Se connecter').click();
//   cy.get('#totpCode').type('123456'); // Code fixe pour les tests
//   cy.contains('button', 'Vérifier').click();
//   cy.url().should('eq', Cypress.config().baseUrl + '/');
// });
