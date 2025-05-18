import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

describe('Footer Component', () => {
  beforeEach(() => {
    // Rendu du composant avec BrowserRouter pour les liens
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
  });

  test('affiche le titre de la billetterie', () => {
    expect(screen.getByText('Billetterie JO')).toBeInTheDocument();
  });

  test('affiche la description du service', () => {
    expect(screen.getByText(/Votre solution sécurisée pour l'achat de billets pour les Jeux Olympiques/i)).toBeInTheDocument();
    expect(screen.getByText(/Un système innovant à double clé/i)).toBeInTheDocument();
  });

  test('affiche les liens des réseaux sociaux', () => {
    // Vérifier que les icônes des réseaux sociaux sont présentes
    const socialIcons = document.querySelectorAll('.footer-social-icon');
    expect(socialIcons.length).toBeGreaterThan(0);
  });

  test('affiche les liens de navigation', () => {
    // Vérifier que les liens importants sont présents
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Offres')).toBeInTheDocument();
    expect(screen.getByText('À propos')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  test('affiche les liens légaux', () => {
    // Vérifier que les liens légaux sont présents
    expect(screen.getByText('Politique de confidentialité')).toBeInTheDocument();
    expect(screen.getByText('Conditions d\'utilisation')).toBeInTheDocument();
    expect(screen.getByText('Suppression des données')).toBeInTheDocument();
  });

  test('affiche les informations de contact', () => {
    // Vérifier que les informations de contact sont présentes
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('support@jo-billetterie.fr')).toBeInTheDocument();
    expect(screen.getByText('+33 1 23 45 67 89')).toBeInTheDocument();
    expect(screen.getByText('123 Avenue des Champions, 75001 Paris')).toBeInTheDocument();
  });

  test('affiche le bouton de contact', () => {
    // Vérifier que le bouton de contact est présent
    expect(screen.getByText('Nous contacter')).toBeInTheDocument();
  });

  test('affiche le copyright avec l\'année actuelle', () => {
    // Vérifier que le copyright est présent et contient l'année actuelle
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${currentYear} Billetterie Jeux Olympiques. Tous droits réservés.`, 'i'))).toBeInTheDocument();
  });

  test('affiche le lien vers la CNIL', () => {
    // Vérifier que le lien vers la CNIL est présent
    const cnilLink = screen.getByText('RGPD');
    expect(cnilLink).toBeInTheDocument();
    expect(cnilLink.getAttribute('href')).toBe('https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on');
    expect(cnilLink.getAttribute('target')).toBe('_blank');
    expect(cnilLink.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
