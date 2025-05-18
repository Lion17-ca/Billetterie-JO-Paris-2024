import axios from 'axios';
import { authApi, ticketApi, adminApi, validationApi } from '../apiConfig';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = {
  hostname: 'localhost'
};

describe('API Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  test('les instances d\'API sont correctement créées', () => {
    expect(axios.create).toHaveBeenCalledTimes(4);
    
    // Vérifier que les URL de base sont correctes
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'http://localhost:8080/auth',
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    }));
    
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'http://localhost:8080/tickets',
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    }));
    
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'http://localhost:8080/admin',
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    }));
    
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'http://localhost:8080/validation',
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    }));
  });

  test('les intercepteurs de requête sont configurés', () => {
    const mockAxiosInstance = axios.create();
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
  });

  test('les intercepteurs de réponse sont configurés', () => {
    const mockAxiosInstance = axios.create();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  test('l\'intercepteur de requête ajoute le token d\'authentification', () => {
    // Simuler un token dans localStorage
    const token = 'fake-jwt-token';
    localStorageMock.getItem.mockReturnValue(token);
    
    // Récupérer la fonction d'intercepteur
    const mockAxiosInstance = axios.create();
    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    
    // Créer une configuration de requête fictive
    const config = { headers: {} };
    
    // Appeler l'intercepteur
    const result = requestInterceptor(config);
    
    // Vérifier que le token a été ajouté
    expect(result.headers.Authorization).toBe(`Bearer ${token}`);
  });

  test('l\'intercepteur de réponse gère les erreurs 401', () => {
    // Récupérer la fonction d'intercepteur d'erreur
    const mockAxiosInstance = axios.create();
    const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    
    // Sauvegarder la localisation d'origine
    const originalHref = window.location.href;
    window.location.href = '';
    
    // Créer une erreur 401 fictive pour une route non-auth
    const error = {
      response: { status: 401 },
      config: { url: '/users/me' }
    };
    
    // Appeler l'intercepteur d'erreur
    try {
      responseErrorInterceptor(error);
    } catch (e) {
      // L'intercepteur rejette la promesse, donc on s'attend à une erreur
    }
    
    // Vérifier que localStorage.removeItem a été appelé
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    
    // Vérifier que la redirection a été effectuée
    expect(window.location.href).toBe('/login');
    
    // Restaurer la localisation
    window.location.href = originalHref;
  });

  test('l\'intercepteur de réponse ne redirige pas pour les routes d\'authentification', () => {
    // Récupérer la fonction d'intercepteur d'erreur
    const mockAxiosInstance = axios.create();
    const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    
    // Sauvegarder la localisation d'origine
    const originalHref = window.location.href;
    window.location.href = '';
    
    // Créer une erreur 401 fictive pour une route d'auth
    const error = {
      response: { status: 401 },
      config: { url: '/token' }
    };
    
    // Appeler l'intercepteur d'erreur
    try {
      responseErrorInterceptor(error);
    } catch (e) {
      // L'intercepteur rejette la promesse, donc on s'attend à une erreur
    }
    
    // Vérifier que localStorage.removeItem n'a pas été appelé
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    
    // Vérifier que la redirection n'a pas été effectuée
    expect(window.location.href).toBe('');
    
    // Restaurer la localisation
    window.location.href = originalHref;
  });
});
