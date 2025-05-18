import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'react-qr-scanner';
import './TicketScanner.css';

const TicketScanner = () => {
  const [qrData, setQrData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [useCameraScanner, setUseCameraScanner] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est un employé
    const isEmployee = localStorage.getItem('is_employee') === 'true';
    
    if (!isEmployee) {
      navigate('/');
      return;
    }
  }, [navigate]);

  const handleQrDataChange = (e) => {
    setQrData(e.target.value);
  };

  const handleCameraError = (err) => {
    console.error('Erreur de caméra:', err);
    setCameraError('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
    setUseCameraScanner(false);
  };

  const handleCameraScan = (data) => {
    if (data && !isScanning && !scanResult) {
      // La caméra a détecté un QR code
      setQrData(data.text);
      validateQrCode(data.text);
    }
  };

  const toggleCameraScanner = () => {
    setCameraError(null);
    setUseCameraScanner(!useCameraScanner);
  };

  const validateQrCode = async (qrCodeData) => {
    if (!qrCodeData.trim()) {
      setError('Veuillez entrer les données du QR code');
      return;
    }
    
    setIsScanning(true);
    setError(null);
    setScanResult(null);
    
    try {
      // Simuler un appel API au service de validation
      // Dans une implémentation réelle, nous ferions un appel au service de validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Vérifier le format des données du QR code
      // Format attendu: ticketId:securityKey1:securityKey2
      const parts = qrCodeData.split(':');
      if (parts.length !== 3) {
        throw new Error('Format de QR code invalide');
      }
      
      const ticketId = parts[0];
      const securityKey1 = parts[1];
      const securityKey2 = parts[2];
      
      // Simuler une validation réussie ou échouée de manière aléatoire
      // Dans une implémentation réelle, nous vérifierions l'authenticité du billet
      // en utilisant les deux clés de sécurité
      
      // 90% de chance que le billet soit valide
      const isValid = Math.random() > 0.1;
      
      // Générer un résultat de validation simulé
      const result = {
        is_valid: isValid,
        ticket_id: ticketId,
        user_name: 'John Doe',
        offer_name: 'Finale Natation',
        purchase_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 jours avant
        validation_date: new Date().toISOString()
      };
      
      setScanResult(result);
      
      // Enregistrer la validation dans l'historique local
      const history = JSON.parse(localStorage.getItem('validation_history') || '[]');
      history.push({
        ...result,
        employee_id: localStorage.getItem('user_email')
      });
      localStorage.setItem('validation_history', JSON.stringify(history));
      
    } catch (err) {
      setError(err.message || 'Erreur lors de la validation du billet');
    } finally {
      setIsScanning(false);
      // Désactiver la caméra après un scan réussi
      if (useCameraScanner) {
        setUseCameraScanner(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateQrCode(qrData);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleScanAnother = () => {
    setQrData('');
    setScanResult(null);
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="scanner-title mb-1">Scanner de Tickets</h1>
          <p className="scanner-subtitle text-muted mb-0">Validez les tickets des visiteurs</p>
        </div>
        <Badge bg="primary" pill className="px-3 py-2">Validation</Badge>
      </div>
      
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="scanner-card">
            <Card.Header>
              <div className="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-qr-code-scan me-2" viewBox="0 0 16 16">
                  <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1 0-1M.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5M4 4h1v1H4zm2 0h1v1H6zm1 1h1v1H7zM4 6h1v1H4zm2 0h1v1H6zm-2 2h1v1H4zm2 0h1v1H6zm1 1h1v1H7zM4 10h1v1H4zm2 0h1v1H6zm1 1h1v1H7zM8 4h1v1H8zm2 0h1v1h-1zm1 1h1v1h-1zM8 6h1v1H8zm2 0h1v1h-1zm1 1h1v1h-1zM8 8h1v1H8zm2 0h1v1h-1zm1 1h1v1h-1zm0 2h1v1h-1zM9 9h1v1H9zm0 2h1v1H9zm-1 1h1v1H8z"/>
                </svg>
                <h5 className="mb-0">Validation de Tickets</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {!scanResult ? (
                <>
                  <p className="mb-4">
                    Scannez le QR code du billet avec la caméra ou entrez manuellement les données du QR code.
                  </p>
                  
                  {error && (
                    <Alert variant="danger" className="scanner-alert">
                      <div className="scanner-alert-heading">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </svg>
                        <span>{error}</span>
                      </div>
                    </Alert>
                  )}
                  
                  {cameraError && (
                    <Alert variant="warning" className="scanner-alert">
                      <div className="scanner-alert-heading">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-camera-video-off me-2" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518l.605.847zM1.428 4.18A.999.999 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634l.58.814zM15 11.73l-3.5-1.555v-4.35L15 4.269v7.462zm-4.407 3.56-10-14 .814-.58 10 14-.814.58z"/>
                        </svg>
                        <span>{cameraError}</span>
                      </div>
                    </Alert>
                  )}
                  
                  {useCameraScanner ? (
                    <div className="scanner-container mb-4">
                      <div className="text-center mb-3">
                        <Badge bg="info" pill className="px-3 py-2 mb-2">Caméra active</Badge>
                        <p className="small text-muted mt-2">Positionnez le QR code devant la caméra</p>
                      </div>
                      
                      <QrScanner
                        delay={300}
                        onError={handleCameraError}
                        onScan={handleCameraScan}
                        style={{ width: '100%' }}
                        constraints={{
                          video: { facingMode: 'environment' }
                        }}
                      />
                      
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        className="scanner-camera-toggle"
                        onClick={toggleCameraScanner}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                        </svg>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center mb-4">
                      <Button 
                        variant="primary" 
                        onClick={toggleCameraScanner}
                        className="scanner-btn scanner-btn-lg mb-3"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-camera me-2" viewBox="0 0 16 16">
                          <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
                          <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
                        </svg>
                        Activer la caméra pour scanner
                      </Button>
                      
                      <p className="small text-muted">ou entrez le code manuellement ci-dessous</p>
                    </div>
                  )}
                  
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Données du QR code</Form.Label>
                      <Form.Control
                        type="text"
                        value={qrData}
                        onChange={handleQrDataChange}
                        placeholder="Format: ticketId:securityKey1:securityKey2"
                        disabled={isScanning}
                        className="scanner-form-control"
                      />
                      <Form.Text className="text-muted">
                        Exemple: 12345:abc123def456:xyz789ghi012
                      </Form.Text>
                    </Form.Group>
                    
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={isScanning}
                      className="w-100 scanner-btn"
                    >
                      {isScanning ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Validation en cours...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2-circle me-2" viewBox="0 0 16 16">
                            <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z"/>
                            <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z"/>
                          </svg>
                          Valider le billet
                        </>
                      )}
                    </Button>
                  </Form>
                </>
              ) : (
                <div className="text-center">
                  <h4 className="mb-4">Résultat de la validation</h4>
                  
                  {scanResult.is_valid ? (
                    <Alert variant="success" className="scanner-alert">
                      <div className="scanner-alert-heading">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                        <span className="fs-5 fw-bold">Billet valide</span>
                      </div>
                      <p className="mt-2 mb-0">Le billet a été validé avec succès et enregistré dans l'historique.</p>
                    </Alert>
                  ) : (
                    <Alert variant="danger" className="scanner-alert">
                      <div className="scanner-alert-heading">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x-circle-fill me-2" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                        </svg>
                        <span className="fs-5 fw-bold">Billet invalide</span>
                      </div>
                      <p className="mt-2 mb-0">Le billet n'est pas valide ou a déjà été utilisé.</p>
                    </Alert>
                  )}
                  
                  <Card className="scanner-result-card">
                    <Card.Body>
                      <div className="scanner-result-row">
                        <Row>
                          <Col md={4} className="scanner-result-label text-start">ID du billet:</Col>
                          <Col md={8} className="scanner-result-value text-start">{scanResult.ticket_id}</Col>
                        </Row>
                      </div>
                      <div className="scanner-result-row">
                        <Row>
                          <Col md={4} className="scanner-result-label text-start">Utilisateur:</Col>
                          <Col md={8} className="scanner-result-value text-start">{scanResult.user_name}</Col>
                        </Row>
                      </div>
                      <div className="scanner-result-row">
                        <Row>
                          <Col md={4} className="scanner-result-label text-start">Événement:</Col>
                          <Col md={8} className="scanner-result-value text-start">{scanResult.offer_name}</Col>
                        </Row>
                      </div>
                      <div className="scanner-result-row">
                        <Row>
                          <Col md={4} className="scanner-result-label text-start">Date d'achat:</Col>
                          <Col md={8} className="scanner-result-value text-start">{formatDate(scanResult.purchase_date)}</Col>
                        </Row>
                      </div>
                      <div className="scanner-result-row">
                        <Row>
                          <Col md={4} className="scanner-result-label text-start">Date de validation:</Col>
                          <Col md={8} className="scanner-result-value text-start">{formatDate(scanResult.validation_date)}</Col>
                        </Row>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  <Button 
                    variant="primary" 
                    onClick={handleScanAnother}
                    className="scanner-btn mt-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-repeat me-2" viewBox="0 0 16 16">
                      <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                      <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                    </svg>
                    Scanner un autre billet
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TicketScanner;
