import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Récupérer les articles du panier depuis le localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    
    setCartItems(cart);
    
    // Calculer le prix total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(total);
  }, [navigate]);

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
    
    if (paymentMethod === 'card') {
      // Validation du numéro de carte
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Le numéro de carte est requis';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Le numéro de carte doit contenir 16 chiffres';
      }
      
      // Validation du nom sur la carte
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Le nom sur la carte est requis';
      }
      
      // Validation de la date d'expiration
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'La date d\'expiration est requise';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Format invalide (MM/AA)';
      }
      
      // Validation du CVV
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'Le code de sécurité est requis';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'Le code de sécurité doit contenir 3 ou 4 chiffres';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsProcessing(true);
      
      try {
        // Simuler un traitement de paiement
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Récupérer l'email de l'utilisateur connecté
        const userEmail = localStorage.getItem('user_email');
        
        // Simuler la génération de la deuxième clé de sécurité et des QR codes
        const updatedCartItems = cartItems.map(item => {
          return {
            ...item,
            user_email: userEmail, // Associer le ticket à l'utilisateur connecté
            security_key_2: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            purchase_date: new Date().toISOString()
          };
        });
        
        // Sauvegarder les tickets dans le localStorage
        const existingTickets = JSON.parse(localStorage.getItem('tickets')) || [];
        const newTickets = [...existingTickets, ...updatedCartItems];
        localStorage.setItem('tickets', JSON.stringify(newTickets));
        
        // Vider le panier
        localStorage.setItem('cart', JSON.stringify([]));
        
        // Afficher le message de succès
        setIsPaymentComplete(true);
        
        // Rediriger vers la page des tickets après un court délai
        setTimeout(() => {
          navigate('/my-tickets');
        }, 3000);
      } catch (error) {
        setErrors({
          form: 'Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.'
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Container>
      <h1 className="text-center mb-4">Paiement</h1>
      
      {isPaymentComplete ? (
        <Alert variant="success" className="text-center">
          <Alert.Heading>Paiement réussi !</Alert.Heading>
          <p>
            Votre commande a été traitée avec succès. Vos e-tickets sont maintenant disponibles.
            Vous allez être redirigé vers la page de vos billets...
          </p>
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </Alert>
      ) : (
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Méthode de paiement</h5>
              </Card.Header>
              <Card.Body>
                {errors.form && (
                  <Alert variant="danger">
                    {errors.form}
                  </Alert>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Sélectionnez une méthode de paiement</Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      label="Carte de crédit / débit"
                      name="paymentMethod"
                      id="card"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mb-2"
                    />
                    <Form.Check
                      type="radio"
                      label="PayPal"
                      name="paymentMethod"
                      id="paypal"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      disabled
                      className="mb-2"
                    />
                    <Form.Check
                      type="radio"
                      label="Apple Pay"
                      name="paymentMethod"
                      id="applepay"
                      value="applepay"
                      checked={paymentMethod === 'applepay'}
                      onChange={() => setPaymentMethod('applepay')}
                      disabled
                      className="mb-2"
                    />
                  </div>
                </Form.Group>
                
                {paymentMethod === 'card' && (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Numéro de carte</Form.Label>
                      <Form.Control
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        isInvalid={!!errors.cardNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.cardNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Nom sur la carte</Form.Label>
                      <Form.Control
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        isInvalid={!!errors.cardName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.cardName}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date d'expiration</Form.Label>
                          <Form.Control
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/AA"
                            maxLength={5}
                            isInvalid={!!errors.expiryDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.expiryDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Code de sécurité (CVV)</Form.Label>
                          <Form.Control
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            maxLength={4}
                            isInvalid={!!errors.cvv}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.cvv}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 mt-3"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Traitement en cours...
                        </>
                      ) : (
                        `Payer ${totalPrice.toFixed(2)} €`
                      )}
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Récapitulatif de la commande</h5>
              </Card.Header>
              <ListGroup variant="flush">
                {cartItems.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="my-0">{item.name}</h6>
                        <small className="text-muted">{formatDate(item.event_date)}</small>
                      </div>
                      <span>{item.price.toFixed(2)} €</span>
                    </div>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <div className="d-flex justify-content-between">
                    <span>Total</span>
                    <strong>{totalPrice.toFixed(2)} €</strong>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card>
            
            <Alert variant="info">
              <Alert.Heading>Sécurité garantie</Alert.Heading>
              <p>
                Toutes les transactions sont sécurisées et cryptées.
                Après le paiement, une deuxième clé de sécurité sera générée pour vos e-tickets.
              </p>
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Checkout;
