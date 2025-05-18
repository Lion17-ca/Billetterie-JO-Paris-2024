import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [userEmail, setUserEmail] = useState('');
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    topEvents: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    const email = localStorage.getItem('user_email');
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    setUserEmail(email);
    
    // Simuler le chargement des statistiques de vente
    const loadStats = async () => {
      setIsLoading(true);
      
      try {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Générer des données fictives pour la démo
        const mockStats = {
          totalSales: Math.floor(Math.random() * 10000) + 5000,
          totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
          topEvents: [
            { 
              id: 1, 
              name: 'Cérémonie d\'ouverture', 
              sales: Math.floor(Math.random() * 1000) + 500,
              revenue: Math.floor(Math.random() * 200000) + 100000
            },
            { 
              id: 2, 
              name: 'Finale Natation 100m', 
              sales: Math.floor(Math.random() * 800) + 300,
              revenue: Math.floor(Math.random() * 150000) + 80000
            },
            { 
              id: 3, 
              name: 'Demi-finale Basketball', 
              sales: Math.floor(Math.random() * 600) + 200,
              revenue: Math.floor(Math.random() * 100000) + 50000
            },
            { 
              id: 4, 
              name: 'Athlétisme - Finale 100m', 
              sales: Math.floor(Math.random() * 500) + 200,
              revenue: Math.floor(Math.random() * 80000) + 40000
            },
            { 
              id: 5, 
              name: 'Gymnastique - Finales', 
              sales: Math.floor(Math.random() * 400) + 150,
              revenue: Math.floor(Math.random() * 60000) + 30000
            }
          ]
        };
        
        setSalesStats(mockStats);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [navigate]);

  // Formater les montants en euros
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <Container>
      <h1 className="mb-4">Tableau de bord administrateur</h1>
      
      <Alert variant="info">
        <Alert.Heading>Bienvenue, {userEmail}</Alert.Heading>
        <p>
          Vous êtes connecté en tant qu'administrateur. Vous pouvez gérer les offres et consulter les rapports de vente.
        </p>
      </Alert>
      
      {isLoading ? (
        <Alert variant="secondary">Chargement des statistiques...</Alert>
      ) : (
        <>
          <Row className="mt-4">
            <Col md={6}>
              <Card className="mb-4 shadow-sm">
                <Card.Body className="text-center">
                  <h5>Ventes totales</h5>
                  <h2 className="display-4">{salesStats.totalSales}</h2>
                  <p className="text-muted">Billets vendus</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="mb-4 shadow-sm">
                <Card.Body className="text-center">
                  <h5>Revenus totaux</h5>
                  <h2 className="display-4">{formatCurrency(salesStats.totalRevenue)}</h2>
                  <p className="text-muted">Chiffre d'affaires</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Top 5 des événements</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Événement</th>
                    <th>Ventes</th>
                    <th>Revenus</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salesStats.topEvents.map((event, index) => (
                    <tr key={event.id}>
                      <td>{index + 1}</td>
                      <td>{event.name}</td>
                      <td>{event.sales} billets</td>
                      <td>{formatCurrency(event.revenue)}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => navigate(`/sales-reports/${event.id}`)}
                        >
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          
          <Row className="mt-4 mb-5">
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body className="text-center">
                  <h5>Gestion des offres</h5>
                  <p>Créez, modifiez ou supprimez des offres de billets</p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/manage-offers')}
                    className="mt-2"
                  >
                    Gérer les offres
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body className="text-center">
                  <h5>Rapports détaillés</h5>
                  <p>Consultez les rapports détaillés des ventes</p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/sales-reports')}
                    className="mt-2"
                  >
                    Voir les rapports
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
