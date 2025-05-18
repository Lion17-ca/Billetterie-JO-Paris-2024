import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const CookieConsent = () => {
  const [show, setShow] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Toujours activé
    analytics: false,
    marketing: false,
    preferences: false
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Si aucun consentement n'est stocké, afficher la bannière
      setShow(true);
    } else {
      // Charger les préférences sauvegardées
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch (e) {
        console.error('Erreur lors du chargement des préférences de cookies:', e);
        setShow(true);
      }
    }
  }, []);

  const handleClose = () => {
    setShow(false);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    saveConsent(allAccepted);
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    saveConsent(onlyNecessary);
  };

  const saveConsent = (consentPreferences) => {
    // Sauvegarder les préférences dans le localStorage
    localStorage.setItem('cookieConsent', JSON.stringify(consentPreferences));
    
    // Enregistrer la date du consentement
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Fermer la bannière
    setShow(false);
    
    // Appliquer les préférences (ici vous pourriez activer/désactiver les scripts correspondants)
    applyConsentPreferences(consentPreferences);
  };

  const applyConsentPreferences = (consentPreferences) => {
    // Exemple d'application des préférences
    if (consentPreferences.analytics) {
      // Activer les scripts d'analyse
      console.log('Scripts d\'analyse activés');
    }
    
    if (consentPreferences.marketing) {
      // Activer les scripts de marketing
      console.log('Scripts de marketing activés');
    }
    
    if (consentPreferences.preferences) {
      // Activer les cookies de préférences
      console.log('Cookies de préférences activés');
    }
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
      className="cookie-consent-modal"
    >
      <Modal.Header>
        <Modal.Title>Paramètres de confidentialité</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="cookie-consent-intro mb-4">
          <p>
            Nous utilisons des cookies et technologies similaires pour améliorer votre expérience sur notre site, 
            analyser notre trafic et personnaliser notre contenu. En cliquant sur "Accepter tous", vous consentez 
            à l'utilisation de tous les cookies. Vous pouvez également personnaliser vos choix en cliquant sur 
            "Personnaliser" ou n'accepter que les cookies essentiels en cliquant sur "Refuser tous".
          </p>
          <p>
            Pour plus d'informations, veuillez consulter notre <Link to="/privacy-policy">Politique de confidentialité</Link> et 
            nos <Link to="/terms-of-service">Conditions d'utilisation</Link>.
          </p>
        </div>

        {expanded && (
          <div className="cookie-preferences mb-4">
            <h5 className="mb-3">Personnaliser vos préférences</h5>
            
            <Form>
              <Form.Group className="mb-3 cookie-option">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Form.Check
                      type="switch"
                      id="necessary-cookies"
                      name="necessary"
                      data-testid="necessary-cookies"
                      checked={preferences.necessary}
                      disabled={true} // Toujours activé
                      onChange={handlePreferenceChange}
                    />
                    <Form.Label htmlFor="necessary-cookies" className="fw-bold">Cookies essentiels</Form.Label>
                  </div>
                  <span className="badge bg-primary">Obligatoire</span>
                </div>
                <p className="text-muted small">
                  Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
                  Ils permettent notamment de se souvenir de votre connexion et de sécuriser votre session.
                </p>
              </Form.Group>

              <Form.Group className="mb-3 cookie-option">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Form.Check
                      type="switch"
                      id="analytics-cookies"
                      name="analytics"
                      data-testid="analytics-cookies"
                      checked={preferences.analytics}
                      onChange={handlePreferenceChange}
                    />
                    <Form.Label htmlFor="analytics-cookies" className="fw-bold">Cookies d'analyse</Form.Label>
                  </div>
                  <span className="badge bg-secondary">Optionnel</span>
                </div>
                <p className="text-muted small">
                  Ces cookies nous permettent de mesurer l'audience de notre site, de comprendre comment 
                  les visiteurs l'utilisent et d'améliorer son fonctionnement.
                </p>
              </Form.Group>

              <Form.Group className="mb-3 cookie-option">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Form.Check
                      type="switch"
                      id="marketing-cookies"
                      name="marketing"
                      data-testid="marketing-cookies"
                      checked={preferences.marketing}
                      onChange={handlePreferenceChange}
                    />
                    <Form.Label htmlFor="marketing-cookies" className="fw-bold">Cookies marketing</Form.Label>
                  </div>
                  <span className="badge bg-secondary">Optionnel</span>
                </div>
                <p className="text-muted small">
                  Ces cookies sont utilisés pour suivre les visiteurs sur les sites web. Ils permettent 
                  d'afficher des publicités pertinentes et engageantes pour l'utilisateur.
                </p>
              </Form.Group>

              <Form.Group className="mb-3 cookie-option">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Form.Check
                      type="switch"
                      id="preferences-cookies"
                      name="preferences"
                      data-testid="preferences-cookies"
                      checked={preferences.preferences}
                      onChange={handlePreferenceChange}
                    />
                    <Form.Label htmlFor="preferences-cookies" className="fw-bold">Cookies de préférences</Form.Label>
                  </div>
                  <span className="badge bg-secondary">Optionnel</span>
                </div>
                <p className="text-muted small">
                  Ces cookies permettent de mémoriser vos préférences et de personnaliser votre expérience 
                  sur notre site (langue, région, paramètres d'affichage, etc.).
                </p>
              </Form.Group>
            </Form>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <div>
          <Button variant="link" onClick={toggleExpanded} className="text-decoration-none">
            {expanded ? 'Masquer les options' : 'Personnaliser'}
          </Button>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={handleRejectAll}>
            Refuser tous
          </Button>
          {expanded && (
            <Button variant="outline-primary" onClick={handleAcceptSelected}>
              Accepter la sélection
            </Button>
          )}
          <Button variant="primary" onClick={handleAcceptAll}>
            Accepter tous
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CookieConsent;
