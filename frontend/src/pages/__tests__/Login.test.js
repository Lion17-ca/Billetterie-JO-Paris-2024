import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

// Mock du service d'API
jest.mock('../../services/api', () => ({
  login: jest.fn().mockResolvedValue({ 
    access_token: 'fake-token',
    is_admin: false,
    is_employee: false
  })
}));

// Mock du hook de navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('Login Component', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Vérifier que les éléments du formulaire sont présents
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
    expect(screen.getByText(/Pas encore de compte/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Créer un compte/i })).toBeInTheDocument();
  });

  test('handles form submission correctly', async () => {
    const { login } = require('../../services/api');
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' }
    });
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
    
    // Vérifier que la fonction de login a été appelée avec les bons arguments
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('displays error message on login failure', async () => {
    const { login } = require('../../services/api');
    login.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Remplir et soumettre le formulaire
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
    
    // Vérifier que le message d'erreur s'affiche
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
