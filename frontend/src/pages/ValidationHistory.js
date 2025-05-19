import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Form, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ValidationHistory = () => {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est un employé et non un administrateur
    const isEmployee = localStorage.getItem('is_employee') === 'true';
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    
    // Si c'est un administrateur, le rediriger vers le tableau de bord admin
    if (isAdmin) {
      navigate('/admin-dashboard');
      return;
    }
    
    // Si ce n'est pas un employé, le rediriger vers l'accueil
    if (!isEmployee) {
      navigate('/');
      return;
    }
    
    // Charger l'historique des validations
    const loadValidations = async () => {
      setLoading(true);
      
      try {
        // Dans une implémentation réelle, nous ferions un appel au service de validation
        // Pour la démo, nous utilisons le stockage local
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const history = JSON.parse(localStorage.getItem('validation_history') || '[]');
        
        // Ajouter des données de test si l'historique est vide
        if (history.length === 0) {
          const testData = generateTestData();
          localStorage.setItem('validation_history', JSON.stringify(testData));
          setValidations(testData);
        } else {
          setValidations(history);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des validations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadValidations();
  }, [navigate]);

  // Générer des données de test pour la démo
  const generateTestData = () => {
    const events = [
      'Finale Natation',
      'Athlétisme - 100m',
      'Gymnastique - Finales',
      'Basketball - Demi-finale',
      'Cérémonie d\'ouverture'
    ];
    
    const users = [
      'John Doe',
      'Jane Smith',
      'Robert Johnson',
      'Emily Davis',
      'Michael Brown'
    ];
    
    const testData = [];
    
    for (let i = 1; i <= 20; i++) {
      const date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 48));
      
      testData.push({
        ticket_id: 1000 + i,
        user_name: users[Math.floor(Math.random() * users.length)],
        offer_name: events[Math.floor(Math.random() * events.length)],
        purchase_date: new Date(date.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        validation_date: date.toISOString(),
        is_valid: Math.random() > 0.1, // 10% de billets invalides
        employee_id: localStorage.getItem('user_email')
      });
    }
    
    return testData;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredValidations = filter === 'all' 
    ? validations 
    : filter === 'valid' 
      ? validations.filter(v => v.is_valid) 
      : validations.filter(v => !v.is_valid);

  return (
    <Container>
      <h1 className="mb-4">Historique des validations</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h5>Statistiques</h5>
              <Row>
                <Col xs={4} className="text-center">
                  <h3>{validations.length}</h3>
                  <p className="text-muted">Total</p>
                </Col>
                <Col xs={4} className="text-center">
                  <h3>{validations.filter(v => v.is_valid).length}</h3>
                  <p className="text-muted text-success">Valides</p>
                </Col>
                <Col xs={4} className="text-center">
                  <h3>{validations.filter(v => !v.is_valid).length}</h3>
                  <p className="text-muted text-danger">Invalides</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filtrer par statut</Form.Label>
            <Form.Select 
              value={filter} 
              onChange={handleFilterChange}
            >
              <option value="all">Toutes les validations</option>
              <option value="valid">Validations réussies</option>
              <option value="invalid">Validations échouées</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      {loading ? (
        <Alert variant="info">Chargement de l'historique des validations...</Alert>
      ) : filteredValidations.length === 0 ? (
        <Alert variant="warning">Aucune validation trouvée pour ce filtre.</Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>ID Billet</th>
                  <th>Utilisateur</th>
                  <th>Événement</th>
                  <th>Date de validation</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredValidations.map((validation, index) => (
                  <tr key={index}>
                    <td>{validation.ticket_id}</td>
                    <td>{validation.user_name}</td>
                    <td>{validation.offer_name}</td>
                    <td>{formatDate(validation.validation_date)}</td>
                    <td>
                      {validation.is_valid ? (
                        <Badge bg="success">Valide</Badge>
                      ) : (
                        <Badge bg="danger">Invalide</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
      
      <div className="mt-4">
        <Button 
          variant="primary" 
          onClick={() => navigate('/ticket-scanner')}
        >
          Scanner un nouveau billet
        </Button>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/employee-dashboard')}
          className="ms-2"
        >
          Retour au tableau de bord
        </Button>
      </div>
    </Container>
  );
};

export default ValidationHistory;
