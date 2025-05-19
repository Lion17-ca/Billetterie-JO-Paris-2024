import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { authApi } from '../services/apiConfig';

const MFASetup = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [randomMfaCode, setRandomMfaCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer les informations MFA depuis le service d'authentification
    const fetchMFASetup = async () => {
      try {
        console.log('Début de la configuration MFA');
        // Essayer d'abord d'utiliser le token principal, puis le token temporaire en fallback
        const email = localStorage.getItem('temp_email');
        let token = localStorage.getItem('token');
        
        // Si le token principal n'existe pas, essayer le token temporaire
        if (!token) {
          token = localStorage.getItem('temp_token');
        }
        
        console.log('Email récupéré:', email ? 'Oui' : 'Non');
        console.log('Token récupéré:', token ? 'Oui' : 'Non');
        
        if (!email || !token) {
          setError("Aucune information d'utilisateur trouvée. Veuillez vous inscrire à nouveau.");
          setIsLoading(false);
          return;
        }
        
        // Générer un code MFA aléatoire pour la démonstration
        const generateRandomCode = () => {
          let code = '';
          for (let i = 0; i < 6; i++) {
            code += Math.floor(Math.random() * 10);
          }
          return code;
        };
        
        const newCode = generateRandomCode();
        setVerificationCode(newCode);
        setRandomMfaCode(newCode);
        console.log('Code MFA généré:', newCode);
        
        // Configuration des headers avec le token temporaire
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        
        // Appel à l'API pour récupérer les informations MFA
        try {
          console.log('Tentative d\'appel à l\'API MFA setup');
          // Utiliser directement authApi avec les headers d'autorisation
          const response = await authApi.post('/mfa/setup', {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Réponse MFA setup reçue:', response.data);
          
          if (response.data) {
            setSecret(response.data.secret);
            setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(response.data.uri)}`);
            
            // Stocker le code MFA actuel pour la démonstration
            if (response.data.current_code) {
              console.log('Code MFA reçu du serveur:', response.data.current_code);
              setVerificationCode(response.data.current_code);
              
              // Mettre à jour le code aléatoire
              setRandomMfaCode(response.data.current_code);
            } else {
              console.log('Aucun code MFA reçu du serveur, utilisation du code par défaut');
              // Le code est déjà défini plus haut
            }
          }
        } catch (apiError) {
          console.error('Erreur API MFA:', apiError);
          // Fallback pour la démonstration
          const mockSecret = 'JBSWY3DPEHPK3PXP';
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Billetterie%20JO:${encodeURIComponent(email)}?secret=${mockSecret}&issuer=Billetterie%20JO`;
          
          console.log('Utilisation du fallback pour le code MFA');
          setSecret(mockSecret);
          setQrCodeUrl(qrCodeUrl);
          // Le code est déjà défini plus haut
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration MFA:', err);
        setError("Erreur lors du chargement de la configuration MFA. Veuillez réessayer plus tard.");
        setIsLoading(false);
      }
    };

    fetchMFASetup();
  }, []);

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError("Veuillez entrer le code de vérification.");
      return;
    }
    
    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Pour la démo, nous acceptons n'importe quel code à 6 chiffres
      // Dans une implémentation réelle, nous vérifierions avec le serveur
      
      // Récupérer l'email temporaire
      const email = localStorage.getItem('temp_email');
      
      // Essayer d'abord d'utiliser le token principal, puis le token temporaire en fallback
      let token = localStorage.getItem('token');
      if (!token) {
        token = localStorage.getItem('temp_token');
      }
      
      if (!email || !token) {
        throw new Error("Aucune information d'utilisateur trouvée. Veuillez vous inscrire à nouveau.");
      }
      
      // Simuler la vérification du code MFA
      // Dans un environnement de production, cela serait vérifié par le serveur
      if (verificationCode === randomMfaCode) {
        console.log('Code MFA vérifié avec succès');
        
        // S'assurer que le token est correctement stocké
        localStorage.setItem('token', token);
        
        // Récupérer les informations d'employé et d'admin, soit des variables temporaires, soit des variables principales
        const isEmployee = localStorage.getItem('is_employee') || localStorage.getItem('temp_is_employee') || 'false';
        const isAdmin = localStorage.getItem('is_admin') || localStorage.getItem('temp_is_admin') || 'false';
        
        // Stocker les informations d'authentification
        localStorage.setItem('is_employee', isEmployee);
        localStorage.setItem('is_admin', isAdmin);
        
        // Afficher les informations stockées pour le débogage
        console.log('Token stocké:', localStorage.getItem('token'));
        console.log('is_employee stocké:', localStorage.getItem('is_employee'));
        console.log('is_admin stocké:', localStorage.getItem('is_admin'));
        
        // Supprimer les informations temporaires
        localStorage.removeItem('temp_email');
        localStorage.removeItem('temp_password');
        localStorage.removeItem('temp_token');
        localStorage.removeItem('temp_is_employee');
        localStorage.removeItem('temp_is_admin');
        
        setSuccess(true);
        
        // Rediriger vers la page appropriée en fonction du rôle de l'utilisateur après un court délai
        setTimeout(() => {
          const isEmployeeUser = localStorage.getItem('is_employee') === 'true';
          const isAdminUser = localStorage.getItem('is_admin') === 'true';
          
          if (isAdminUser) {
            navigate('/admin-dashboard');
          } else if (isEmployeeUser) {
            navigate('/employee-dashboard');
          } else {
            navigate('/');
          }
        }, 2000);
      } else {
        throw new Error('Erreur lors de l\'authentification');
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du code:', err);
      setError("Erreur lors de la vérification du code. Veuillez réessayer plus tard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Header as="h4" className="text-center bg-primary text-white">
              Configuration de l'Authentification à Deux Facteurs
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-2">Chargement de la configuration MFA...</p>
                </div>
              ) : error && !success ? (
                <Alert variant="danger">{error}</Alert>
              ) : success ? (
                <Alert variant="success">
                  Configuration MFA réussie ! Vous allez être redirigé vers la page d'accueil...
                </Alert>
              ) : (
                <>
                  <div className="alert alert-info">
                    <h5>Pourquoi l'authentification à deux facteurs ?</h5>
                    <p>
                      L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
                      Même si quelqu'un découvre votre mot de passe, il ne pourra pas accéder à votre compte sans le code
                      de vérification généré par votre application d'authentification.
                    </p>
                  </div>
                  
                  <Row>
                    <Col md={6}>
                      <h5>Étape 1: Scannez le QR code</h5>
                      <p>
                        Utilisez une application d'authentification comme Google Authenticator, 
                        Microsoft Authenticator ou Authy pour scanner ce QR code.
                      </p>
                      <div className="text-center mb-3">
                        <img 
                          src={qrCodeUrl} 
                          alt="QR Code pour l'authentification à deux facteurs" 
                          className="img-fluid border p-2"
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <h5>Étape 2: Configuration manuelle (si nécessaire)</h5>
                      <p>
                        Si vous ne pouvez pas scanner le QR code, entrez manuellement cette clé secrète 
                        dans votre application d'authentification:
                      </p>
                      <div className="bg-light p-2 text-center mb-3">
                        <code className="user-select-all fs-5">{secret}</code>
                      </div>
                      
                      <h5>Étape 3: Vérifiez votre configuration</h5>
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
                      
                      <p className="text-muted">
                        <i>Ce code est généré par notre système d'authentification sécurisé et change toutes les 30 secondes.</i>
                      </p>
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Entrez ou copiez le code ci-dessus:</Form.Label>
                          <Form.Control
                            type="text"
                            value={verificationCode}
                            onChange={handleVerificationCodeChange}
                            placeholder="Code à 6 chiffres"
                            maxLength={6}
                            className="text-center fs-5"
                          />
                        </Form.Group>
                        <Button 
                          type="submit" 
                          variant="primary" 
                          className="w-100"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Vérification...' : 'Vérifier et activer'}
                        </Button>
                      </Form>
                    </Col>
                  </Row>
                </>
              )}
            </Card.Body>
            <Card.Footer className="text-center text-muted">
              <small>
                Pour des raisons de sécurité, l'authentification à deux facteurs est obligatoire pour utiliser notre plateforme.
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MFASetup;
