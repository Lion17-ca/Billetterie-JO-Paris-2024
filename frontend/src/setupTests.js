// jest-dom ajoute des matchers personnalisés pour Jest pour affirmer sur les nœuds DOM.
// permet de faire des choses comme :
// expect(element).toHaveTextContent(/react/i)
// Pour en savoir plus : https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Configuration globale pour les tests
beforeEach(() => {
  // Mock de localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true
  });

  // Mock de sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true
  });
  
  // Réinitialiser les mocks entre les tests
  jest.clearAllMocks();
});
