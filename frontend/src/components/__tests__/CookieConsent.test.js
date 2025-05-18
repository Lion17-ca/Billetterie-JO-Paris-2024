import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CookieConsent from '../CookieConsent';
import { BrowserRouter } from 'react-router-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console.log pour éviter la pollution des logs de test
console.log = jest.fn();

describe('CookieConsent Component', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  test('affiche la modale si aucun consentement n\'est stocké', () => {
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    
    // Vérifier que la modale est affichée
    expect(screen.getByText(/Nous utilisons des cookies/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accepter tous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Personnaliser/i })).toBeInTheDocument();
  });

  test('vérifie que localStorage.getItem est appelé pour vérifier le consentement', () => {
    // Configurer le mock pour simuler qu'aucun consentement n'existe
    localStorage.getItem.mockReturnValue(null);
    
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    
    // Vérifier que localStorage.getItem a été appelé avec 'cookieConsent'
    expect(localStorage.getItem).toHaveBeenCalledWith('cookieConsent');
  });

  test('ouvre les options de personnalisation quand "Personnaliser" est cliqué', () => {
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    // Trouver le bouton Personnaliser
    const personalizeButton = screen.getByRole('button', { name: /Personnaliser/i });
    fireEvent.click(personalizeButton);
    
    // Après avoir cliqué sur "Personnaliser", les options de cookies devraient être visibles
    // Vérifier que les options de personnalisation sont affichées
    expect(screen.getByText(/Ces cookies sont nécessaires au fonctionnement du site/i)).toBeInTheDocument();
  });

  test('vérifie que localStorage est appelé quand "Accepter tous" est cliqué', () => {
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    
    // Trouver le bouton Accepter tous
    const acceptAllButton = screen.getByRole('button', { name: /Accepter tous/i });
    
    // Cliquer sur le bouton
    fireEvent.click(acceptAllButton);
    
    // Vérifier que localStorage a été appelé
    expect(localStorage.setItem).toHaveBeenCalledWith('cookieConsent', expect.any(String));
    expect(localStorage.setItem).toHaveBeenCalledWith('cookieConsentDate', expect.any(String));
  });

  test('vérifie que le badge Obligatoire est présent pour les cookies nécessaires', () => {
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    
    // Trouver le bouton Personnaliser
    const personalizeButton = screen.getByRole('button', { name: /Personnaliser/i });
    fireEvent.click(personalizeButton);
    
    // Vérifier que le badge "Obligatoire" est présent
    expect(screen.getByText(/Obligatoire/i)).toBeInTheDocument();
  });

  test('contient un lien vers la politique de confidentialité', () => {
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    
    // Vérifier que le lien vers la politique de confidentialité est présent
    const privacyLink = screen.getByText(/Politique de confidentialité/i);
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink.tagName).toBe('A');
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
  });

  test('vérifie que localStorage est appelé quand "Refuser tous" est cliqué', () => {
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    
    // Trouver le bouton Refuser tous
    const rejectAllButton = screen.getByRole('button', { name: /Refuser tous/i });
    
    // Cliquer sur le bouton
    fireEvent.click(rejectAllButton);
    
    // Vérifier que localStorage a été appelé
    expect(localStorage.setItem).toHaveBeenCalledWith('cookieConsent', expect.any(String));
    expect(localStorage.setItem).toHaveBeenCalledWith('cookieConsentDate', expect.any(String));
  });

  test('vérifie que le bouton "Accepter la sélection" apparaît après avoir cliqué sur "Personnaliser"', () => {
    render(
      <BrowserRouter>
        <CookieConsent />
      </BrowserRouter>
    );
    
    // Le bouton ne devrait pas être visible initialement
    expect(screen.queryByText(/Accepter la sélection/i)).not.toBeInTheDocument();
    
    // Cliquer sur "Personnaliser"
    const personalizeButton = screen.getByRole('button', { name: /Personnaliser/i });
    fireEvent.click(personalizeButton);
    
    // Maintenant le bouton devrait être visible
    expect(screen.getByText(/Accepter la sélection/i)).toBeInTheDocument();
  });
});
