import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Composant pour protéger les routes utilisateur (accueil, offres, etc.)
// Redirige les employés et administrateurs vers leurs tableaux de bord respectifs
export const UserRoute = ({ children }) => {
  const isEmployee = localStorage.getItem('is_employee') === 'true';
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  const isAuthenticated = localStorage.getItem('token') !== null;
  const location = useLocation();

  // Si l'utilisateur est un administrateur, le rediriger vers le tableau de bord admin
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Si l'utilisateur est un employé (mais pas un admin), le rediriger vers le tableau de bord employé
  if (isAuthenticated && isEmployee) {
    return <Navigate to="/employee-dashboard" replace />;
  }

  // Sinon, afficher le contenu normal
  return children;
};

// Composant pour protéger les routes employé
// Redirige les utilisateurs non-employés vers la page d'accueil
export const EmployeeRoute = ({ children }) => {
  const isEmployee = localStorage.getItem('is_employee') === 'true';
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated || !isEmployee) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Composant pour protéger les routes administrateur
// Redirige les utilisateurs non-administrateurs vers la page d'accueil
export const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Composant pour protéger les routes qui nécessitent une authentification
// Redirige les utilisateurs non connectés vers la page de connexion
export const AuthRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;

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
