import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validation du prénom
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    // Validation du nom
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email est invalide';
    }
    
    // Validation du mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial';
    }
    
    // Validation de la confirmation du mot de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        // Créer l'utilisateur via le service d'authentification
        const userData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          is_employee: false,
          is_admin: false
        };
        
        console.log('Tentative d\'inscription avec les données:', userData);
        
        // Appel à l'API pour créer l'utilisateur
        const response = await authService.register(userData);
        
        console.log('Réponse du serveur:', response);
        
        if (response.status === 201 || response.status === 200) {
          // Inscription réussie
          setSubmitSuccess(true);
          
          // Stocker temporairement l'email et le mot de passe pour la configuration MFA
          localStorage.setItem('temp_email', formData.email);
          localStorage.setItem('temp_password', formData.password);
          
          // Rediriger vers la page de configuration MFA après un court délai
          setTimeout(() => {
            navigate('/mfa-setup');
          }, 2000);
        } else {
          console.error('Statut de réponse inattendu:', response.status);
          throw new Error('Erreur lors de l\'inscription');
        }
      } catch (error) {
        console.error('Erreur d\'inscription:', error);
        
        // Afficher plus de détails sur l'erreur
        if (error.response) {
          // La requête a été faite et le serveur a répondu avec un code d'erreur
          console.error('Données de réponse d\'erreur:', error.response.data);
          console.error('Statut de l\'erreur:', error.response.status);
          console.error('En-têtes de réponse:', error.response.headers);
          
          if (error.response.status === 400 && error.response.data.detail === 'Email already registered') {
            setSubmitError('Cet email est déjà utilisé. Veuillez en choisir un autre ou vous connecter.');
          } else if (error.response.data.detail) {
            setSubmitError(error.response.data.detail);
          } else {
            setSubmitError(`Erreur ${error.response.status}: ${JSON.stringify(error.response.data)}`);
          }
        } else if (error.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          console.error('Aucune réponse reçue:', error.request);
          setSubmitError('Aucune réponse du serveur. Vérifiez votre connexion ou si le service est en cours d\'exécution.');
        } else {
          // Une erreur s'est produite lors de la configuration de la requête
          console.error('Erreur de configuration de la requête:', error.message);
          setSubmitError(`Erreur: ${error.message}`);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="bg-light p-4 rounded shadow">
            <h2 className="text-center mb-4">Inscription</h2>
            
            {submitSuccess && (
              <Alert variant="success">
                Inscription réussie ! Vous allez être redirigé vers la configuration de l'authentification à deux facteurs...
              </Alert>
            )}
            
            {submitError && (
              <Alert variant="danger">
                {submitError}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Prénom</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      isInvalid={!!errors.firstName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      isInvalid={!!errors.lastName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Confirmer le mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.confirmPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mt-3" 
                disabled={isSubmitting || submitSuccess}
              >
                {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
              </Button>
              
              <div className="text-center mt-3">
                <p>
                  Vous avez déjà un compte? <Link to="/login">Connectez-vous</Link>
                </p>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
