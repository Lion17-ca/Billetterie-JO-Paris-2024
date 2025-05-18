import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Form, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './OffersList.css';

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  useEffect(() => {
    // Simuler un appel API pour récupérer les offres
    // Dans une implémentation réelle, nous ferions un appel au service de billetterie
    const fetchOffers = async () => {
      try {
        setLoading(true);
        // Simulation d'un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données simulées avec plus de sports olympiques
        const mockOffers = [
          {
            id: 1,
            name: "Natation - Finales",
            description: "Finales de natation incluant le 100m nage libre, 200m papillon et relais 4x100m.",
            price: 150.00,
            quantity: 100,
            type: "solo",
            event_date: "2025-07-28T19:00:00Z",
            image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Centre Aquatique Olympique",
            sport: "natation",
            popularity: 4.8
          },
          {
            id: 2,
            name: "Athlétisme - 100m",
            description: "Assistez à la finale du 100m hommes, l'événement le plus attendu des Jeux.",
            price: 200.00,
            quantity: 50,
            type: "duo",
            event_date: "2025-08-02T20:00:00Z",
            image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Stade Olympique",
            sport: "athletisme",
            popularity: 5.0
          },
          {
            id: 3,
            name: "Gymnastique - Finales",
            description: "Finales de gymnastique artistique incluant sol, barres asymétriques et poutre.",
            price: 180.00,
            quantity: 75,
            type: "familiale",
            event_date: "2025-07-30T14:00:00Z",
            image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Arena Bercy",
            sport: "gymnastique",
            popularity: 4.7
          },
          {
            id: 4,
            name: "Basketball - Demi-finale",
            description: "Demi-finale du tournoi de basketball masculin.",
            price: 250.00,
            quantity: 30,
            type: "duo",
            event_date: "2025-08-05T18:00:00Z",
            image: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Accor Arena",
            sport: "basketball",
            popularity: 4.9
          },
          {
            id: 5,
            name: "Cérémonie d'ouverture",
            description: "Assistez à la spectaculaire cérémonie d'ouverture des Jeux Olympiques.",
            price: 500.00,
            quantity: 20,
            type: "familiale",
            event_date: "2025-07-26T20:00:00Z",
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Seine - Paris",
            sport: "ceremonie",
            popularity: 5.0
          },
          {
            id: 6,
            name: "Escrime - Finale Épée",
            description: "Finale du tournoi d'épée individuel hommes et femmes.",
            price: 120.00,
            quantity: 85,
            type: "solo",
            event_date: "2025-07-29T15:30:00Z",
            image: "https://images.unsplash.com/photo-1566577825762-58dd08400a8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Grand Palais",
            sport: "escrime",
            popularity: 4.3
          },
          {
            id: 7,
            name: "Judo - Finales",
            description: "Finales des catégories poids lourds hommes et femmes.",
            price: 130.00,
            quantity: 60,
            type: "solo",
            event_date: "2025-08-01T13:00:00Z",
            image: "https://images.unsplash.com/photo-1616347646180-4b0048b8ec0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Champ-de-Mars Arena",
            sport: "judo",
            popularity: 4.5
          },
          {
            id: 8,
            name: "Tennis - Finale Hommes",
            description: "Finale du tournoi de tennis masculin en simple.",
            price: 280.00,
            quantity: 25,
            type: "duo",
            event_date: "2025-08-08T15:00:00Z",
            image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Roland Garros",
            sport: "tennis",
            popularity: 4.8
          },
          {
            id: 9,
            name: "Boxe - Finales",
            description: "Finales de boxe dans plusieurs catégories de poids.",
            price: 150.00,
            quantity: 70,
            type: "solo",
            event_date: "2025-08-06T19:30:00Z",
            image: "https://images.unsplash.com/photo-1517637382994-f02da38c6728?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Paris Nord Arena",
            sport: "boxe",
            popularity: 4.6
          },
          {
            id: 10,
            name: "Volleyball - Demi-finales",
            description: "Demi-finales du tournoi de volleyball féminin.",
            price: 120.00,
            quantity: 90,
            type: "familiale",
            event_date: "2025-08-04T17:00:00Z",
            image: "https://images.unsplash.com/photo-1574271143515-5cddf8da19be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "South Paris Arena",
            sport: "volleyball",
            popularity: 4.4
          },
          {
            id: 11,
            name: "Tir à l'arc - Finales",
            description: "Finales individuelles et par équipes de tir à l'arc.",
            price: 90.00,
            quantity: 120,
            type: "solo",
            event_date: "2025-07-31T10:00:00Z",
            image: "https://images.unsplash.com/photo-1565116175827-64847f972a3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Invalides",
            sport: "tir_arc",
            popularity: 4.2
          },
          {
            id: 12,
            name: "Cyclisme sur piste - Finales",
            description: "Finales de vitesse individuelle et poursuite par équipes.",
            price: 110.00,
            quantity: 80,
            type: "duo",
            event_date: "2025-08-03T14:00:00Z",
            image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Vélodrome National",
            sport: "cyclisme",
            popularity: 4.5
          },
          {
            id: 13,
            name: "Canoë-kayak slalom - Finales",
            description: "Finales de canoë et kayak slalom hommes et femmes.",
            price: 95.00,
            quantity: 100,
            type: "familiale",
            event_date: "2025-07-29T11:00:00Z",
            image: "https://images.unsplash.com/photo-1572132520208-e8d3e5cee318?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Stade Nautique de Vaires-sur-Marne",
            sport: "canoe",
            popularity: 4.3
          },
          {
            id: 14,
            name: "Taekwondo - Finales",
            description: "Finales de taekwondo dans plusieurs catégories de poids.",
            price: 85.00,
            quantity: 110,
            type: "solo",
            event_date: "2025-08-07T16:00:00Z",
            image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Grand Palais",
            sport: "taekwondo",
            popularity: 4.1
          },
          {
            id: 15,
            name: "Plongeon - Finales",
            description: "Finales de plongeon à 10m individuel et synchronisé.",
            price: 130.00,
            quantity: 70,
            type: "duo",
            event_date: "2025-07-30T19:00:00Z",
            image: "https://images.unsplash.com/photo-1560090995-01632a28895b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Centre Aquatique Olympique",
            sport: "plongeon",
            popularity: 4.7
          },
          {
            id: 16,
            name: "Cérémonie de clôture",
            description: "Assistez à la cérémonie de clôture des Jeux Olympiques.",
            price: 450.00,
            quantity: 30,
            type: "familiale",
            event_date: "2025-08-11T20:00:00Z",
            image: "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Stade de France",
            sport: "ceremonie",
            popularity: 5.0
          },
          {
            id: 17,
            name: "Judo - Finales Hommes",
            description: "Finales de judo dans plusieurs catégories de poids hommes.",
            price: 140.00,
            quantity: 60,
            type: "duo",
            event_date: "2025-08-01T13:00:00Z",
            image: "https://images.unsplash.com/photo-1553531889-e6cf4d692b1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Champ-de-Mars Arena",
            sport: "judo",
            popularity: 4.6
          },
          {
            id: 18,
            name: "Tennis - Finale Hommes Double",
            description: "Finale du tournoi de tennis double hommes.",
            price: 280.00,
            quantity: 40,
            type: "duo",
            event_date: "2025-08-03T14:00:00Z",
            image: "https://images.unsplash.com/photo-1622279457486-28f703f58db4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Roland Garros",
            sport: "tennis",
            popularity: 4.7
          },
          {
            id: 19,
            name: "Volleyball - Demi-finale Femmes",
            description: "Demi-finale du tournoi de volleyball féminin.",
            price: 160.00,
            quantity: 70,
            type: "familiale",
            event_date: "2025-08-06T17:00:00Z",
            image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "South Paris Arena",
            sport: "volleyball",
            popularity: 4.5
          },
          {
            id: 20,
            name: "Boxe - Finales Poids Lourds",
            description: "Finales de boxe dans la catégorie poids lourds.",
            price: 190.00,
            quantity: 45,
            type: "solo",
            event_date: "2025-08-04T19:30:00Z",
            image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Roland Garros - Court Suzanne Lenglen",
            sport: "boxe",
            popularity: 4.8
          },
          {
            id: 21,
            name: "Cyclisme sur piste - Poursuite",
            description: "Finales de cyclisme sur piste incluant vitesse individuelle et poursuite par équipes.",
            price: 130.00,
            quantity: 90,
            type: "duo",
            event_date: "2025-07-31T16:00:00Z",
            image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Vélodrome National",
            sport: "cyclisme",
            popularity: 4.4
          },
          {
            id: 22,
            name: "Cérémonie de clôture - Places Premium",
            description: "Assistez à la cérémonie de clôture des Jeux Olympiques avec des places premium.",
            price: 550.00,
            quantity: 25,
            type: "familiale",
            event_date: "2025-08-11T20:00:00Z",
            image: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            location: "Stade de France",
            sport: "ceremonie",
            popularity: 5.0
          }
        ];
        
        setOffers(mockOffers);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des offres. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleAddToCart = (offer) => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Ajouter l'offre au panier
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(offer);
    localStorage.setItem('cart', JSON.stringify(cart));

    // Rediriger vers le panier
    navigate('/cart');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'solo':
        return <span className="offer-badge offer-badge-solo">Solo (1 billet)</span>;
      case 'duo':
        return <span className="offer-badge offer-badge-duo">Duo (2 billets)</span>;
      case 'familiale':
        return <span className="offer-badge offer-badge-family">Famille (4 billets)</span>;
      default:
        return <span className="offer-badge">{type}</span>;
    }
  };
  
  const getSportIcon = (sport) => {
    switch (sport) {
      case 'natation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-water" viewBox="0 0 16 16">
            <path d="M.036 3.314a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0L.314 3.964a.5.5 0 0 1-.278-.65zm0 3a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0L.314 6.964a.5.5 0 0 1-.278-.65zm0 3a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0L.314 9.964a.5.5 0 0 1-.278-.65zm0 3a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.757-.703a.5.5 0 0 1-.278-.65z"/>
          </svg>
        );
      case 'athletisme':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-stopwatch" viewBox="0 0 16 16">
            <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5V5.6z"/>
            <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64a.715.715 0 0 1 .012-.013l.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354a.512.512 0 0 1-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5zM8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3z"/>
          </svg>
        );
      case 'gymnastique':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-person-arms-up" viewBox="0 0 16 16">
            <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
            <path d="m5.93 6.704-.846 8.451a.768.768 0 0 0 1.523.203l.81-4.865a.59.59 0 0 1 1.165 0l.81 4.865a.768.768 0 0 0 1.523-.203l-.845-8.451A1.492 1.492 0 0 1 10.5 5.5L13 2.284a.796.796 0 0 0-1.239-.998L9.634 3.84a.72.72 0 0 1-.33.235c-.23.074-.665.176-1.304.176-.64 0-1.074-.102-1.305-.176a.72.72 0 0 1-.329-.235L4.239 1.286a.796.796 0 0 0-1.24.998l2.5 3.216c.317.316.475.758.43 1.204Z"/>
          </svg>
        );
      case 'basketball':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-dribbble" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 0C3.584 0 0 3.584 0 8s3.584 8 8 8c4.408 0 8-3.584 8-8s-3.592-8-8-8zm5.284 3.688a6.802 6.802 0 0 1 1.545 4.251c-.226-.043-2.482-.503-4.755-.217-.052-.112-.096-.234-.148-.355-.139-.33-.295-.668-.451-.99 2.516-1.023 3.662-2.498 3.81-2.69zM8 1.18c1.735 0 3.323.65 4.53 1.718-.122.174-1.155 1.553-3.584 2.464-1.12-2.056-2.36-3.74-2.551-4A6.95 6.95 0 0 1 8 1.18zm-2.907.642A43.123 43.123 0 0 1 7.627 5.77c-3.193.85-6.013.833-6.317.833a6.865 6.865 0 0 1 3.783-4.78zM1.163 8.01V7.8c.295.01 3.61.053 7.02-.971.199.381.381.772.555 1.162l-.27.078c-3.522 1.137-5.396 4.243-5.553 4.504a6.817 6.817 0 0 1-1.752-4.564zM8 14.837a6.785 6.785 0 0 1-4.19-1.44c.12-.252 1.509-2.924 5.361-4.269.018-.009.026-.009.044-.017a28.246 28.246 0 0 1 1.457 5.18A6.722 6.722 0 0 1 8 14.837zm3.81-1.171c-.07-.417-.435-2.412-1.328-4.868 2.143-.338 4.017.217 4.251.295a6.774 6.774 0 0 1-2.924 4.573z"/>
          </svg>
        );
      case 'ceremonie':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-stars" viewBox="0 0 16 16">
            <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828l.645-1.937zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.734 1.734 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.734 1.734 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.734 1.734 0 0 0 3.407 2.31l.387-1.162zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L10.863.1z"/>
          </svg>
        );
      case 'escrime':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-slash-lg" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
          </svg>
        );
      case 'judo':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-person-fill-lock" viewBox="0 0 16 16">
            <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9 8c0 1 1 1 1 1h5v-1a1.9 1.9 0 0 1 .01-.2 4.49 4.49 0 0 1 1.534-3.693C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Zm7 0a1 1 0 0 1 1-1v-1a2 2 0 1 1 4 0v1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2Zm3-3a1 1 0 0 0-1 1v1h2v-1a1 1 0 0 0-1-1Z"/>
          </svg>
        );
      case 'tennis':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          </svg>
        );
      case 'volleyball':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-record-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
          </svg>
        );
      case 'boxe':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
            <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
          </svg>
        );
      case 'cyclisme':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-bicycle" viewBox="0 0 16 16">
            <path d="M4 4.5a.5.5 0 0 1 .5-.5H6a.5.5 0 0 1 0 1v.5h4.14l.386-1.158A.5.5 0 0 1 11 4h1a.5.5 0 0 1 0 1h-.64l-.311.935.807 1.29a3 3 0 1 1-.848.53l-.508-.812-2.076 3.322A.5.5 0 0 1 8 10.5H5.959a3 3 0 1 1-1.815-3.274L5 5.856V5h-.5a.5.5 0 0 1-.5-.5zm1.5 2.443-.508.814c.5.444.85 1.054.967 1.743h1.139L5.5 6.943zM8 9.057 9.598 6.5H6.402L8 9.057zM4.937 9.5a1.997 1.997 0 0 0-.487-.877l-.548.877h1.035zM3.603 8.092A2 2 0 1 0 4.937 10.5H3a.5.5 0 0 1-.424-.765l1.027-1.643zm7.947.53a2 2 0 1 0 .848-.53l1.026 1.643a.5.5 0 1 1-.848.53L11.55 8.623z"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-trophy" viewBox="0 0 16 16">
            <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935zM3.504 1c.007.517.026 1.006.056 1.469.13 2.028.457 3.546.87 4.667C5.294 9.48 6.484 10 7 10a.5.5 0 0 1 .5.5v2.61a1 1 0 0 1-.757.97l-1.426.356a.5.5 0 0 0-.179.085L4.5 15h7l-.638-.479a.501.501 0 0 0-.18-.085l-1.425-.356a1 1 0 0 1-.757-.97V10.5A.5.5 0 0 1 9 10c.516 0 1.706-.52 2.57-2.864.413-1.12.74-2.64.87-4.667.03-.463.049-.952.056-1.469H3.504z"/>
          </svg>
        );
    }
  };
  
  const getAvailabilityLabel = (quantity) => {
    if (quantity > 50) {
      return <span className="offer-availability-high">Nombreux billets disponibles</span>;
    } else if (quantity > 20) {
      return <span className="offer-availability-medium">Disponibilité limitée</span>;
    } else {
      return <span className="offer-availability-low">Derniers billets disponibles</span>;
    }
  };

  // Fonction pour obtenir les sports uniques pour le filtre
  const getUniqueSports = () => {
    const sportsSet = new Set(offers.map(offer => offer.sport));
    return Array.from(sportsSet);
  };

  // Appliquer tous les filtres
  const filteredOffers = offers
    .filter(offer => typeFilter === 'all' || offer.type === typeFilter)
    .filter(offer => sportFilter === 'all' || offer.sport === sportFilter)
    .filter(offer => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        offer.name.toLowerCase().includes(searchLower) ||
        offer.description.toLowerCase().includes(searchLower) ||
        offer.location.toLowerCase().includes(searchLower)
      );
    });

  // Trier les offres
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'popularity':
        return b.popularity - a.popularity;
      case 'availability':
        return b.quantity - a.quantity;
      case 'date':
      default:
        return new Date(a.event_date) - new Date(b.event_date);
    }
  });

  return (
    <Container>
      <h1 className="offers-title text-center mb-4">Offres de Billets Olympiques</h1>
      <p className="offers-subtitle text-center mb-4">Découvrez notre sélection de billets pour les Jeux Olympiques de Paris 2025</p>
      
      {/* Section de filtres avancés */}
      <div className="offers-filter mb-4">
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <Form.Group>
              <div className="offers-filter-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-ticket-perforated offers-filter-icon" viewBox="0 0 16 16">
                  <path d="M4 4.85v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Z"/>
                  <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3h-13ZM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9V4.5Z"/>
                </svg>
                <span className="ms-2">Type de billet</span>
              </div>
              <Form.Select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="mt-2"
              >
                <option value="all">Tous les types</option>
                <option value="solo">Solo (1 billet)</option>
                <option value="duo">Duo (2 billets)</option>
                <option value="familiale">Famille (4 billets)</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={4} className="mb-3 mb-md-0">
            <Form.Group>
              <div className="offers-filter-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trophy offers-filter-icon" viewBox="0 0 16 16">
                  <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935zM3.504 1c.007.517.026 1.006.056 1.469.13 2.028.457 3.546.87 4.667C5.294 9.48 6.484 10 7 10a.5.5 0 0 1 .5.5v2.61a1 1 0 0 1-.757.97l-1.426.356a.5.5 0 0 0-.179.085L4.5 15h7l-.638-.479a.501.501 0 0 0-.18-.085l-1.425-.356a1 1 0 0 1-.757-.97V10.5A.5.5 0 0 1 9 10c.516 0 1.706-.52 2.57-2.864.413-1.12.74-2.64.87-4.667.03-.463.049-.952.056-1.469H3.504z"/>
                </svg>
                <span className="ms-2">Sport</span>
              </div>
              <Form.Select 
                value={sportFilter} 
                onChange={(e) => setSportFilter(e.target.value)}
                className="mt-2"
              >
                <option value="all">Tous les sports</option>
                {getUniqueSports().map(sport => (
                  <option key={sport} value={sport}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group>
              <div className="offers-filter-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sort-down offers-filter-icon" viewBox="0 0 16 16">
                  <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
                </svg>
                <span className="ms-2">Trier par</span>
              </div>
              <Form.Select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-2"
              >
                <option value="date">Date (croissant)</option>
                <option value="price-asc">Prix (croissant)</option>
                <option value="price-desc">Prix (décroissant)</option>
                <option value="popularity">Popularité</option>
                <option value="availability">Disponibilité</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mt-3">
          <Col>
            <Form.Group>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par nom, description ou lieu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>
      </div>
      
      {/* Nombre de résultats */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <p className="mb-0">
          <strong>{sortedOffers.length}</strong> {sortedOffers.length > 1 ? 'résultats trouvés' : 'résultat trouvé'}
        </p>
        {(typeFilter !== 'all' || sportFilter !== 'all' || searchTerm) && (
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => {
              setTypeFilter('all');
              setSportFilter('all');
              setSearchTerm('');
            }}
          >
            Réinitialiser les filtres
          </Button>
        )}
      </div>

      {loading ? (
        <div className="offers-spinner-container">
          <Spinner animation="border" role="status" className="offers-spinner">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p>Chargement des offres...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
        </Alert>
      ) : (
        <Row>
          {sortedOffers.length === 0 ? (
            <Col className="text-center my-5">
              <div className="offers-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-ticket-perforated-fill mb-3" viewBox="0 0 16 16">
                  <path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5Zm4-1v1h1v-1H4Zm1 3v-1H4v1h1Zm7 0v-1h-1v1h1Zm-1-2h1v-1h-1v1Zm-6 3H4v1h1v-1Zm7 1v-1h-1v1h1Zm-7 1H4v1h1v-1Zm7 1v-1h-1v1h1Zm-8 1v1h1v-1H4Zm7 1h1v-1h-1v1Z"/>
                </svg>
                <h4>Aucune offre disponible</h4>
                <p>Aucun résultat ne correspond à vos critères de recherche.</p>
                <Button 
                  variant="outline-primary" 
                  onClick={() => {
                    setTypeFilter('all');
                    setSportFilter('all');
                    setSearchTerm('');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </Col>
          ) : (
            sortedOffers.map(offer => (
              <Col lg={4} md={6} className="mb-4" key={offer.id}>
                <Card className="offer-card">
                  <div className="position-relative">
                    <Card.Img 
                      variant="top" 
                      src={offer.image || `https://via.placeholder.com/800x500?text=${encodeURIComponent(offer.name)}`} 
                      alt={offer.name}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      {getTypeLabel(offer.type)}
                    </div>
                  </div>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">{offer.name}</Card.Title>
                      <div className="text-warning">
                        {Array.from({ length: Math.floor(offer.popularity) }).map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                          </svg>
                        ))}
                        {offer.popularity % 1 > 0 && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-star-half" viewBox="0 0 16 16">
                            <path d="M5.354 5.119 7.538.792A.516.516 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.537.537 0 0 1 16 6.32a.548.548 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.52.52 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.58.58 0 0 1 .085-.302.513.513 0 0 1 .37-.245l4.898-.696zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.565.565 0 0 1 .162-.505l2.907-2.77-4.052-.576a.525.525 0 0 1-.393-.288L8.001 2.223 8 2.226v9.8z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-2">
                        {getSportIcon(offer.sport)}
                      </div>
                      <small className="text-muted">{offer.sport.charAt(0).toUpperCase() + offer.sport.slice(1).replace('_', ' ')}</small>
                    </div>
                    
                    <Card.Text className="mb-3">{offer.description}</Card.Text>
                    
                    <div className="offer-date mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-event offer-date-icon" viewBox="0 0 16 16">
                        <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                      </svg>
                      <span>{formatDate(offer.event_date)}</span>
                    </div>
                    
                    <div className="offer-location mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt offer-date-icon" viewBox="0 0 16 16">
                        <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                        <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      </svg>
                      <span>{offer.location}</span>
                    </div>
                    
                    <div className="offer-availability mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-ticket-perforated offer-availability-icon" viewBox="0 0 16 16">
                        <path d="M4 4.85v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Z"/>
                        <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3h-13ZM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9V4.5Z"/>
                      </svg>
                      {getAvailabilityLabel(offer.quantity)}
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="offer-price">{offer.price.toFixed(2)} €</div>
                      <Button 
                        variant="primary" 
                        className="offer-btn"
                        onClick={() => handleAddToCart(offer)}
                        disabled={offer.quantity === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-plus me-2" viewBox="0 0 16 16">
                          <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9V5.5z"/>
                          <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 0h6a2 2 0 1 0 0 0h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 13.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                        Ajouter
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
    </Container>
  );
};

export default OffersList;
