import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './PrivacyPreferences.css';

const PrivacyPreferences = () => {
  const [preferences, setPreferences] = useState({
    marketing_emails: false,
    data_analytics: false,
    third_party_sharing: false,
    personalized_offers: false
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Charger les préférences depuis le localStorage ou une API
    const savedPreferences = localStorage.getItem('privacyPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error('Erreur lors du chargement des préférences:', e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = () => {
    // Sauvegarder les préférences dans le localStorage
    localStorage.setItem('privacyPreferences', JSON.stringify(preferences));
    
    // En production, envoyer les préférences à l'API
    console.log('Préférences sauvegardées:', preferences);
    
    // Afficher le message de succès
    setShowSuccess(true);
    
    // Masquer le message après 3 secondes
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <Card className="privacy-preferences-card mb-4">
      <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
        <span>Préférences de confidentialité</span>
        <div className="privacy-badge">RGPD</div>
      </Card.Header>
      <Card.Body>
        {showSuccess && (
          <Alert variant="success" className="mb-3">
            Vos préférences de confidentialité ont été mises à jour avec succès.
          </Alert>
        )}
        
        <p className="text-muted mb-4">
          Gérez vos préférences de confidentialité et contrôlez comment vos données sont utilisées.
          Conformément au RGPD, vous pouvez modifier ces paramètres à tout moment.
        </p>
        
        <Form>
          <div className="privacy-option">
            <Form.Check
              type="switch"
              id="marketing-emails"
              name="marketing_emails"
              checked={preferences.marketing_emails}
              onChange={handleChange}
              label="Emails marketing et promotionnels"
            />
            <p className="text-muted small">
              Recevoir des emails concernant les offres spéciales, les événements à venir et les promotions.
            </p>
          </div>
          
          <div className="privacy-option">
            <Form.Check
              type="switch"
              id="data-analytics"
              name="data_analytics"
              checked={preferences.data_analytics}
              onChange={handleChange}
              label="Analyse des données d'utilisation"
            />
            <p className="text-muted small">
              Nous permettre d'analyser comment vous utilisez notre site pour améliorer nos services.
            </p>
          </div>
          
          <div className="privacy-option">
            <Form.Check
              type="switch"
              id="third-party-sharing"
              name="third_party_sharing"
              checked={preferences.third_party_sharing}
              onChange={handleChange}
              label="Partage avec des tiers"
            />
            <p className="text-muted small">
              Autoriser le partage de vos données avec des partenaires de confiance pour des services complémentaires.
            </p>
          </div>
          
          <div className="privacy-option">
            <Form.Check
              type="switch"
              id="personalized-offers"
              name="personalized_offers"
              checked={preferences.personalized_offers}
              onChange={handleChange}
              label="Offres personnalisées"
            />
            <p className="text-muted small">
              Recevoir des recommandations et des offres adaptées à vos préférences et à votre historique d'achat.
            </p>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mt-4">
            <Link to="/data-deletion-request" className="text-danger">
              Demander la suppression de mes données
            </Link>
            <Button 
              variant="primary" 
              onClick={handleSave}
              className="rounded-pill px-4"
            >
              Enregistrer mes préférences
            </Button>
          </div>
        </Form>
        
        <hr className="my-4" />
        
        <div className="text-center">
          <p className="mb-2">Pour plus d'informations sur la façon dont nous traitons vos données :</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/privacy-policy" className="btn btn-sm btn-outline-secondary rounded-pill">
              Politique de confidentialité
            </Link>
            <Link to="/terms-of-service" className="btn btn-sm btn-outline-secondary rounded-pill">
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PrivacyPreferences;
