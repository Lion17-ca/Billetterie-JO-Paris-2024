# Stratégie de Tests pour le Système de Billetterie JO

## Tests Unitaires

### Backend (Python/FastAPI)

#### Service d'Authentification
- Tests des fonctions de hachage et vérification des mots de passe
- Tests de génération et validation des tokens JWT
- Tests de la logique d'authentification à deux facteurs
- Tests de génération de la première clé de sécurité

```python
# Exemple de test unitaire pour la vérification de mot de passe
def test_password_verification():
    # Arrange
    password = "SecurePassword123!"
    hashed = hash_password(password)
    
    # Act
    result = verify_password(password, hashed)
    
    # Assert
    assert result is True
    assert verify_password("WrongPassword", hashed) is False
```

#### Service de Billetterie
- Tests de création et récupération des offres
- Tests de génération des QR codes
- Tests de génération de la deuxième clé de sécurité
- Tests de la logique d'achat de billets

#### Service d'Administration
- Tests des fonctions de reporting
- Tests de gestion des offres
- Tests des tableaux de bord analytiques

#### Service de Validation
- Tests de vérification des signatures des billets
- Tests de validation des QR codes
- Tests de la logique d'invalidation après utilisation

### Frontend (React)

#### Tests de Composants
- Tests des formulaires (inscription, connexion, achat)
- Tests des composants d'affichage des billets
- Tests des composants de navigation
- Tests des modales (consentement aux cookies, etc.)

```javascript
// Exemple de test unitaire pour le composant CookieConsent
import { render, screen, fireEvent } from '@testing-library/react';
import CookieConsent from '../components/CookieConsent';

test('accepte tous les cookies quand le bouton est cliqué', () => {
  // Arrange
  const mockSetConsent = jest.fn();
  render(<CookieConsent setConsent={mockSetConsent} />);
  
  // Act
  fireEvent.click(screen.getByText('Accepter tous'));
  
  // Assert
  expect(mockSetConsent).toHaveBeenCalledWith(true);
  expect(localStorage.getItem('cookieConsent')).toBe('true');
});
```

## Tests d'Intégration

### Tests Inter-Services
- Test du flux complet d'achat de billet (auth → tickets)
- Test du flux de validation de billet (validation → auth → tickets)
- Test du flux de reporting (admin → tickets)

```python
# Exemple de test d'intégration pour l'achat de billet
def test_ticket_purchase_flow():
    # Arrange
    user = create_test_user()
    login_response = client.post("/auth/login", json={"email": user.email, "password": "password123"})
    token = login_response.json()["token"]
    
    # Act
    purchase_response = client.post(
        "/tickets/purchase",
        headers={"Authorization": f"Bearer {token}"},
        json={"event_id": 1, "quantity": 2}
    )
    
    # Assert
    assert purchase_response.status_code == 200
    assert "ticket_id" in purchase_response.json()
    assert "qr_code" in purchase_response.json()
    
    # Vérifier que le billet est bien enregistré
    user_tickets = client.get(
        "/tickets/my-tickets",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert len(user_tickets.json()) == 2
```

### Tests API Gateway
- Tests de routage des requêtes vers les bons services
- Tests d'authentification et d'autorisation au niveau de la gateway
- Tests de gestion des erreurs et timeouts

### Tests de Base de Données
- Tests de persistance des données entre les services
- Tests de cohérence des données après des opérations complexes
- Tests de performance des requêtes

## Tests End-to-End

### Scénarios Utilisateur
1. **Inscription et Connexion**
   - Création d'un compte utilisateur
   - Configuration de l'authentification à deux facteurs
   - Connexion avec 2FA

2. **Achat de Billets**
   - Navigation dans les offres disponibles
   - Sélection et achat d'un billet
   - Réception et visualisation du e-ticket avec QR code

3. **Validation sur Site**
   - Scan du QR code par un employé
   - Vérification de l'authenticité du billet
   - Validation et marquage comme utilisé

4. **Gestion Administrative**
   - Création de nouvelles offres
   - Visualisation des rapports de vente
   - Gestion des utilisateurs

### Outils Recommandés
- **Cypress** pour les tests E2E frontend
- **Selenium** pour les tests cross-browser
- **Postman/Newman** pour les tests API automatisés

```javascript
// Exemple de test Cypress pour le parcours d'achat
describe('Parcours d'achat de billet', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password123');
  });

  it('permet à un utilisateur d'acheter un billet', () => {
    // Naviguer vers la page des offres
    cy.visit('/offers');
    
    // Sélectionner un événement
    cy.contains('Finale Natation').click();
    
    // Ajouter au panier
    cy.get('[data-testid="add-to-cart"]').click();
    
    // Aller au panier
    cy.get('[data-testid="cart-icon"]').click();
    
    // Procéder au paiement
    cy.get('[data-testid="checkout-button"]').click();
    
    // Remplir les informations de paiement
    cy.get('#card-number').type('4242424242424242');
    cy.get('#expiry-date').type('1225');
    cy.get('#cvv').type('123');
    cy.get('#name-on-card').type('Test User');
    
    // Finaliser l'achat
    cy.get('[data-testid="pay-button"]').click();
    
    // Vérifier la confirmation
    cy.contains('Votre achat a été confirmé').should('be.visible');
    
    // Vérifier que le billet apparaît dans "Mes billets"
    cy.visit('/my-tickets');
    cy.contains('Finale Natation').should('be.visible');
    cy.get('[data-testid="qr-code"]').should('be.visible');
  });
});
```

## Tests d'Acceptation Utilisateur (UAT)

### Groupes de Test
- **Utilisateurs finaux** : acheteurs de billets potentiels
- **Personnel sur site** : employés qui scanneront les billets
- **Administrateurs** : gestionnaires des offres et rapports

### Scénarios de Test
1. **Pour les utilisateurs finaux**
   - Facilité d'inscription et de connexion
   - Clarté du processus d'achat
   - Facilité d'accès aux billets achetés
   - Compréhension des informations RGPD

2. **Pour le personnel sur site**
   - Rapidité et fiabilité du scan des billets
   - Clarté des informations affichées lors de la validation
   - Gestion des cas particuliers (billets déjà utilisés, etc.)

3. **Pour les administrateurs**
   - Facilité de création et modification des offres
   - Clarté et utilité des rapports générés
   - Efficacité de la gestion des utilisateurs

### Méthode de Collecte des Retours
- Questionnaires post-test
- Sessions d'observation
- Entretiens semi-directifs

## Plan d'Implémentation

### Phase 1 : Tests Unitaires
- Semaine 1-2 : Implémentation des tests unitaires backend
- Semaine 3-4 : Implémentation des tests unitaires frontend

### Phase 2 : Tests d'Intégration
- Semaine 5-6 : Implémentation des tests inter-services
- Semaine 7 : Tests API Gateway et base de données

### Phase 3 : Tests End-to-End
- Semaine 8-9 : Implémentation des scénarios E2E avec Cypress
- Semaine 10 : Tests cross-browser avec Selenium

### Phase 4 : Tests d'Acceptation Utilisateur
- Semaine 11 : Préparation des scénarios et recrutement des testeurs
- Semaine 12 : Sessions de test et collecte des retours
- Semaine 13 : Analyse des résultats et ajustements

## Métriques de Qualité

- **Couverture de code** : Objectif de 80% minimum pour les tests unitaires
- **Taux de réussite des tests** : Objectif de 100% pour les tests critiques
- **Temps d'exécution** : Optimisation pour que la suite complète s'exécute en moins de 30 minutes
- **Satisfaction utilisateur** : Score moyen de 4/5 minimum lors des tests d'acceptation
