import axios from 'axios';
import { authService, ticketService, adminService, validationService } from '../api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

describe('API Services', () => {
  let mockAxiosInstance;

  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();
    
    // Configurer le mock d'axios
    mockAxiosInstance = axios.create();
  });

  describe('authService', () => {
    test('register appelle authApi.post avec les bons paramètres', () => {
      const userData = { email: 'test@example.com', password: 'password123' };
      authService.register(userData);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/register', userData);
    });

    test('login appelle authApi.post avec les bons paramètres', () => {
      const credentials = 'username=test@example.com&password=password123';
      authService.login(credentials);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/token', credentials, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    });

    test('setupMFA appelle authApi.post avec les bons paramètres', () => {
      authService.setupMFA();
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/mfa/setup');
    });

    test('verifyMFA appelle authApi.post avec les bons paramètres', () => {
      const token = '123456';
      authService.verifyMFA(token);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/mfa/verify', { token });
    });

    test('getCurrentUser appelle authApi.get avec les bons paramètres', () => {
      authService.getCurrentUser();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me');
    });

    test('updateProfile appelle authApi.put avec les bons paramètres', () => {
      const userData = { name: 'Test User', email: 'test@example.com' };
      authService.updateProfile(userData);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/me', userData);
    });

    test('changePassword appelle authApi.post avec les bons paramètres', () => {
      const passwordData = { old_password: 'old', new_password: 'new' };
      authService.changePassword(passwordData);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/me/change-password', passwordData);
    });
  });

  describe('ticketService', () => {
    test('getOffers appelle ticketApi.get avec les bons paramètres', () => {
      ticketService.getOffers();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/offers');
    });

    test('getOffer appelle ticketApi.get avec les bons paramètres', () => {
      const offerId = '123';
      ticketService.getOffer(offerId);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/offers/${offerId}`);
    });

    test('createTicket appelle ticketApi.post avec les bons paramètres', () => {
      const ticketData = { offer_id: '123', quantity: 2 };
      ticketService.createTicket(ticketData);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tickets/', ticketData);
    });

    test('getUserTickets appelle ticketApi.get avec les bons paramètres', () => {
      const userId = '123';
      ticketService.getUserTickets(userId);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/tickets/user/${userId}`);
    });

    test('getTicket appelle ticketApi.get avec les bons paramètres', () => {
      const ticketId = '123';
      ticketService.getTicket(ticketId);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/tickets/${ticketId}`);
    });

    test('getTicketQRCode appelle ticketApi.get avec les bons paramètres', () => {
      const ticketId = '123';
      ticketService.getTicketQRCode(ticketId);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/tickets/${ticketId}/qrcode`);
    });
  });

  describe('adminService', () => {
    test('getOffers appelle adminApi.get avec les bons paramètres', () => {
      adminService.getOffers();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/offers/');
    });

    test('createOffer appelle adminApi.post avec les bons paramètres', () => {
      const offerData = { name: 'Test Offer', price: 100 };
      adminService.createOffer(offerData);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/offers/', offerData);
    });

    test('updateOffer appelle adminApi.put avec les bons paramètres', () => {
      const offerId = '123';
      const offerData = { name: 'Updated Offer', price: 150 };
      adminService.updateOffer(offerId, offerData);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/offers/${offerId}`, offerData);
    });

    test('deleteOffer appelle adminApi.delete avec les bons paramètres', () => {
      const offerId = '123';
      adminService.deleteOffer(offerId);
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/offers/${offerId}`);
    });

    test('getSalesSummary appelle adminApi.get avec les bons paramètres', () => {
      adminService.getSalesSummary();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/sales/');
    });

    test('getOfferSales appelle adminApi.get avec les bons paramètres', () => {
      const offerId = '123';
      adminService.getOfferSales(offerId);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/sales/${offerId}`);
    });
  });

  describe('validationService', () => {
    test('validateTicket appelle validationApi.post avec les bons paramètres', () => {
      const validationData = { ticket_id: '123', employee_id: '456' };
      validationService.validateTicket(validationData);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/validate', validationData);
    });

    test('getValidations appelle validationApi.get avec les bons paramètres', () => {
      validationService.getValidations();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/validations/');
    });

    test('getEmployeeValidations appelle validationApi.get avec les bons paramètres', () => {
      const employeeId = '123';
      validationService.getEmployeeValidations(employeeId);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/validations/employee/${employeeId}`);
    });
  });
});
