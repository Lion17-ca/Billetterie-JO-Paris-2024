import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useScrollToHash from '../hooks/useScrollToHash';
import './DataDeletionRequest.css';

const DataDeletionRequest = () => {
  // Utiliser notre hook personnalisé pour gérer le défilement vers les ancres
  useScrollToHash();
  const [formData, setFormData] = useState({
    email: '',
    reason: '',
    confirmation: false
  });
  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setValidated(true);
    
    // Simuler l'envoi de la demande
    setTimeout(() => {
      // En production, ici nous enverrions la demande à l'API
      console.log('Demande de suppression envoyée:', formData);
      
      // Réinitialiser le formulaire et afficher le message de succès
      setFormData({
        email: '',
        reason: '',
        confirmation: false
      });
      setValidated(false);
      setShowSuccess(true);
      
      // Masquer le message de succès après 5 secondes
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }, 1000);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <h1 id="main-title" className="text-center mb-4">Demande de Suppression des Données</h1>
              <p className="text-center mb-5">
                Conformément au Règlement Général sur la Protection des Données (RGPD), 
                vous avez le droit de demander la suppression de vos données personnelles.
              </p>
              
              {showSuccess && (
                <Alert variant="success" className="mb-4">
                  <Alert.Heading>Demande envoyée avec succès!</Alert.Heading>
                  <p>
                    Nous avons bien reçu votre demande de suppression de données. Notre équipe va la traiter 
                    dans les plus brefs délais. Vous recevrez une confirmation par email une fois que vos 
                    données auront été supprimées.
                  </p>
                </Alert>
              )}
              
              {showError && (
                <Alert variant="danger" className="mb-4">
                  <Alert.Heading>Une erreur est survenue</Alert.Heading>
                  <p>
                    Nous n'avons pas pu traiter votre demande. Veuillez réessayer ultérieurement ou 
                    contactez notre service client à l'adresse privacy@jo-billetterie.fr.
                  </p>
                </Alert>
              )}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formEmail">
                  <Form.Label>Adresse email associée à votre compte</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre.email@exemple.com"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Veuillez fournir une adresse email valide.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="formReason">
                  <Form.Label>Raison de la suppression (optionnel)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Veuillez nous indiquer la raison pour laquelle vous souhaitez supprimer vos données."
                  />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="formConfirmation">
                  <Form.Check
                    type="checkbox"
                    name="confirmation"
                    checked={formData.confirmation}
                    onChange={handleChange}
                    label="Je comprends que cette action est irréversible et que toutes mes données personnelles, y compris mon historique de billets, seront définitivement supprimées."
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Vous devez confirmer que vous comprenez les conséquences de cette action.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-grid gap-2 mb-4">
                  <Button variant="danger" type="submit" size="lg" className="rounded-pill">
                    Demander la suppression de mes données
                  </Button>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-muted">
                    Nous traiterons votre demande dans un délai maximum de 30 jours conformément au RGPD.
                  </p>
                </div>
                
                <hr className="my-4" />
                
                <div className="text-center">
                  <p>Vous avez des questions concernant vos données personnelles ?</p>
                  <p>
                    Consultez notre <Link to="/privacy-policy">Politique de confidentialité</Link> ou 
                    contactez notre Délégué à la Protection des Données à l'adresse 
                    <a href="mailto:dpo@jo-billetterie.fr"> dpo@jo-billetterie.fr</a>.
                  </p>
                  <Link to="/">
                    <Button variant="outline-primary" className="rounded-pill px-4 mt-3">
                      Retour à l'accueil
                    </Button>
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DataDeletionRequest;
