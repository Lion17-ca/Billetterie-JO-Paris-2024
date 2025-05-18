import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Alert, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import './MyTickets.css';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Récupérer les tickets depuis le localStorage et filtrer par utilisateur connecté
    const fetchTickets = async () => {
      try {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Récupérer l'email de l'utilisateur connecté
        const userEmail = localStorage.getItem('user_email');
        
        // Récupérer tous les tickets
        const storedTickets = JSON.parse(localStorage.getItem('tickets')) || [];
        
        // Filtrer les tickets pour n'afficher que ceux de l'utilisateur connecté
        const userTickets = storedTickets.filter(ticket => ticket.user_email === userEmail);
        
        setTickets(userTickets);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des tickets:', err);
        setError("Erreur lors du chargement des tickets. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Séparer les tickets en "à venir" et "passés" basé sur la date de l'événement
  const upcomingTickets = tickets.filter(ticket => new Date(ticket.event_date) > new Date());
  const pastTickets = tickets.filter(ticket => new Date(ticket.event_date) <= new Date());

  // Générer les données du QR code (dans une implémentation réelle, ces données seraient cryptées)
  const generateQRData = (ticket) => {
    // Simuler la concaténation des deux clés de sécurité
    // Dans une implémentation réelle, la première clé viendrait du service d'authentification
    const securityKey1 = "simulated_security_key_1";
    return `${ticket.id}:${securityKey1}:${ticket.security_key_2}`;
  };

  // Fonction pour télécharger le ticket (simulée)
  const handleDownloadTicket = (ticket) => {
    alert(`Téléchargement du ticket ${ticket.id} en cours...`);
    // Dans une implémentation réelle, cela déclencherait la génération d'un PDF
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Mes E-Tickets</h1>
        <Button 
          variant="outline-primary" 
          className="rounded-pill ticket-download-btn"
          onClick={() => navigate('/offers')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
          </svg>
          Acheter des billets
        </Button>
      </div>
      
      {loading ? (
        <div className="ticket-spinner-container">
          <Spinner animation="border" variant="primary" className="ticket-spinner" />
          <p className="text-muted">Chargement de vos tickets...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="rounded-3 shadow-sm">{error}</Alert>
      ) : tickets.length === 0 ? (
        <div className="ticket-empty-state shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#6c757d" className="bi bi-ticket-perforated mb-3" viewBox="0 0 16 16">
            <path d="M4 4.85v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9z"/>
            <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3zM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9z"/>
          </svg>
          <h4>Vous n'avez pas encore de tickets</h4>
          <p className="text-muted">
            Explorez les offres disponibles et achetez vos premiers billets pour les Jeux Olympiques.
          </p>
          <Button 
            variant="primary" 
            className="rounded-pill"
            onClick={() => navigate('/offers')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-ticket-perforated me-2" viewBox="0 0 16 16">
              <path d="M4 4.85v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9z"/>
              <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3zM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9z"/>
            </svg>
            Voir les offres
          </Button>
        </div>
      ) : (
        <Tabs defaultActiveKey="upcoming" className="mb-4 ticket-tabs">
          <Tab eventKey="upcoming" title={
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-event me-2" viewBox="0 0 16 16">
                <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
              </svg>
              À venir <Badge bg="primary" pill className="ms-2">{upcomingTickets.length}</Badge>
            </span>
          }>
            {upcomingTickets.length === 0 ? (
              <Alert variant="info" className="mt-3 rounded-3">
                Vous n'avez pas de tickets à venir.
              </Alert>
            ) : (
              <Row>
                {upcomingTickets.map((ticket, index) => (
                  <Col md={6} lg={4} className="mb-4" key={index}>
                    <Card className="ticket-card">
                      <Card.Header className="bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-primary">{ticket.name}</span>
                          <Badge bg="success" pill>Valide</Badge>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div className="ticket-qr-container text-center mb-3">
                          <QRCode 
                            value={generateQRData(ticket)} 
                            size={150}
                            level="H"
                            includeMargin={true}
                            renderAs="svg"
                          />
                        </div>
                        
                        <div className="ticket-info">
                          <div className="ticket-info-label">Date</div>
                          <div className="ticket-info-value">{formatDate(ticket.event_date)}</div>
                        </div>
                        
                        <div className="ticket-info">
                          <div className="ticket-info-label">Lieu</div>
                          <div className="ticket-info-value">{ticket.venue || "Stade Olympique"}</div>
                        </div>
                        
                        <div className="ticket-info">
                          <div className="ticket-info-label">Catégorie</div>
                          <div className="ticket-info-value">{ticket.category || ticket.type}</div>
                        </div>
                        
                        <div className="ticket-info">
                          <div className="ticket-info-label">Prix</div>
                          <div className="ticket-info-value">{typeof ticket.price === 'number' ? ticket.price.toFixed(2) : ticket.price}€</div>
                        </div>
                      </Card.Body>
                      <Card.Footer className="text-center">
                        <Button 
                          variant="primary" 
                          className="ticket-download-btn"
                          onClick={() => handleDownloadTicket(ticket)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download me-2" viewBox="0 0 16 16">
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                          </svg>
                          Télécharger
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
          <Tab eventKey="past" title={
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-check me-2" viewBox="0 0 16 16">
                <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
              </svg>
              Passés <Badge bg="secondary" pill className="ms-2">{pastTickets.length}</Badge>
            </span>
          }>
            {pastTickets.length === 0 ? (
              <Alert variant="info" className="mt-3 rounded-3">
                Vous n'avez pas de tickets passés.
              </Alert>
            ) : (
              <Row>
                {pastTickets.map((ticket, index) => (
                  <Col md={6} lg={4} className="mb-4" key={index}>
                    <Card className="ticket-card bg-light">
                      <Card.Header className="bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-secondary">{ticket.name}</span>
                          <Badge bg="secondary" pill>Passé</Badge>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div className="ticket-qr-container text-center mb-3 position-relative">
                          <QRCode 
                            value={generateQRData(ticket)} 
                            size={150}
                            level="H"
                            includeMargin={true}
                            renderAs="svg"
                            className="opacity-50"
                          />
                          <Badge 
                            bg="danger" 
                            className="position-absolute top-50 start-50 translate-middle ticket-used-badge p-2"
                          >
                            UTILISÉ
                          </Badge>
                        </div>
                        
                        <div className="ticket-info">
                          <div className="ticket-info-label">Date</div>
                          <div className="ticket-info-value">{formatDate(ticket.event_date)}</div>
                        </div>
                        
                        <div className="ticket-info">
                          <div className="ticket-info-label">Lieu</div>
                          <div className="ticket-info-value">{ticket.venue || "Stade Olympique"}</div>
                        </div>
                        
                        <div className="ticket-info">
                          <div className="ticket-info-label">Catégorie</div>
                          <div className="ticket-info-value">{ticket.category || ticket.type}</div>
                        </div>
                        
                        <div className="ticket-info">
                          <div className="ticket-info-label">Prix</div>
                          <div className="ticket-info-value">{typeof ticket.price === 'number' ? ticket.price.toFixed(2) : ticket.price}€</div>
                        </div>
                      </Card.Body>
                      <Card.Footer className="text-center">
                        <Button 
                          variant="outline-secondary" 
                          className="ticket-download-btn"
                          disabled
                        >
                          Événement passé
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
        </Tabs>
      )}
      
      <Alert variant="info" className="mt-4 ticket-security-alert">
        <Alert.Heading>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-shield-lock me-2" viewBox="0 0 16 16">
            <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
            <path d="M9.5 6.5a1.5 1.5 0 0 1-1 1.415l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99a1.5 1.5 0 1 1 2-1.415z"/>
          </svg>
          Information de sécurité
        </Alert.Heading>
        <p>
          Vos e-tickets sont sécurisés par un système à double clé. Le QR code contient une signature unique 
          générée à partir de ces clés. Lors de la validation sur site, l'authenticité du billet sera vérifiée 
          et le billet sera marqué comme utilisé pour empêcher sa réutilisation.
        </p>
      </Alert>
    </Container>
  );
};

export default MyTickets;
