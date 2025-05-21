import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../Cart';

// Mock du service d'API
jest.mock('../../services/api', () => ({
  getCart: jest.fn().mockResolvedValue({
    items: [
      { 
        id: 1, 
        offer: { 
          id: 101, 
          name: 'Finale Natation', 
          price: 150, 
          type: 'solo' 
        }, 
        quantity: 2 
      },
      { 
        id: 2, 
        offer: { 
          id: 102, 
          name: 'Demi-finale Basketball', 
          price: 200, 
          type: 'duo' 
        }, 
        quantity: 1 
      }
    ],
    total: 500
  }),
  updateCartItem: jest.fn().mockResolvedValue({ success: true }),
  removeCartItem: jest.fn().mockResolvedValue({ success: true })
}));

// Mock du hook de navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('Cart Component', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  test('renders cart with items correctly', async () => {
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );
    
    // Vérifier que les éléments du panier sont affichés
    await waitFor(() => {
      expect(screen.getByText('Finale Natation')).toBeInTheDocument();
      expect(screen.getByText('Demi-finale Basketball')).toBeInTheDocument();
      expect(screen.getByText('500 €')).toBeInTheDocument();
    });
    
    // Vérifier que les quantités sont correctes
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(2);
    expect(screen.getAllByRole('spinbutton')[1]).toHaveValue(1);
    
    // Vérifier que les boutons de suppression sont présents
    expect(screen.getAllByRole('button', { name: /Supprimer/i })).toHaveLength(2);
  });

  test('handles quantity update correctly', async () => {
    const { updateCartItem } = require('../../services/api');
    
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );
    
    // Attendre que les éléments du panier soient chargés
    await waitFor(() => {
      expect(screen.getByText('Finale Natation')).toBeInTheDocument();
    });
    
    // Modifier la quantité du premier article
    fireEvent.change(screen.getAllByRole('spinbutton')[0], {
      target: { value: 3 }
    });
    
    // Vérifier que la fonction de mise à jour a été appelée avec les bons arguments
    await waitFor(() => {
      expect(updateCartItem).toHaveBeenCalledWith(1, 3);
    });
  });

  test('handles item removal correctly', async () => {
    const { removeCartItem } = require('../../services/api');
    
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );
    
    // Attendre que les éléments du panier soient chargés
    await waitFor(() => {
      expect(screen.getByText('Finale Natation')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton de suppression du premier article
    fireEvent.click(screen.getAllByRole('button', { name: /Supprimer/i })[0]);
    
    // Vérifier que la fonction de suppression a été appelée avec le bon ID
    await waitFor(() => {
      expect(removeCartItem).toHaveBeenCalledWith(1);
    });
  });

  test('navigates to checkout when clicking on checkout button', async () => {
    const navigate = require('react-router-dom').useNavigate();
    
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );
    
    // Attendre que les éléments du panier soient chargés
    await waitFor(() => {
      expect(screen.getByText('Finale Natation')).toBeInTheDocument();
    });
    
    // Cliquer sur le bouton pour procéder au paiement
    fireEvent.click(screen.getByRole('button', { name: /Procéder au paiement/i }));
    
    // Vérifier que la navigation a été appelée avec le bon chemin
    expect(navigate).toHaveBeenCalledWith('/checkout');
  });

  test('displays empty cart message when no items', async () => {
    const { getCart } = require('../../services/api');
    getCart.mockResolvedValueOnce({ items: [], total: 0 });
    
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );
    
    // Vérifier que le message de panier vide s'affiche
    await waitFor(() => {
      expect(screen.getByText(/Votre panier est vide/i)).toBeInTheDocument();
    });
    
    // Vérifier que le bouton pour continuer les achats est présent
    expect(screen.getByRole('link', { name: /Continuer les achats/i })).toBeInTheDocument();
  });
});
