import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OffersList from '../OffersList';

// Mock du service d'API
jest.mock('../../services/api', () => ({
  getOffers: jest.fn().mockResolvedValue([
    { 
      id: 1, 
      name: 'Finale Natation', 
      description: 'Finale de natation 100m nage libre',
      price: 150, 
      type: 'solo',
      event_date: '2024-08-10T19:00:00Z',
      quantity: 100
    },
    { 
      id: 2, 
      name: 'Demi-finale Basketball', 
      description: 'Demi-finale du tournoi de basketball',
      price: 200, 
      type: 'duo',
      event_date: '2024-08-08T15:30:00Z',
      quantity: 50
    },
    { 
      id: 3, 
      name: 'Cérémonie d\'ouverture', 
      description: 'Cérémonie d\'ouverture des Jeux Olympiques',
      price: 500, 
      type: 'familiale',
      event_date: '2024-07-26T20:00:00Z',
      quantity: 20
    }
  ]),
  addToCart: jest.fn().mockResolvedValue({ success: true })
}));

describe('OffersList Component', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  test('renders offers list correctly', async () => {
    render(
      <BrowserRouter>
        <OffersList />
      </BrowserRouter>
    );
    
    // Vérifier que le titre de la page est présent
    expect(screen.getByText(/Offres disponibles/i)).toBeInTheDocument();
    
    // Vérifier que les offres sont affichées
    await waitFor(() => {
      expect(screen.getByText('Finale Natation')).toBeInTheDocument();
      expect(screen.getByText('Demi-finale Basketball')).toBeInTheDocument();
      expect(screen.getByText('Cérémonie d\'ouverture')).toBeInTheDocument();
    });
    
    // Vérifier que les prix sont affichés
    expect(screen.getByText('150 €')).toBeInTheDocument();
    expect(screen.getByText('200 €')).toBeInTheDocument();
    expect(screen.getByText('500 €')).toBeInTheDocument();
    
    // Vérifier que les types d'offres sont affichés
    expect(screen.getByText(/solo/i)).toBeInTheDocument();
    expect(screen.getByText(/duo/i)).toBeInTheDocument();
    expect(screen.getByText(/familiale/i)).toBeInTheDocument();
  });

  test('filters offers by type correctly', async () => {
    render(
      <BrowserRouter>
        <OffersList />
      </BrowserRouter>
    );
    
    // Attendre que les offres soient chargées
    await waitFor(() => {
      expect(screen.getByText('Finale Natation')).toBeInTheDocument();
    });
    
    // Cliquer sur le filtre pour les offres solo
    fireEvent.click(screen.getByLabelText(/Solo/i));
    
    // Vérifier que seule l'offre solo est affichée
    expect(screen.getByText('Finale Natation')).toBeInTheDocument();
    expect(screen.queryByText('Demi-finale Basketball')).not.toBeInTheDocument();
    expect(screen.queryByText('Cérémonie d\'ouverture')).not.toBeInTheDocument();
    
    // Cliquer sur le filtre pour les offres duo
    fireEvent.click(screen.getByLabelText(/Duo/i));
    
    // Vérifier que seule l'offre duo est affichée
    expect(screen.queryByText('Finale Natation')).not.toBeInTheDocument();
    expect(screen.getByText('Demi-finale Basketball')).toBeInTheDocument();
    expect(screen.queryByText('Cérémonie d\'ouverture')).not.toBeInTheDocument();
  });

  test('adds offer to cart when clicking on add button', async () => {
    const { addToCart } = require('../../services/api');
    
    render(
      <BrowserRouter>
        <OffersList />
      </BrowserRouter>
    );
    
    // Attendre que les offres soient chargées
    await waitFor(() => {
      expect(screen.getByText('Finale Natation')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton pour ajouter la première offre au panier
    const addButtons = screen.getAllByRole('button', { name: /Ajouter au panier/i });
    fireEvent.click(addButtons[0]);
    
    // Vérifier que la fonction d'ajout au panier a été appelée avec le bon ID
    await waitFor(() => {
      expect(addToCart).toHaveBeenCalledWith(1);
    });
    
    // Vérifier qu'une notification de succès s'affiche
    expect(screen.getByText(/Offre ajoutée au panier/i)).toBeInTheDocument();
  });

  test('sorts offers by price correctly', async () => {
    render(
      <BrowserRouter>
        <OffersList />
      </BrowserRouter>
    );
    
    // Attendre que les offres soient chargées
    await waitFor(() => {
      expect(screen.getByText('Finale Natation')).toBeInTheDocument();
    });
    
    // Sélectionner le tri par prix croissant
    fireEvent.change(screen.getByLabelText(/Trier par/i), {
      target: { value: 'price_asc' }
    });
    
    // Vérifier l'ordre des offres (prix croissant)
    const offerCards = screen.getAllByTestId('offer-card');
    expect(offerCards[0]).toHaveTextContent('Finale Natation');
    expect(offerCards[1]).toHaveTextContent('Demi-finale Basketball');
    expect(offerCards[2]).toHaveTextContent('Cérémonie d\'ouverture');
    
    // Sélectionner le tri par prix décroissant
    fireEvent.change(screen.getByLabelText(/Trier par/i), {
      target: { value: 'price_desc' }
    });
    
    // Vérifier l'ordre des offres (prix décroissant)
    const offerCardsDesc = screen.getAllByTestId('offer-card');
    expect(offerCardsDesc[0]).toHaveTextContent('Cérémonie d\'ouverture');
    expect(offerCardsDesc[1]).toHaveTextContent('Demi-finale Basketball');
    expect(offerCardsDesc[2]).toHaveTextContent('Finale Natation');
  });
});
