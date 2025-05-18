import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ManageOffers = () => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    location: '',
    price: '',
    quantity: '',
    category: 'standard'
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionSuccess, setActionSuccess] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    // Charger les offres
    loadOffers();
  }, [navigate]);

  const loadOffers = async () => {
    setIsLoading(true);
    
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Générer des données fictives pour la démo
      const mockOffers = [
        {
          id: 1,
          name: 'Cérémonie d\'ouverture',
          description: 'Assistez à la cérémonie d\'ouverture des Jeux Olympiques',
          event_date: '2025-07-26T20:00:00',
          location: 'Stade de France',
          price: 250,
          quantity: 10000,
          remaining: 2345,
          category: 'premium'
        },
        {
          id: 2,
          name: 'Finale Natation 100m',
          description: 'Finale du 100m nage libre hommes et femmes',
          event_date: '2025-08-02T19:30:00',
          location: 'Centre Aquatique Olympique',
          price: 150,
          quantity: 5000,
          remaining: 1200,
          category: 'standard'
        },
        {
          id: 3,
          name: 'Demi-finale Basketball',
          description: 'Demi-finale du tournoi de basketball',
          event_date: '2025-08-08T18:00:00',
          location: 'Bercy Arena',
          price: 180,
          quantity: 8000,
          remaining: 3500,
          category: 'standard'
        },
        {
          id: 4,
          name: 'Athlétisme - Finale 100m',
          description: 'Finale du 100m hommes et femmes',
          event_date: '2025-08-04T21:00:00',
          location: 'Stade de France',
          price: 200,
          quantity: 12000,
          remaining: 4200,
          category: 'premium'
        },
        {
          id: 5,
          name: 'Gymnastique - Finales',
          description: 'Finales de gymnastique artistique',
          event_date: '2025-08-10T14:00:00',
          location: 'Bercy Arena',
          price: 120,
          quantity: 6000,
          remaining: 2800,
          category: 'standard'
        }
      ];
      
      setOffers(mockOffers);
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formater les dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Formater les montants en euros
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
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

  // Valider le formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    }
    
    if (!formData.event_date) {
      errors.event_date = 'La date est requise';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Le lieu est requis';
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'Le prix doit être un nombre positif';
    }
    
    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      errors.quantity = 'La quantité doit être un nombre entier positif';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Ouvrir le modal d'ajout
  const handleAddClick = () => {
    setFormData({
      name: '',
      description: '',
      event_date: '',
      location: '',
      price: '',
      quantity: '',
      category: 'standard'
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Ouvrir le modal d'édition
  const handleEditClick = (offer) => {
    setCurrentOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description,
      event_date: new Date(offer.event_date).toISOString().slice(0, 16),
      location: offer.location,
      price: offer.price.toString(),
      quantity: offer.quantity.toString(),
      category: offer.category
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Ouvrir le modal de suppression
  const handleDeleteClick = (offer) => {
    setCurrentOffer(offer);
    setShowDeleteModal(true);
  };

  // Ajouter une offre
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simuler l'ajout d'une offre
        const newOffer = {
          id: offers.length + 1,
          name: formData.name,
          description: formData.description,
          event_date: new Date(formData.event_date).toISOString(),
          location: formData.location,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          remaining: parseInt(formData.quantity),
          category: formData.category
        };
        
        setOffers([...offers, newOffer]);
        setShowAddModal(false);
        setActionSuccess('Offre ajoutée avec succès');
        
        // Effacer le message de succès après 3 secondes
        setTimeout(() => {
          setActionSuccess(null);
        }, 3000);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'offre:', error);
      }
    }
  };

  // Mettre à jour une offre
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simuler la mise à jour d'une offre
        const updatedOffers = offers.map(offer => {
          if (offer.id === currentOffer.id) {
            return {
              ...offer,
              name: formData.name,
              description: formData.description,
              event_date: new Date(formData.event_date).toISOString(),
              location: formData.location,
              price: parseFloat(formData.price),
              quantity: parseInt(formData.quantity),
              category: formData.category
            };
          }
          return offer;
        });
        
        setOffers(updatedOffers);
        setShowEditModal(false);
        setActionSuccess('Offre mise à jour avec succès');
        
        // Effacer le message de succès après 3 secondes
        setTimeout(() => {
          setActionSuccess(null);
        }, 3000);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'offre:', error);
      }
    }
  };

  // Supprimer une offre
  const handleDeleteSubmit = async () => {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simuler la suppression d'une offre
      const updatedOffers = offers.filter(offer => offer.id !== currentOffer.id);
      
      setOffers(updatedOffers);
      setShowDeleteModal(false);
      setActionSuccess('Offre supprimée avec succès');
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'offre:', error);
    }
  };

  return (
    <Container>
      <h1 className="mb-4">Gestion des offres</h1>
      
      {actionSuccess && (
        <Alert variant="success">
          {actionSuccess}
        </Alert>
      )}
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Liste des offres</h5>
            <Button variant="primary" onClick={handleAddClick}>
              <i className="bi bi-plus-circle me-2"></i>
              Ajouter une offre
            </Button>
          </div>
          
          {isLoading ? (
            <Alert variant="secondary">Chargement des offres...</Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Prix</th>
                  <th>Disponibilité</th>
                  <th>Catégorie</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(offer => (
                  <tr key={offer.id}>
                    <td>{offer.id}</td>
                    <td>{offer.name}</td>
                    <td>{formatDate(offer.event_date)}</td>
                    <td>{offer.location}</td>
                    <td>{formatCurrency(offer.price)}</td>
                    <td>
                      {offer.remaining} / {offer.quantity}
                      <div className="progress mt-1" style={{ height: '5px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${(offer.remaining / offer.quantity) * 100}%` }}
                          aria-valuenow={(offer.remaining / offer.quantity) * 100}
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </td>
                    <td>
                      <Badge bg={offer.category === 'premium' ? 'warning' : 'primary'}>
                        {offer.category === 'premium' ? 'Premium' : 'Standard'}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="me-1"
                        onClick={() => handleEditClick(offer)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteClick(offer)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal d'ajout d'offre */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une offre</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de l'événement</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date et heure</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.event_date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.event_date}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                isInvalid={!!formErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Lieu</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                isInvalid={!!formErrors.location}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.location}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix (€)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.price}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.price}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantité</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    step="1"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.quantity}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.quantity}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleAddSubmit}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal d'édition d'offre */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier une offre</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de l'événement</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date et heure</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.event_date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.event_date}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                isInvalid={!!formErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Lieu</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                isInvalid={!!formErrors.location}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.location}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix (€)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.price}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.price}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantité</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    step="1"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.quantity}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.quantity}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal de suppression d'offre */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOffer && (
            <p>
              Êtes-vous sûr de vouloir supprimer l'offre <strong>{currentOffer.name}</strong> ?
              Cette action est irréversible.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteSubmit}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageOffers;
