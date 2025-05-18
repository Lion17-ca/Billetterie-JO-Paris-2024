import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SalesReports = () => {
  const [salesData, setSalesData] = useState({
    dailySales: [],
    categoryBreakdown: {},
    locationBreakdown: {},
    topSellingEvents: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    // Charger les données de vente
    loadSalesData(dateRange);
  }, [navigate, dateRange]);

  const loadSalesData = async (range) => {
    setIsLoading(true);
    
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Générer des données fictives pour la démo
      const today = new Date();
      const dailySales = [];
      
      // Générer des données de ventes quotidiennes
      let daysToGenerate = 7;
      if (range === 'month') {
        daysToGenerate = 30;
      } else if (range === 'year') {
        daysToGenerate = 12; // Mois au lieu de jours pour l'année
      }
      
      for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date();
        
        if (range === 'year') {
          // Pour l'année, nous utilisons les mois
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleString('fr-FR', { month: 'long' });
          
          dailySales.unshift({
            date: monthName,
            sales: Math.floor(Math.random() * 2000) + 500,
            revenue: Math.floor(Math.random() * 300000) + 100000
          });
        } else {
          // Pour la semaine et le mois, nous utilisons les jours
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
          
          dailySales.unshift({
            date: dayName,
            sales: Math.floor(Math.random() * 500) + 100,
            revenue: Math.floor(Math.random() * 80000) + 20000
          });
        }
      }
      
      // Répartition par catégorie
      const categoryBreakdown = {
        'Standard': Math.floor(Math.random() * 5000) + 3000,
        'Premium': Math.floor(Math.random() * 3000) + 1000
      };
      
      // Répartition par lieu
      const locationBreakdown = {
        'Stade de France': Math.floor(Math.random() * 3000) + 1500,
        'Centre Aquatique Olympique': Math.floor(Math.random() * 2000) + 1000,
        'Bercy Arena': Math.floor(Math.random() * 1500) + 800,
        'Roland Garros': Math.floor(Math.random() * 1000) + 500,
        'Vélodrome National': Math.floor(Math.random() * 800) + 400
      };
      
      // Top événements
      const topSellingEvents = [
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
      ];
      
      setSalesData({
        dailySales,
        categoryBreakdown,
        locationBreakdown,
        topSellingEvents
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données de vente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formater les montants en euros
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Calculer les totaux
  const calculateTotals = () => {
    const totalSales = salesData.dailySales.reduce((sum, day) => sum + day.sales, 0);
    const totalRevenue = salesData.dailySales.reduce((sum, day) => sum + day.revenue, 0);
    
    return { totalSales, totalRevenue };
  };

  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    // Données pour le graphique des ventes quotidiennes
    const dailyChartData = {
      labels: salesData.dailySales.map(day => day.date),
      datasets: [
        {
          label: 'Ventes',
          data: salesData.dailySales.map(day => day.sales),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
    
    // Données pour le graphique des revenus quotidiens
    const revenueChartData = {
      labels: salesData.dailySales.map(day => day.date),
      datasets: [
        {
          label: 'Revenus (€)',
          data: salesData.dailySales.map(day => day.revenue),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
    
    // Données pour le graphique de répartition par catégorie
    const categoryChartData = {
      labels: Object.keys(salesData.categoryBreakdown),
      datasets: [
        {
          data: Object.values(salesData.categoryBreakdown),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // Données pour le graphique de répartition par lieu
    const locationChartData = {
      labels: Object.keys(salesData.locationBreakdown),
      datasets: [
        {
          label: 'Ventes par lieu',
          data: Object.values(salesData.locationBreakdown),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    return { dailyChartData, revenueChartData, categoryChartData, locationChartData };
  };

  // Options pour les graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ventes quotidiennes',
      },
    },
  };

  const { totalSales, totalRevenue } = calculateTotals();
  const { dailyChartData, revenueChartData, categoryChartData, locationChartData } = prepareChartData();

  return (
    <Container>
      <h1 className="mb-4">Rapports de vente</h1>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Période d'analyse</h5>
            <Form.Select 
              style={{ width: '200px' }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">12 derniers mois</option>
            </Form.Select>
          </div>
          
          {isLoading ? (
            <Alert variant="secondary">Chargement des données...</Alert>
          ) : (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5>Ventes totales</h5>
                      <h2 className="display-4">{totalSales}</h2>
                      <p className="text-muted">Billets vendus</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5>Revenus totaux</h5>
                      <h2 className="display-4">{formatCurrency(totalRevenue)}</h2>
                      <p className="text-muted">Chiffre d'affaires</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="overview" title="Vue d'ensemble">
                  <Row>
                    <Col md={6}>
                      <Card className="mb-4">
                        <Card.Header>Ventes quotidiennes</Card.Header>
                        <Card.Body>
                          <div style={{ height: '300px' }}>
                            <Bar data={dailyChartData} options={chartOptions} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mb-4">
                        <Card.Header>Revenus quotidiens</Card.Header>
                        <Card.Body>
                          <div style={{ height: '300px' }}>
                            <Line data={revenueChartData} options={chartOptions} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>
                <Tab eventKey="breakdown" title="Répartition des ventes">
                  <Row>
                    <Col md={6}>
                      <Card className="mb-4">
                        <Card.Header>Ventes par catégorie</Card.Header>
                        <Card.Body>
                          <div style={{ height: '300px' }}>
                            <Pie data={categoryChartData} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mb-4">
                        <Card.Header>Ventes par lieu</Card.Header>
                        <Card.Body>
                          <div style={{ height: '300px' }}>
                            <Bar data={locationChartData} options={chartOptions} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>
                <Tab eventKey="events" title="Top événements">
                  <Card>
                    <Card.Header>Top 5 des événements</Card.Header>
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
                          {salesData.topSellingEvents.map((event, index) => (
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
                </Tab>
              </Tabs>
              
              <div className="text-center mt-4">
                <Button 
                  variant="primary" 
                  onClick={() => {
                    alert('Fonctionnalité d\'export en cours de développement');
                  }}
                >
                  Exporter les données (CSV)
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SalesReports;
