import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

// Mock des composants utilisés dans Home
jest.mock('../../components/CookieConsent', () => () => <div data-testid="cookie-consent" />);

describe('Home Component', () => {
  test('renders the home page with welcome message', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Vérifier que le titre principal est présent
    expect(screen.getByText(/Bienvenue sur la billetterie officielle/i)).toBeInTheDocument();
    
    // Vérifier que la section des épreuves est présente
    expect(screen.getByText(/Découvrez les épreuves/i)).toBeInTheDocument();
    
    // Vérifier que le bouton pour voir les offres est présent
    expect(screen.getByRole('link', { name: /Voir les offres/i })).toBeInTheDocument();
  });

  test('renders the featured events section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Vérifier que la section des événements en vedette est présente
    expect(screen.getByText(/Événements en vedette/i)).toBeInTheDocument();
    
    // Vérifier que les cartes d'événements sont présentes
    const eventCards = screen.getAllByRole('article');
    expect(eventCards.length).toBeGreaterThan(0);
  });

  test('renders the cookie consent component', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Vérifier que le composant de consentement aux cookies est présent
    expect(screen.getByTestId('cookie-consent')).toBeInTheDocument();
  });
});
