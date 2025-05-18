import axios from 'axios';

// Création d'instances axios pour chaque service avec leurs intercepteurs
const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercepteur pour ajouter le token d'authentification à chaque requête
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur pour gérer les erreurs de réponse
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Gérer les erreurs 401 (non autorisé) en redirigeant vers la page de connexion
      // sauf pour les routes d'authentification (/token, /register)
      if (error.response && error.response.status === 401) {
        const isAuthRoute = error.config.url.includes('/token') || error.config.url.includes('/register');
        
        if (!isAuthRoute) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Déterminer l'hôte actuel (utiliser le hostname actuel au lieu de localhost codé en dur)
const isRailway = typeof process !== 'undefined' && process.env && process.env.RAILWAY_ENVIRONMENT;
const currentHost = window.location.hostname;

// Utiliser l'API Gateway comme point d'entrée principal
// En production sur Railway, utiliser le domaine public sans port
// En développement, utiliser le port 8080
const apiGatewayUrl = isRailway 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || currentHost}` 
  : `http://${currentHost}:8080`;

// Création des instances pour chaque service via l'API Gateway
export const authApi = createApiInstance(`${apiGatewayUrl}/auth`);
export const ticketApi = createApiInstance(`${apiGatewayUrl}/tickets`);
export const adminApi = createApiInstance(`${apiGatewayUrl}/admin`);
export const validationApi = createApiInstance(`${apiGatewayUrl}/validation`);

export default {
  authApi,
  ticketApi,
  adminApi,
  validationApi
};
