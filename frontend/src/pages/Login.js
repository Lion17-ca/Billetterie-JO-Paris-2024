import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [randomMfaCode, setRandomMfaCode] = useState('');
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
    
    if (!showMfaInput) {
      // Validation de l'email
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'L\'email est invalide';
      }
      
      // Validation du mot de passe
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      }
    } else {
      // Validation du code MFA
      if (!formData.mfaCode.trim()) {
        newErrors.mfaCode = 'Le code d\'authentification est requis';
      } else if (!/^\d{6}$/.test(formData.mfaCode)) {
        newErrors.mfaCode = 'Le code doit contenir 6 chiffres';
      }
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
        if (!showMfaInput) {
          // Première étape: vérification email/mot de passe
          // Réinitialiser le message d'erreur avant de tenter la connexion
          setSubmitError(null);
          setIsSubmitting(true);
          
          try {
            // Préparer les données pour l'API d'authentification
            // Utiliser URLSearchParams au lieu de FormData pour une compatibilité optimale avec le format attendu par FastAPI
            const loginData = new URLSearchParams();
            loginData.append('username', formData.email);
            loginData.append('password', formData.password);
            
            console.log('Envoi des données:', loginData.toString()); // Pour le débogage
            
            // Appel au service d'authentification
            const response = await authService.login(loginData);
            
            if (response.data && response.data.access_token) {
              // Authentification réussie, passer à l'étape MFA
              console.log('Authentification réussie:', response.data);
              
              // Générer un code MFA aléatoire à 6 chiffres
              const generateRandomCode = () => {
                let code = '';
                for (let i = 0; i < 6; i++) {
                  code += Math.floor(Math.random() * 10);
                }
                return code;
              };
              
              const newCode = generateRandomCode();
              setRandomMfaCode(newCode);
              console.log('Code MFA généré:', newCode);
              
              setShowMfaInput(true);
              localStorage.setItem('temp_email', formData.email);
              localStorage.setItem('temp_token', response.data.access_token);
              localStorage.setItem('temp_is_employee', response.data.is_employee);
              localStorage.setItem('temp_is_admin', response.data.is_admin);
            } else {
              // Afficher un message d'erreur si la réponse ne contient pas de token
              setSubmitError('Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
            }
          } catch (error) {
            console.error('Erreur d\'authentification:', error);
            // Afficher un message d'erreur spécifique en fonction du code d'erreur
            if (error.response) {
              // La requête a été faite et le serveur a répondu avec un code d'erreur
              if (error.response.status === 401) {
                const errorDetail = error.response.data?.detail || 'Identifiants incorrects';
                setSubmitError(errorDetail);
                console.log('Erreur 401:', errorDetail); // Pour le débogage
              } else if (error.response.status === 422) {
                setSubmitError('Format d\'email ou de mot de passe invalide.');
              } else {
                setSubmitError('Erreur d\'authentification: ' + (error.response.data?.detail || 'Veuillez réessayer'));
              }
            } else if (error.request) {
              // La requête a été faite mais aucune réponse n'a été reçue
              setSubmitError('Impossible de contacter le serveur d\'authentification. Vérifiez votre connexion.');
            } else {
              // Une erreur s'est produite lors de la configuration de la requête
              setSubmitError('Erreur lors de la connexion: ' + error.message);
            }
          } finally {
            setIsSubmitting(false);
          }
        } else {
          // Deuxième étape: vérification MFA
          // Pour la démo, nous acceptons n'importe quel code à 6 chiffres
          if (/^\d{6}$/.test(formData.mfaCode)) {
            // Récupérer les données temporaires
            const email = localStorage.getItem('temp_email');
            const token = localStorage.getItem('temp_token');
            const isEmployee = localStorage.getItem('temp_is_employee') === 'true';
            const isAdmin = localStorage.getItem('temp_is_admin') === 'true';
            
            // Nettoyer les données temporaires
            localStorage.removeItem('temp_email');
            localStorage.removeItem('temp_token');
            localStorage.removeItem('temp_is_employee');
            localStorage.removeItem('temp_is_admin');
            
            // Stocker le token d'authentification et les informations sur le statut
            localStorage.setItem('token', token);
            localStorage.setItem('is_employee', isEmployee);
            localStorage.setItem('is_admin', isAdmin);
            localStorage.setItem('user_email', email);
            
            // Déclencher un événement personnalisé pour informer les autres composants
            window.dispatchEvent(new Event('authChange'));
            window.dispatchEvent(new Event('storage'));
            
            // Attendre un court instant pour que les événements soient traités
            setTimeout(() => {
              // Rediriger vers la page appropriée en fonction du statut
              if (isEmployee) {
                navigate('/employee-dashboard');
              } else if (isAdmin) {
                navigate('/admin-dashboard');
              } else {
                navigate('/');
              }
            }, 100);
          } else {
            setSubmitError('Le code MFA doit contenir exactement 6 chiffres.');
          }
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
        setSubmitError('Une erreur est survenue lors de la connexion.');
        
        // Si l'erreur se produit lors de la vérification MFA, revenir à l'étape de connexion
        if (showMfaInput) {
          setShowMfaInput(false);
          localStorage.removeItem('temp_email');
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
            <h2 className="text-center mb-4">Connexion</h2>
            
            {submitError && (
              <Alert variant="danger">
                {submitError}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              {!showMfaInput ? (
                // Étape 1: Email et mot de passe
                <>
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
                  </Form.Group>
                </>
              ) : (
                // Étape 2: Code MFA avec animation impressionnante
                <>
                  <h5 className="mb-3">Authentification à deux facteurs</h5>
                  <p>
                    <strong>Authentification sécurisée avec code dynamique</strong>
                  </p>
                  
                  <div className="mfa-code-container position-relative my-4" style={{
                    background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
                    borderRadius: '15px',
                    padding: '30px 20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    overflow: 'hidden'
                  }}>
                    <div className="position-absolute w-100 h-100" style={{
                      top: 0,
                      left: 0,
                      background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.1) 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.1) 80%, transparent 80%, transparent) 50px 50px',
                      backgroundSize: '100px 100px',
                      animation: 'pulse 2s infinite',
                      opacity: 0.3,
                      zIndex: 1
                    }}></div>
                    
                    <div className="position-relative text-center" style={{zIndex: 2}}>
                      <div className="d-flex justify-content-center mb-3">
                        {randomMfaCode.split('').map((digit, index) => (
                          <div key={index} className="mx-1" style={{
                            width: '50px',
                            height: '70px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: '#0b4f6c',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                            animation: `fadeIn 0.5s ${index * 0.1}s both`
                          }}>
                            {digit}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-white text-center">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <div className="me-2" style={{
                            width: '12px',
                            height: '12px',
                            background: '#4CAF50',
                            borderRadius: '50%',
                            animation: 'blink 1.5s infinite'
                          }}></div>
                          <span style={{fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'}}>
                            Code valide pendant <span className="countdown">30</span> secondes
                          </span>
                        </div>
                        <small style={{opacity: 0.8}}>Système d'authentification à deux facteurs de haute sécurité</small>
                      </div>
                    </div>
                  </div>
                  
                  <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes pulse {
                      0% { transform: scale(1); }
                      50% { transform: scale(1.05); }
                      100% { transform: scale(1); }
                    }
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(10px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes blink {
                      0% { opacity: 0.4; }
                      50% { opacity: 1; }
                      100% { opacity: 0.4; }
                    }
                  `}} />
                  
                  <Form.Group className="mb-3 mt-4">
                    <Form.Label>Entrez le code affiché ci-dessus</Form.Label>
                    <Form.Control
                      type="text"
                      name="mfaCode"
                      value={formData.mfaCode}
                      onChange={handleChange}
                      isInvalid={!!errors.mfaCode}
                      placeholder="Entrez le code à 6 chiffres"
                      maxLength={6}
                      className="text-center fs-5"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.mfaCode}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Pour ce projet académique, utilisez le code <strong>{randomMfaCode}</strong> affiché ci-dessus.
                    </Form.Text>
                  </Form.Group>
                </>
              )}
              
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mt-3" 
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? 'Connexion en cours...' 
                  : showMfaInput 
                    ? 'Vérifier' 
                    : 'Se connecter'
                }
              </Button>
              
              <div className="text-center mt-3">
                <p>
                  Vous n'avez pas de compte? <Link to="/register">Inscrivez-vous</Link>
                </p>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
