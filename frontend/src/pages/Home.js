import React from 'react';
import { Container, Row, Col, Card, Button, Carousel, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <Container>
      {/* Carousel Section */}
      <Row className="mb-5">
        <Col>
          <Carousel fade indicators={true} className="shadow-lg rounded overflow-hidden">
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80"
                alt="Athlétisme"
              />
              <Carousel.Caption>
                <h2 className="display-4 fw-bold">Billetterie Officielle des JO</h2>
                <p className="lead">Vivez l'excellence olympique en direct</p>
                <Button as={Link} to="/offers" variant="primary" size="lg" className="mt-2 rounded-pill px-4">
                  Réserver maintenant
                </Button>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="https://images.unsplash.com/photo-1565992441121-4367c2967103?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80"
                alt="Natation"
              />
              <Carousel.Caption>
                <h2 className="display-4 fw-bold">Compétitions de Natation</h2>
                <p className="lead">Assistez aux performances des meilleurs nageurs du monde</p>
                <Button as={Link} to="/offers" variant="primary" size="lg" className="mt-2 rounded-pill px-4">
                  Découvrir les épreuves
                </Button>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="https://images.unsplash.com/photo-1534158914592-062992fbe900?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80"
                alt="Gymnastique"
              />
              <Carousel.Caption>
                <h2 className="display-4 fw-bold">Gymnastique Artistique</h2>
                <p className="lead">Admirez la grâce et la précision des gymnastes olympiques</p>
                <Button as={Link} to="/offers" variant="primary" size="lg" className="mt-2 rounded-pill px-4">
                  Voir les billets
                </Button>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </Col>
      </Row>

      {/* Featured Events */}
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold mb-4">Événements à l'honneur</h2>
        <div className="d-flex justify-content-center">
          <div className="bg-primary rounded-pill px-4 py-1 mb-4" style={{ width: '100px' }}></div>
        </div>
      </div>
      
      <Row className="mb-5 g-4">
        <Col lg={4} md={6} className="mb-4">
          <Card className="olympic-card h-100">
            <Card.Img variant="top" src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" />
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-primary rounded-pill px-3 py-2">28 Juillet</span>
                <span className="text-muted">À partir de 120€</span>
              </div>
              <Card.Title className="fw-bold fs-4">Natation - Finales</Card.Title>
              <Card.Text>
                Assistez aux finales de natation et voyez les meilleurs athlètes du monde s'affronter pour l'or olympique dans une ambiance électrique.
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button as={Link} to="/offers" variant="outline-primary" className="rounded-pill px-4">Voir les billets</Button>
                <span className="badge bg-success rounded-pill">Disponible</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} md={6} className="mb-4">
          <Card className="olympic-card h-100">
            <Card.Img variant="top" src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" />
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-primary rounded-pill px-3 py-2">1 Août</span>
                <span className="text-muted">À partir de 150€</span>
              </div>
              <Card.Title className="fw-bold fs-4">Athlétisme - 100m</Card.Title>
              <Card.Text>
                Ne manquez pas la course la plus rapide du monde et vivez l'excitation du 100m olympique dans un stade comble vibrant d'énergie.
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button as={Link} to="/offers" variant="outline-primary" className="rounded-pill px-4">Voir les billets</Button>
                <span className="badge bg-warning rounded-pill">Presque complet</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} md={6} className="mb-4">
          <Card className="olympic-card h-100">
            <Card.Img variant="top" src="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" />
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-primary rounded-pill px-3 py-2">5 Août</span>
                <span className="text-muted">À partir de 110€</span>
              </div>
              <Card.Title className="fw-bold fs-4">Gymnastique - Finales</Card.Title>
              <Card.Text>
                Admirez la grâce et la puissance des gymnastes lors des finales par appareil dans une compétition où chaque détail compte.
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button as={Link} to="/offers" variant="outline-primary" className="rounded-pill px-4">Voir les billets</Button>
                <span className="badge bg-success rounded-pill">Disponible</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Security Features */}
      <div className="bg-light py-5 rounded-4 mb-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold mb-4">Un système de billetterie sécurisé</h2>
          <div className="d-flex justify-content-center">
            <div className="bg-primary rounded-pill px-4 py-1 mb-4" style={{ width: '100px' }}></div>
          </div>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Notre technologie de pointe garantit la sécurité et l'authenticité de chaque billet pour les Jeux Olympiques.
          </p>
        </div>
        
        <Container>
          <Row className="g-4">
            <Col md={4} className="mb-4">
              <div className="feature-card text-center">
                <div className="feature-icon mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-shield-lock" viewBox="0 0 16 16">
                    <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56z"/>
                    <path d="M9.5 6.5a1.5 1.5 0 0 1-1 1.415l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99a1.5 1.5 0 1 1 2-1.415z"/>
                  </svg>
                </div>
                <h4 className="fw-bold mb-3">Double Sécurité</h4>
                <p className="text-muted">Notre système à deux clés garantit l'authenticité de chaque billet et prévient la contrefaçon, offrant une sécurité inégalée.</p>
              </div>
            </Col>
            
            <Col md={4} className="mb-4">
              <div className="feature-card text-center">
                <div className="feature-icon mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-qr-code" viewBox="0 0 16 16">
                    <path d="M2 2h2v2H2V2Z"/>
                    <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"/>
                    <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"/>
                    <path d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"/>
                    <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"/>
                  </svg>
                </div>
                <h4 className="fw-bold mb-3">E-Tickets QR Code</h4>
                <p className="text-muted">Recevez vos billets électroniques avec QR code sécurisé directement sur votre appareil, pour un accès rapide et sans contact.</p>
              </div>
            </Col>
            
            <Col md={4} className="mb-4">
              <div className="feature-card text-center">
                <div className="feature-icon mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-person-check" viewBox="0 0 16 16">
                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                    <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                  </svg>
                </div>
                <h4 className="fw-bold mb-3">Authentification MFA</h4>
                <p className="text-muted">Protection renforcée de votre compte grâce à l'authentification multi-facteurs, pour une sécurité optimale de vos données.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Call to Action */}
      <div className="cta-section mb-5">
        <Row>
          <Col lg={8} className="mx-auto text-center">
            <h2 className="display-4 fw-bold mb-3">Prêt à vivre l'expérience olympique ?</h2>
            <p className="lead mb-4">Créez votre compte et commencez à réserver vos billets dès maintenant pour ne manquer aucun moment des Jeux Olympiques.</p>
            <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
              <Button as={Link} to="/register" variant="light" size="lg" className="rounded-pill px-4 py-3 fw-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus me-2" viewBox="0 0 16 16">
                  <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
                  <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                </svg>
                Créer un compte
              </Button>
              <Button as={Link} to="/offers" variant="outline-light" size="lg" className="rounded-pill px-4 py-3 fw-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-ticket-perforated me-2" viewBox="0 0 16 16">
                  <path d="M4 4.85v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9z"/>
                  <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3zM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9z"/>
                </svg>
                Voir les offres
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default Home;
