import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRoute, EmployeeRoute, AdminRoute, AuthRoute } from '../ProtectedRoutes';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Composant de test pour vérifier le rendu
const TestComponent = () => <div data-testid="test-component">Test Component</div>;

// Fonction utilitaire pour le rendu des routes protégées
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: MemoryRouter });
};

describe('Protected Routes Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('UserRoute', () => {
    test('redirige les administrateurs vers le tableau de bord admin', () => {
      // Simuler un administrateur authentifié
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake-token';
        if (key === 'is_admin') return 'true';
        if (key === 'is_employee') return 'false';
        return null;
      });

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<UserRoute><TestComponent /></UserRoute>} />
            <Route path="/admin-dashboard" element={<div data-testid="admin-dashboard">Admin Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Vérifier que l'utilisateur a été redirigé vers le tableau de bord admin
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    test('redirige les employés vers le tableau de bord employé', () => {
      // Simuler un employé authentifié
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake-token';
        if (key === 'is_admin') return 'false';
        if (key === 'is_employee') return 'true';
        return null;
      });

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<UserRoute><TestComponent /></UserRoute>} />
            <Route path="/employee-dashboard" element={<div data-testid="employee-dashboard">Employee Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Vérifier que l'utilisateur a été redirigé vers le tableau de bord employé
      expect(screen.getByTestId('employee-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    test('affiche le contenu normal pour les utilisateurs standard', () => {
      // Simuler un utilisateur standard authentifié
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake-token';
        if (key === 'is_admin') return 'false';
        if (key === 'is_employee') return 'false';
        return null;
      });

      render(
        <MemoryRouter>
          <UserRoute>
            <TestComponent />
          </UserRoute>
        </MemoryRouter>
      );

      // Vérifier que le contenu normal est affiché
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('EmployeeRoute', () => {
    test('redirige les utilisateurs non authentifiés vers la page de connexion', () => {
      // Simuler un utilisateur non authentifié
      localStorageMock.getItem.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/employee-dashboard']}>
          <Routes>
            <Route path="/employee-dashboard" element={<EmployeeRoute><TestComponent /></EmployeeRoute>} />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Vérifier que l'utilisateur a été redirigé vers la page de connexion
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    test('redirige les utilisateurs non-employés vers la page de connexion', () => {
      // Simuler un utilisateur standard authentifié
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake-token';
        if (key === 'is_employee') return 'false';
        return null;
      });

      render(
        <MemoryRouter initialEntries={['/employee-dashboard']}>
          <Routes>
            <Route path="/employee-dashboard" element={<EmployeeRoute><TestComponent /></EmployeeRoute>} />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Vérifier que l'utilisateur a été redirigé vers la page de connexion
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    test('affiche le contenu pour les employés authentifiés', () => {
      // Simuler un employé authentifié
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake-token';
        if (key === 'is_employee') return 'true';
        return null;
      });

      render(
        <MemoryRouter>
          <EmployeeRoute>
            <TestComponent />
          </EmployeeRoute>
        </MemoryRouter>
      );

      // Vérifier que le contenu est affiché
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('AdminRoute', () => {
    test('redirige les utilisateurs non authentifiés vers la page de connexion', () => {
      // Simuler un utilisateur non authentifié
      localStorageMock.getItem.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/admin-dashboard']}>
          <Routes>
            <Route path="/admin-dashboard" element={<AdminRoute><TestComponent /></AdminRoute>} />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Vérifier que l'utilisateur a été redirigé vers la page de connexion
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    test('redirige les utilisateurs non-administrateurs vers la page de connexion', () => {
      // Simuler un utilisateur standard authentifié
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake-token';
        if (key === 'is_admin') return 'false';
        return null;
      });

      render(
        <MemoryRouter initialEntries={['/admin-dashboard']}>
          <Routes>
            <Route path="/admin-dashboard" element={<AdminRoute><TestComponent /></AdminRoute>} />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Vérifier que l'utilisateur a été redirigé vers la page de connexion
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    test('affiche le contenu pour les administrateurs authentifiés', () => {
      // Simuler un administrateur authentifié
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake-token';
        if (key === 'is_admin') return 'true';
        return null;
      });

      render(
        <MemoryRouter>
          <AdminRoute>
            <TestComponent />
          </AdminRoute>
        </MemoryRouter>
      );

      // Vérifier que le contenu est affiché
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('AuthRoute', () => {
    test('redirige les utilisateurs non authentifiés vers la page de connexion', () => {
      // Simuler un utilisateur non authentifié
      localStorageMock.getItem.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route path="/profile" element={<AuthRoute><TestComponent /></AuthRoute>} />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Vérifier que l'utilisateur a été redirigé vers la page de connexion
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    test('affiche le contenu pour les utilisateurs authentifiés', () => {
      // Simuler un utilisateur authentifié
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'fake-token';
        return null;
      });

      render(
        <MemoryRouter>
          <AuthRoute>
            <TestComponent />
          </AuthRoute>
        </MemoryRouter>
      );

      // Vérifier que le contenu est affiché
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });
});
