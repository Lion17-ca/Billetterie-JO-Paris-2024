import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Vérifie les rôles de l'utilisateur et retourne un objet contenant les informations d'authentification
 * @returns {Object} Objet contenant isAuthenticated, isAdmin, isEmployee
 */
const checkUserRoles = () => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  const isEmployee = localStorage.getItem('is_employee') === 'true';
  
  return { isAuthenticated, isAdmin, isEmployee };
};

/**
 * Composant pour protéger les routes utilisateur (accueil, offres, etc.)
 * Redirige les employés et administrateurs vers leurs tableaux de bord respectifs
 */
export const UserRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isEmployee } = checkUserRoles();

  // Priorité 1: Si l'utilisateur est un administrateur, le rediriger vers le tableau de bord admin
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Priorité 2: Si l'utilisateur est un employé (mais pas un admin), le rediriger vers le tableau de bord employé
  if (isAuthenticated && isEmployee && !isAdmin) {
    return <Navigate to="/employee-dashboard" replace />;
  }

  // Sinon, afficher le contenu normal
  return children;
};

/**
 * Composant pour protéger les routes employé
 * Redirige les utilisateurs non-employés vers la page de connexion
 * Redirige les administrateurs vers leur propre tableau de bord
 */
export const EmployeeRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isEmployee } = checkUserRoles();

  // Priorité 1: Si c'est un admin, le rediriger vers le tableau de bord admin
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }
  
  // Priorité 2: Si ce n'est pas un employé ou pas authentifié, rediriger vers login
  if (!isAuthenticated || !isEmployee) {
    return <Navigate to="/login" replace />;
  }

  // Si c'est un employé (mais pas un admin), afficher le contenu
  return children;
};

/**
 * Composant pour protéger les routes administrateur
 * Redirige les utilisateurs non-administrateurs vers la page de connexion
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = checkUserRoles();

  // Si ce n'est pas un admin ou pas authentifié, rediriger vers login
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // Si c'est un admin, afficher le contenu
  return children;
};

/**
 * Composant pour protéger les routes qui nécessitent une authentification
 * Redirige les utilisateurs non connectés vers la page de connexion
 */
export const AuthRoute = ({ children }) => {
  const { isAuthenticated } = checkUserRoles();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default {
  UserRoute,
  EmployeeRoute,
  AdminRoute,
  AuthRoute
};
