import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer les articles du panier depuis le localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cart);
    
    // Calculer le prix total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(total);
  }, []);

  const handleRemoveItem = (index) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
    
    // Mettre à jour le localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Recalculer le prix total
    const total = updatedCart.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(total);
  };

  const handleCheckout = () => {
    // Rediriger vers la page de paiement
    navigate('/checkout');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'solo':
        return '1 billet';
      case 'duo':
        return '2 billets';
      case 'familiale':
        return '4 billets';
      default:
        return type;
    }
  };

  return (
    <Container>
      <h1 className="text-center mb-4">Votre Panier</h1>
      
      {cartItems.length === 0 ? (
        <Card className="text-center p-5 mb-4">
          <Card.Body>
            <Card.Title>Votre panier est vide</Card.Title>
            <Card.Text>
              Vous n'avez pas encore ajouté de billets à votre panier.
            </Card.Text>
            <Button 
              variant="primary" 
              onClick={() => navigate('/offers')}
            >
              Voir les offres disponibles
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Articles ({cartItems.length})</h5>
              </Card.Header>
              <ListGroup variant="flush">
                {cartItems.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <Row className="align-items-center">
                      <Col md={8}>
                        <h5>{item.name}</h5>
                        <p className="text-muted mb-0">
                          {getTypeLabel(item.type)} | {formatDate(item.event_date)}
                        </p>
                      </Col>
                      <Col md={2} className="text-end">
                        <span className="fw-bold">{item.price.toFixed(2)} €</span>
                      </Col>
                      <Col md={2} className="text-end">
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Supprimer
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Récapitulatif</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <span>Sous-total</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Frais de service</span>
                  <span>0.00 €</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3 fw-bold">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
                <Button 
                  variant="success" 
                  className="w-100"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  Procéder au paiement
                </Button>
              </Card.Body>
            </Card>
            
            <Alert variant="info">
              <Alert.Heading>Information importante</Alert.Heading>
              <p>
                Après le paiement, vous recevrez vos e-tickets sécurisés par QR code.
                Ces QR codes sont générés à l'aide d'un système à double clé pour garantir leur authenticité.
              </p>
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;
