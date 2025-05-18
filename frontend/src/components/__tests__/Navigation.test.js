import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../Navigation';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.addEventListener
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

describe('Navigation Component', () => {
  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock des événements
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;
    
    // Mock de dispatchEvent
    window.dispatchEvent = jest.fn();
  });

  afterEach(() => {
    // Restaurer les fonctions originales
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  test('affiche les liens de connexion et d\'inscription quand l\'utilisateur n\'est pas authentifié', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    // Vérifier que les liens de connexion et d'inscription sont présents
    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    expect(screen.getByText(/Inscription/i)).toBeInTheDocument();
    
    // Vérifier que les liens réservés aux utilisateurs authentifiés ne sont pas présents
    expect(screen.queryByText(/Déconnexion/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mon Profil/i)).not.toBeInTheDocument();
  });

  test('affiche les liens utilisateur quand l\'utilisateur est authentifié', () => {
    // Simuler un utilisateur authentifié
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'is_employee') return 'false';
      if (key === 'is_admin') return 'false';
      return null;
    });
    
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    // Vérifier que les liens utilisateur sont présents
    expect(screen.getByText(/Déconnexion/i)).toBeInTheDocument();
    expect(screen.getByText(/Mon Profil/i)).toBeInTheDocument();
    expect(screen.getByText(/Mes Billets/i)).toBeInTheDocument();
    expect(screen.getByText(/Panier/i)).toBeInTheDocument();
    
    // Vérifier que les liens de connexion et d'inscription ne sont pas présents
    expect(screen.queryByText(/Connexion/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Inscription/i)).not.toBeInTheDocument();
  });

  test('affiche les liens employé quand l\'utilisateur est un employé', () => {
    // Simuler un employé authentifié
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'is_employee') return 'true';
      if (key === 'is_admin') return 'false';
      return null;
    });
    
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    // Vérifier que les liens employé sont présents
    expect(screen.getByText(/Employé/i)).toBeInTheDocument();
    expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
    expect(screen.getByText(/Scanner de billets/i)).toBeInTheDocument();
    expect(screen.getByText(/Historique/i)).toBeInTheDocument();
    
    // Vérifier que les liens utilisateur ne sont pas présents
    expect(screen.queryByText(/Mes Billets/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Panier/i)).not.toBeInTheDocument();
  });

  test('affiche les liens admin quand l\'utilisateur est un administrateur', () => {
    // Simuler un admin authentifié
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'is_employee') return 'false';
      if (key === 'is_admin') return 'true';
      return null;
    });
    
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    // Vérifier que les liens admin sont présents
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
    expect(screen.getByText(/Gérer les offres/i)).toBeInTheDocument();
    expect(screen.getByText(/Rapports de vente/i)).toBeInTheDocument();
    
    // Vérifier que les liens utilisateur ne sont pas présents
    expect(screen.queryByText(/Mes Billets/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Panier/i)).not.toBeInTheDocument();
  });

  test('appelle handleLogout quand le bouton de déconnexion est cliqué', () => {
    // Simuler un utilisateur authentifié
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'is_employee') return 'false';
      if (key === 'is_admin') return 'false';
      return null;
    });
    
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    // Cliquer sur le bouton de déconnexion
    fireEvent.click(screen.getByText(/Déconnexion/i));
    
    // Vérifier que localStorage.removeItem a été appelé pour supprimer les informations d'authentification
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('is_employee');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('is_admin');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_email');
    
    // Vérifier que window.dispatchEvent a été appelé pour informer les autres composants
    expect(window.dispatchEvent).toHaveBeenCalled();
    
    // Vérifier que navigate a été appelé pour rediriger vers la page d'accueil
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  test('ajoute et supprime les écouteurs d\'événements au montage et au démontage', () => {
    const { unmount } = render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    // Vérifier que addEventListener a été appelé
    expect(mockAddEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    
    // Simuler le démontage du composant
    unmount();
    
    // Vérifier que removeEventListener a été appelé
    expect(mockRemoveEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
  });

  test('met à jour l\'état d\'authentification quand localStorage change', () => {
    // Simuler un utilisateur non authentifié
    localStorageMock.getItem.mockReturnValue(null);
    
    const { rerender } = render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    // Vérifier que les liens de connexion sont présents
    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    
    // Simuler un changement dans localStorage (utilisateur authentifié)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'is_employee') return 'false';
      if (key === 'is_admin') return 'false';
      return null;
    });
    
    // Récupérer la fonction de callback de l'écouteur d'événements
    const storageCallback = mockAddEventListener.mock.calls.find(call => call[0] === 'storage')[1];
    
    // Appeler la fonction de callback
    storageCallback();
    
    // Forcer le re-rendu du composant
    rerender(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    // Vérifier que les liens utilisateur sont maintenant présents
    expect(screen.getByText(/Déconnexion/i)).toBeInTheDocument();
  });
});
