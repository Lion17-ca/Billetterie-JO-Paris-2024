import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import PrivacyPreferences from '../components/PrivacyPreferences';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mfaEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dataFetched, setDataFetched] = useState(false); // Pour éviter les appels API répétés
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Ne récupérer les données que si elles n'ont pas encore été chargées
    if (!dataFetched) {
      const fetchUserData = async () => {
        try {
          // Appel au service d'authentification pour récupérer les informations utilisateur via l'API Gateway
          const response = await authService.getCurrentUser();
          
          const userData = response.data;
          
          // Transformer les données de l'API au format attendu par le composant
          const formattedUserData = {
            firstName: userData.first_name,
            lastName: userData.last_name,
            email: userData.email,
            mfaEnabled: userData.mfa_enabled || localStorage.getItem('mfa_enabled') === 'true'
          };
          
          setUserData(formattedUserData);
          setFormData({
            ...formData,
            firstName: formattedUserData.firstName,
            lastName: formattedUserData.lastName
          });
          
          // Marquer les données comme chargées pour éviter les appels répétés
          setDataFetched(true);
          setLoading(false);
        } catch (apiError) {
          console.error('Erreur API:', apiError);
          
          // Fallback: utiliser des données par défaut si l'API échoue
          const fallbackUserData = {
            firstName: 'Utilisateur',
            lastName: '',
            email: 'Non disponible',
            mfaEnabled: localStorage.getItem('mfa_enabled') === 'true'
          };
          
          setUserData(fallbackUserData);
          setFormData({
            ...formData,
            firstName: fallbackUserData.firstName,
            lastName: fallbackUserData.lastName
          });
          
          // Marquer les données comme chargées pour éviter les appels répétés
          setDataFetched(true);
          setLoading(false);
          setError("Erreur lors du chargement des informations utilisateur. Veuillez réessayer plus tard.");
        }
      };

      fetchUserData();
    }
  }, [navigate, dataFetched, formData]); // Ajouter dataFetched comme dépendance

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Effacer l'erreur pour ce champ
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
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
    
    // Validation du mot de passe actuel
    if (formData.currentPassword && !formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis pour modifier le mot de passe';
    }
    
    // Validation du nouveau mot de passe
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword)) {
        newErrors.newPassword = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial';
      }
      
      // Validation de la confirmation du mot de passe
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mettre à jour les données utilisateur
        setUserData({
          ...userData,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
        
        // Réinitialiser les champs de mot de passe
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setUpdateSuccess(true);
        setIsEditing(false);
        
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      } catch (err) {
        setError("Erreur lors de la mise à jour du profil. Veuillez réessayer plus tard.");
      }
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setFormErrors({});
    setUpdateSuccess(false);
  };

  const handleMFASetup = () => {
    navigate('/mfa-setup');
  };

  return (
    <Container>
      <h1 className="text-center mb-4">Mon Profil</h1>
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement de votre profil...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row>
          <Col md={8} className="mx-auto">
            {updateSuccess && (
              <Alert variant="success">
                Votre profil a été mis à jour avec succès !
              </Alert>
            )}
            
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Informations personnelles</h5>
                  <Button 
                    variant={isEditing ? "light" : "outline-light"} 
                    size="sm"
                    onClick={handleEditToggle}
                  >
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {isEditing ? (
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
                            isInvalid={!!formErrors.firstName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.firstName}
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
                            isInvalid={!!formErrors.lastName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.lastName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={userData.email}
                        disabled
                      />
                      <Form.Text className="text-muted">
                        L'adresse email ne peut pas être modifiée.
                      </Form.Text>
                    </Form.Group>
                    
                    <hr className="my-4" />
                    <h5>Changer le mot de passe</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Mot de passe actuel</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        isInvalid={!!formErrors.currentPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.currentPassword}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Nouveau mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        isInvalid={!!formErrors.newPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.newPassword}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!formErrors.confirmPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.confirmPassword}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button variant="primary" type="submit">
                        Enregistrer les modifications
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div>
                    <Row className="mb-3">
                      <Col md={4} className="fw-bold">Prénom:</Col>
                      <Col md={8}>{userData.firstName}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={4} className="fw-bold">Nom:</Col>
                      <Col md={8}>{userData.lastName}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={4} className="fw-bold">Email:</Col>
                      <Col md={8}>{userData.email}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={4} className="fw-bold">Authentification à deux facteurs:</Col>
                      <Col md={8}>
                        {userData.mfaEnabled ? (
                          <span className="text-success">Activée</span>
                        ) : (
                          <div>
                            <span className="text-danger">Désactivée</span>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="ms-3"
                              onClick={handleMFASetup}
                            >
                              Configurer
                            </Button>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
            
            {/* Section d'historique des achats uniquement pour les utilisateurs normaux */}
            {!localStorage.getItem('is_employee') && !localStorage.getItem('is_admin') && (
              <Card className="mt-4 shadow-sm">
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">Historique des achats</h5>
                </Card.Header>
                <Card.Body>
                  <p>
                    Consultez vos tickets achetés et leur statut dans la section 
                    <Button 
                      variant="link" 
                      className="p-0 ms-2"
                      onClick={() => navigate('/my-tickets')}
                    >
                      Mes Tickets
                    </Button>
                  </p>
                </Card.Body>
              </Card>
            )}
            
            {/* Section des préférences de confidentialité RGPD */}
            <PrivacyPreferences />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default UserProfile;
