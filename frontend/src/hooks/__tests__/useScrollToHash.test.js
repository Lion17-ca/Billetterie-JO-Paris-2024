import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import useScrollToHash from '../useScrollToHash';

// Mock de window.scrollTo
const scrollToMock = jest.fn();
Object.defineProperty(window, 'scrollTo', { value: scrollToMock });

// Mock de element.scrollIntoView
const scrollIntoViewMock = jest.fn();
Element.prototype.scrollIntoView = scrollIntoViewMock;

// Composant de test qui utilise le hook
const TestComponent = () => {
  useScrollToHash();
  const location = useLocation();
  return <div data-testid="test-component">Current hash: {location.hash}</div>;
};

describe('useScrollToHash Hook', () => {
  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Créer un élément avec l'ID "test-section" pour les tests
    const element = document.createElement('div');
    element.id = 'test-section';
    document.body.appendChild(element);
  });

  afterEach(() => {
    // Nettoyer le DOM
    const element = document.getElementById('test-section');
    if (element) {
      document.body.removeChild(element);
    }
    
    jest.useRealTimers();
  });

  test('fait défiler vers l\'élément correspondant au hash', () => {
    // Rendre le composant avec un hash dans l'URL
    render(
      <MemoryRouter initialEntries={['/page#test-section']}>
        <Routes>
          <Route path="/page" element={<TestComponent />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Avancer le temps pour laisser le setTimeout s'exécuter
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Vérifier que scrollIntoView a été appelé avec les bons paramètres
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  test('fait défiler vers le haut de la page s\'il n\'y a pas de hash', () => {
    // Rendre le composant sans hash dans l'URL
    render(
      <MemoryRouter initialEntries={['/page']}>
        <Routes>
          <Route path="/page" element={<TestComponent />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Vérifier que scrollTo a été appelé avec les bons paramètres
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
  });

  test('ne fait rien si l\'élément correspondant au hash n\'existe pas', () => {
    // Rendre le composant avec un hash qui ne correspond à aucun élément
    render(
      <MemoryRouter initialEntries={['/page#non-existent-section']}>
        <Routes>
          <Route path="/page" element={<TestComponent />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Avancer le temps pour laisser le setTimeout s'exécuter
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Vérifier que scrollIntoView n'a pas été appelé
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  test('réagit aux changements de location', () => {
    // Rendre le composant avec un hash initial
    const { rerender } = render(
      <MemoryRouter initialEntries={['/page#test-section']}>
        <Routes>
          <Route path="/page" element={<TestComponent />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Avancer le temps pour laisser le setTimeout s'exécuter
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Réinitialiser les mocks
    scrollIntoViewMock.mockClear();
    scrollToMock.mockClear();
    
    // Changer la location
    rerender(
      <MemoryRouter initialEntries={['/page']}>
        <Routes>
          <Route path="/page" element={<TestComponent />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Vérifier que scrollTo a été appelé avec les bons paramètres
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
  });
});
