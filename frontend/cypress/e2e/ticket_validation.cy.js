// Test E2E pour le parcours de validation des billets par un employé
describe('Parcours de validation des billets', () => {
  // Employé de test
  const testEmployee = {
    email: 'employee@example.com',
    password: 'SecurePassword123!'
  };

  // Avant chaque test, nous nous assurons d'être déconnectés
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('permet à un employé de se connecter et de scanner un billet valide', () => {
    // 1. Connexion en tant qu'employé
    cy.contains('Connexion').click();
    cy.url().should('include', '/login');

    // Remplir le formulaire de connexion
    cy.get('#email').type(testEmployee.email);
    cy.get('#password').type(testEmployee.password);
    cy.contains('button', 'Se connecter').click();

    // Vérifier que l'utilisateur est redirigé vers la page de vérification MFA
    cy.url().should('include', '/mfa-verify');
    cy.contains('Vérification à deux facteurs').should('be.visible');

    // Simuler l'entrée d'un code TOTP valide
    cy.get('#totpCode').type('123456');
    cy.contains('button', 'Vérifier').click();

    // Vérifier que l'employé est connecté et redirigé vers le tableau de bord employé
    cy.url().should('include', '/employee-dashboard');
    cy.contains('Tableau de bord employé').should('be.visible');
    cy.contains('Scanner de billets').should('be.visible');

    // 2. Accéder au scanner de billets
    cy.contains('Scanner de billets').click();
    cy.url().should('include', '/ticket-scanner');
    cy.contains('Scanner un billet').should('be.visible');

    // 3. Simuler le scan d'un QR code valide
    // Note: Dans un environnement de test, nous simulons l'entrée manuelle d'un code
    cy.get('#manual-ticket-id').type('TICKET-123456');
    cy.contains('button', 'Vérifier manuellement').click();

    // 4. Vérifier que le billet est valide
    cy.contains('Billet valide').should('be.visible');
    cy.contains('Natation - Finale').should('be.visible'); // Nom de l'événement
    cy.contains('John Doe').should('be.visible'); // Nom du détenteur du billet
    
    // Vérifier que les informations de sécurité sont affichées
    cy.contains('Signature vérifiée').should('be.visible');
    cy.contains('Première utilisation').should('be.visible');

    // 5. Valider le billet
    cy.contains('button', 'Valider l\'entrée').click();

    // 6. Vérifier la confirmation de validation
    cy.contains('Billet validé avec succès').should('be.visible');
    cy.contains('Entrée autorisée').should('be.visible');

    // 7. Essayer de scanner le même billet à nouveau
    cy.contains('button', 'Scanner un autre billet').click();
    cy.get('#manual-ticket-id').type('TICKET-123456');
    cy.contains('button', 'Vérifier manuellement').click();

    // 8. Vérifier que le billet est détecté comme déjà utilisé
    cy.contains('Billet déjà utilisé').should('be.visible');
    cy.contains('Entrée refusée').should('be.visible');
    cy.contains('Ce billet a déjà été utilisé le').should('be.visible');
  });

  it('détecte correctement un billet invalide ou contrefait', () => {
    // Se connecter en tant qu'employé
    cy.login(testEmployee.email, testEmployee.password); // Utilise la commande personnalisée

    // Accéder au scanner de billets
    cy.contains('Scanner de billets').click();

    // Simuler le scan d'un QR code invalide
    cy.get('#manual-ticket-id').type('FAKE-TICKET-789012');
    cy.contains('button', 'Vérifier manuellement').click();

    // Vérifier que le billet est détecté comme invalide
    cy.contains('Billet invalide').should('be.visible');
    cy.contains('Signature non valide').should('be.visible');
    cy.contains('Entrée refusée').should('be.visible');
  });

  it('permet à un employé de consulter l\'historique des validations', () => {
    // Se connecter en tant qu'employé
    cy.login(testEmployee.email, testEmployee.password);

    // Accéder à l'historique des validations
    cy.contains('Historique').click();
    cy.url().should('include', '/validation-history');
    cy.contains('Historique des validations').should('be.visible');

    // Vérifier que l'historique contient des entrées
    cy.get('table tbody tr').should('have.length.at.least', 1);
    
    // Vérifier les colonnes du tableau
    cy.contains('th', 'ID du billet').should('be.visible');
    cy.contains('th', 'Événement').should('be.visible');
    cy.contains('th', 'Date de validation').should('be.visible');
    cy.contains('th', 'Statut').should('be.visible');
    cy.contains('th', 'Validé par').should('be.visible');

    // Tester les filtres
    cy.contains('label', 'Filtrer par statut').should('be.visible');
    cy.get('select#status-filter').select('Validé');
    cy.contains('button', 'Appliquer').click();
    
    // Vérifier que les résultats sont filtrés
    cy.get('table tbody tr').each(($row) => {
      cy.wrap($row).contains('Validé');
    });
  });

  it('vérifie le système de sécurité à double clé', () => {
    // Se connecter en tant qu'employé
    cy.login(testEmployee.email, testEmployee.password);

    // Accéder au scanner de billets
    cy.contains('Scanner de billets').click();

    // Simuler le scan d'un QR code avec une signature valide mais une clé incorrecte
    cy.get('#manual-ticket-id').type('TAMPERED-TICKET-123456');
    cy.contains('button', 'Vérifier manuellement').click();

    // Vérifier que le système de sécurité à double clé détecte la fraude
    cy.contains('Billet invalide').should('be.visible');
    cy.contains('Signature incorrecte').should('be.visible');
    cy.contains('Possible tentative de fraude').should('be.visible');
    cy.contains('Entrée refusée').should('be.visible');

    // Vérifier que l'incident est enregistré
    cy.contains('Historique').click();
    cy.contains('Tentative de fraude détectée').should('be.visible');
  });
});
