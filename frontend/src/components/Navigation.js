import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Fonction pour vérifier l'état d'authentification
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const isEmployee = localStorage.getItem('is_employee') === 'true';
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    
    setIsAuthenticated(!!token);
    
    // Vérifier d'abord si l'utilisateur est un administrateur (priorité 1)
    if (isAdmin) {
      setUserRole('admin');
    } 
    // Ensuite, vérifier si l'utilisateur est un employé (priorité 2)
    else if (isEmployee) {
      setUserRole('employee');
    } 
    // Enfin, vérifier si l'utilisateur est connecté mais n'a pas de rôle spécial (priorité 3)
    else if (token) {
      setUserRole('user');
    } 
    // Si aucune des conditions n'est remplie, l'utilisateur n'est pas connecté
    else {
      setUserRole(null);
    }
  };
  
  // Vérifier l'état d'authentification au chargement initial
  useEffect(() => {
    checkAuthStatus();
    
    // Ajouter un écouteur d'événements pour détecter les changements dans localStorage
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Créer un intervalle pour vérifier régulièrement l'état d'authentification
    const authCheckInterval = setInterval(checkAuthStatus, 1000);
    
    // Nettoyer les écouteurs d'événements et l'intervalle lors du démontage
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(authCheckInterval);
    };
  }, []);

  const handleLogout = () => {
    // Supprimer toutes les informations d'authentification
    localStorage.removeItem('token');
    localStorage.removeItem('is_employee');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('user_email');
    
    // Mettre à jour l'état local
    setIsAuthenticated(false);
    setUserRole(null);
    
    // Déclencher un événement personnalisé pour informer les autres composants
    window.dispatchEvent(new Event('authChange'));
    
    // Rediriger vers la page d'accueil
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="olympic-navbar mb-4" variant="dark">
      <Container>
        {/* Logo et nom adaptés en fonction du type de compte */}
        {userRole === 'admin' ? (
          <Navbar.Brand as={Link} to="/admin-dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#dc3545" className="bi bi-shield-lock-fill me-2" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 62.7 62.7 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99A1.5 1.5 0 0 1 8 5"/>
            </svg>
            <span className="text-white">Panneau d'Administration</span>
          </Navbar.Brand>
        ) : userRole === 'employee' ? (
          <Navbar.Brand as={Link} to="/employee-dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#ffc107" className="bi bi-qr-code-scan me-2" viewBox="0 0 16 16">
              <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5M.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5M4 4h1v1H4zm2 0h1v1H6zm1 1h1v1H7zM4 6h1v1H4zm2 0h1v1H6zm1 1h1v1H7zm-3 1h1v1H4zm2 0h1v1H6zm1 1h1v1H7zm-3 1h1v1H4zm2 0h1v1H6zm1 1h1v1H7zm8-12h1v1h-1zm-1 1h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm-1 1h1v1h-1zm2 1h1v1h-1zm-1 1h1v1h-1zm-6-10h1v1H9zm2 0h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm-1 1h1v1H9zm2 0h1v1h-1zm-1 1h1v1h-1zM8 6h1v1H8zm2 0h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm-1 1h1v1H8zm2 0h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm-1 1h1v1H8zm2 0h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm-1 1h1v1H8z"/>
            </svg>
            <span className="text-white">Validation des Billets</span>
          </Navbar.Brand>
        ) : (
          <Navbar.Brand as={Link} to="/" className="logo-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="currentColor" className="bi bi-ticket-perforated-fill logo-icon" viewBox="0 0 16 16">
              <path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6zm4-1v1h1v-1zm1 3v-1H4v1zm7 0v-1h-1v1zm-1-2v1h1v-1zm-6 3H4v1h1zm7 1v-1h-1v1zm-7 1H4v1h1zm7 1v-1h-1v1zm-8 1v1h1v-1zm7 1h1v-1h-1z"/>
            </svg>
            <div className="brand-text-container">
              <span className="brand-title">Paris 2025</span>
              <span className="brand-subtitle">Billetterie Officielle</span>
            </div>
          </Navbar.Brand>
        )}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Afficher les liens Accueil et Billets uniquement pour les utilisateurs non connectés ou les utilisateurs normaux */}
            {(!isAuthenticated || userRole === 'user') && (
              <>
                <Nav.Link as={Link} to="/">Accueil</Nav.Link>
                <Nav.Link as={Link} to="/offers">Billets</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                {userRole === 'employee' && (
                  <>
                    <Nav.Link as={Link} to="/employee-dashboard">
                      <Badge bg="warning" className="me-1">Employé</Badge>
                      Tableau de bord
                    </Nav.Link>
                    <Nav.Link as={Link} to="/ticket-scanner">Scanner de billets</Nav.Link>
                    <Nav.Link as={Link} to="/validation-history">Historique</Nav.Link>
                  </>
                )}
                
                {userRole === 'admin' && (
                  <>
                    <Nav.Link as={Link} to="/admin-dashboard">
                      <Badge bg="danger" className="me-1">Admin</Badge>
                      Tableau de bord
                    </Nav.Link>
                    <Nav.Link as={Link} to="/manage-offers">Gérer les offres</Nav.Link>
                    <Nav.Link as={Link} to="/sales-reports">Rapports de vente</Nav.Link>
                  </>
                )}
                
                {userRole === 'user' && (
                  <>
                    <Nav.Link as={Link} to="/my-tickets">Mes Billets</Nav.Link>
                    <Nav.Link as={Link} to="/cart">Panier</Nav.Link>
                  </>
                )}
                
                <Nav.Link as={Link} to="/profile">Mon Profil</Nav.Link>
                <Button variant="outline-light" className="rounded-pill px-3" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right me-2" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                    <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                  </svg>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="me-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-in-right me-1" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
                    <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                  </svg>
                  Connexion
                </Nav.Link>
                <Button as={Link} to="/register" variant="light" className="rounded-pill px-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus me-1" viewBox="0 0 16 16">
                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
                    <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                  </svg>
                  Inscription
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
