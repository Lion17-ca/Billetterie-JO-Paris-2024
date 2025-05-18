import { authApi, ticketApi, adminApi, validationApi } from './apiConfig';

// Service d'authentification (port 8003)
export const authService = {
  register: (userData) => authApi.post('/register', userData),
  login: (credentials) => {
    console.log('Tentative de connexion avec:', credentials.toString());
    return authApi.post('/token', credentials, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  setupMFA: () => authApi.post('/mfa/setup'),
  verifyMFA: (token) => authApi.post('/mfa/verify', { token }),
  getCurrentUser: () => authApi.get('/users/me'),
  updateProfile: (userData) => authApi.put('/users/me', userData),
  changePassword: (passwordData) => authApi.post('/users/me/change-password', passwordData),
};

// Service de billetterie (port 8005)
export const ticketService = {
  getOffers: () => ticketApi.get('/offers'),
  getOffer: (offerId) => ticketApi.get(`/offers/${offerId}`),
  createTicket: (ticketData) => ticketApi.post('/tickets/', ticketData),
  getUserTickets: (userId) => ticketApi.get(`/tickets/user/${userId}`),
  getTicket: (ticketId) => ticketApi.get(`/tickets/${ticketId}`),
  getTicketQRCode: (ticketId) => ticketApi.get(`/tickets/${ticketId}/qrcode`),
};

// Service d'administration (port 8007)
export const adminService = {
  getOffers: () => adminApi.get('/offers/'),
  createOffer: (offerData) => adminApi.post('/offers/', offerData),
  updateOffer: (offerId, offerData) => adminApi.put(`/offers/${offerId}`, offerData),
  deleteOffer: (offerId) => adminApi.delete(`/offers/${offerId}`),
  getSalesSummary: () => adminApi.get('/sales/'),
  getOfferSales: (offerId) => adminApi.get(`/sales/${offerId}`),
};

// Service de validation (port 8008)
export const validationService = {
  validateTicket: (validationData) => validationApi.post('/validate', validationData),
  getValidations: () => validationApi.get('/validations/'),
  getEmployeeValidations: (employeeId) => validationApi.get(`/validations/employee/${employeeId}`),
};

export default {
  authService,
  ticketService,
  adminService,
  validationService
};
