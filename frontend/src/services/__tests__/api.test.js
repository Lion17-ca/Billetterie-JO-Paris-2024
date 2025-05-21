import { login, getOffers, addToCart, getCart, buyTicket } from '../api';
import apiConfig from '../apiConfig';

// Mock de fetch
global.fetch = jest.fn();

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('calls correct endpoint with credentials and returns token', async () => {
      const mockResponse = {
        access_token: 'fake-token',
        token_type: 'bearer',
        is_admin: false,
        is_employee: false
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await login('test@example.com', 'password123');
      
      // Vérifier que fetch a été appelé avec les bons arguments
      expect(fetch).toHaveBeenCalledWith(
        `${apiConfig.baseUrl}/auth/token`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        })
      );
      
      // Vérifier que le token a été stocké dans localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('is_admin', 'false');
      expect(localStorage.setItem).toHaveBeenCalledWith('is_employee', 'false');
      
      // Vérifier que la fonction retourne la réponse attendue
      expect(result).toEqual(mockResponse);
    });

    test('throws error when credentials are invalid', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Invalid credentials' })
      });

      await expect(login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getOffers', () => {
    test('retrieves offers list correctly', async () => {
      const mockOffers = [
        { id: 1, name: 'Offer 1', price: 100 },
        { id: 2, name: 'Offer 2', price: 200 }
      ];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOffers
      });

      const result = await getOffers();
      
      // Vérifier que fetch a été appelé avec les bons arguments
      expect(fetch).toHaveBeenCalledWith(
        `${apiConfig.baseUrl}/tickets/offers/`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      );
      
      // Vérifier que la fonction retourne les offres attendues
      expect(result).toEqual(mockOffers);
    });

    test('throws error when API request fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Server error' })
      });

      await expect(getOffers()).rejects.toThrow('Server error');
    });
  });

  describe('addToCart', () => {
    test('adds offer to cart correctly', async () => {
      localStorage.setItem('token', 'fake-token');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await addToCart(1);
      
      // Vérifier que fetch a été appelé avec les bons arguments
      expect(fetch).toHaveBeenCalledWith(
        `${apiConfig.baseUrl}/tickets/cart/add`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ offer_id: 1 })
        })
      );
    });

    test('throws error when not authenticated', async () => {
      localStorage.removeItem('token');
      
      await expect(addToCart(1)).rejects.toThrow('Authentication required');
    });
  });

  describe('getCart', () => {
    test('retrieves cart correctly when authenticated', async () => {
      localStorage.setItem('token', 'fake-token');
      
      const mockCart = {
        items: [{ id: 1, offer: { name: 'Offer 1', price: 100 }, quantity: 2 }],
        total: 200
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart
      });

      const result = await getCart();
      
      // Vérifier que fetch a été appelé avec les bons arguments
      expect(fetch).toHaveBeenCalledWith(
        `${apiConfig.baseUrl}/tickets/cart/`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-token'
          })
        })
      );
      
      // Vérifier que la fonction retourne le panier attendu
      expect(result).toEqual(mockCart);
    });

    test('throws error when not authenticated', async () => {
      localStorage.removeItem('token');
      
      await expect(getCart()).rejects.toThrow('Authentication required');
    });
  });

  describe('buyTicket', () => {
    test('processes purchase correctly when authenticated', async () => {
      localStorage.setItem('token', 'fake-token');
      
      const mockResponse = {
        success: true,
        tickets: [{ id: 1, qr_code: 'data:image/png;base64,abc123' }]
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await buyTicket({ payment_method: 'credit_card' });
      
      // Vérifier que fetch a été appelé avec les bons arguments
      expect(fetch).toHaveBeenCalledWith(
        `${apiConfig.baseUrl}/tickets/purchase`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ payment_method: 'credit_card' })
        })
      );
      
      // Vérifier que la fonction retourne la réponse attendue
      expect(result).toEqual(mockResponse);
    });

    test('throws error when not authenticated', async () => {
      localStorage.removeItem('token');
      
      await expect(buyTicket({})).rejects.toThrow('Authentication required');
    });

    test('throws error when payment fails', async () => {
      localStorage.setItem('token', 'fake-token');
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Payment failed' })
      });

      await expect(buyTicket({})).rejects.toThrow('Payment failed');
    });
  });
});
