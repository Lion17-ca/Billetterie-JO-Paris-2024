import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useScrollToHash from '../hooks/useScrollToHash';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  // Utiliser notre hook personnalisé pour gérer le défilement vers les ancres
  useScrollToHash();
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <h1 id="main-title" className="text-center mb-4">Politique de Confidentialité</h1>
              <p className="text-muted text-center mb-5">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
              
              <div className="table-of-contents mb-5 p-4 bg-light rounded">
                <h5 className="mb-3">Table des matières</h5>
                <ol className="toc-list">
                  <li><a href="#introduction" className="toc-link">Introduction</a></li>
                  <li><a href="#collected-info" className="toc-link">Informations que nous collectons</a></li>
                  <li><a href="#data-usage" className="toc-link">Utilisation de vos informations</a></li>
                  <li><a href="#legal-basis" className="toc-link">Base légale du traitement</a></li>
                  <li><a href="#data-retention" className="toc-link">Conservation des données</a></li>
                  <li><a href="#your-rights" className="toc-link">Vos droits</a></li>
                  <li><a href="#data-security" className="toc-link">Sécurité des données</a></li>
                  <li><a href="#data-sharing" className="toc-link">Partage de vos informations</a></li>
                  <li><a href="#cookies" className="toc-link">Cookies</a></li>
                  <li><a href="#policy-changes" className="toc-link">Modifications de notre politique</a></li>
                  <li><a href="#contact" className="toc-link">Contact</a></li>
                </ol>
              </div>
              
              <section className="mb-5" id="introduction">
                <h2>1. Introduction</h2>
                <p>
                  Bienvenue sur la plateforme de billetterie électronique des Jeux Olympiques. 
                  Nous nous engageons à protéger et à respecter votre vie privée. Cette politique 
                  de confidentialité définit la base sur laquelle les données personnelles que nous 
                  collectons auprès de vous, ou que vous nous fournissez, seront traitées par nous.
                </p>
                <p>
                  Veuillez lire attentivement ce qui suit pour comprendre nos pratiques concernant 
                  vos données personnelles et comment nous les traiterons.
                </p>
              </section>
              
              <section className="mb-5" id="collected-info">
                <h2>2. Informations que nous collectons</h2>
                <p>Nous pouvons collecter et traiter les données suivantes vous concernant :</p>
                <ul>
                  <li>Informations que vous nous fournissez en remplissant des formulaires sur notre site</li>
                  <li>Informations d'identification (nom, prénom, adresse e-mail)</li>
                  <li>Informations de contact (adresse postale, numéro de téléphone)</li>
                  <li>Informations de paiement (ces données sont traitées par nos prestataires de paiement sécurisés)</li>
                  <li>Informations sur vos billets achetés</li>
                  <li>Informations techniques (adresse IP, type de navigateur, données de connexion)</li>
                </ul>
              </section>
              
              <section className="mb-5" id="data-usage">
                <h2>3. Utilisation de vos informations</h2>
                <p>Nous utilisons les informations que nous détenons à votre sujet aux fins suivantes :</p>
                <ul>
                  <li>Pour vous fournir nos services de billetterie</li>
                  <li>Pour vérifier votre identité lors de l'accès aux événements</li>
                  <li>Pour vous envoyer des informations importantes concernant vos billets</li>
                  <li>Pour traiter vos paiements</li>
                  <li>Pour prévenir la fraude et assurer la sécurité de nos services</li>
                  <li>Pour répondre à vos demandes et questions</li>
                  <li>Pour améliorer nos services</li>
                </ul>
              </section>
              
              <section className="mb-5" id="legal-basis">
                <h2>4. Base légale du traitement</h2>
                <p>Nous traitons vos données personnelles sur les bases légales suivantes :</p>
                <ul>
                  <li><strong>Exécution d'un contrat</strong> : lorsque le traitement est nécessaire à l'exécution d'un contrat auquel vous êtes partie</li>
                  <li><strong>Consentement</strong> : lorsque vous avez donné votre consentement au traitement de vos données personnelles</li>
                  <li><strong>Intérêts légitimes</strong> : lorsque le traitement est nécessaire aux fins des intérêts légitimes poursuivis par nous</li>
                  <li><strong>Obligation légale</strong> : lorsque le traitement est nécessaire au respect d'une obligation légale à laquelle nous sommes soumis</li>
                </ul>
              </section>
              
              <section className="mb-5" id="data-retention">
                <h2>5. Conservation des données</h2>
                <p>
                  Nous conservons vos données personnelles aussi longtemps que nécessaire pour 
                  atteindre les finalités pour lesquelles nous les avons collectées, notamment 
                  pour satisfaire aux exigences légales, comptables ou de déclaration.
                </p>
                <p>
                  Pour déterminer la période de conservation appropriée pour les données personnelles, 
                  nous prenons en compte la quantité, la nature et la sensibilité des données 
                  personnelles, le risque potentiel de préjudice résultant d'une utilisation ou 
                  d'une divulgation non autorisée de vos données personnelles, les finalités pour 
                  lesquelles nous traitons vos données personnelles et si nous pouvons atteindre 
                  ces finalités par d'autres moyens, ainsi que les exigences légales applicables.
                </p>
              </section>
              
              <section className="mb-5" id="your-rights">
                <h2>6. Vos droits</h2>
                <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
                <ul>
                  <li><strong>Droit d'accès</strong> : Vous avez le droit d'obtenir une copie des données personnelles que nous détenons à votre sujet</li>
                  <li><strong>Droit de rectification</strong> : Vous pouvez demander la correction des données inexactes vous concernant</li>
                  <li><strong>Droit à l'effacement</strong> : Vous pouvez demander la suppression de vos données personnelles dans certaines circonstances</li>
                  <li><strong>Droit à la limitation du traitement</strong> : Vous pouvez demander la limitation du traitement de vos données</li>
                  <li><strong>Droit à la portabilité des données</strong> : Vous pouvez demander le transfert de vos données à un tiers</li>
                  <li><strong>Droit d'opposition</strong> : Vous pouvez vous opposer au traitement de vos données personnelles</li>
                  <li><strong>Droit de retirer votre consentement</strong> : Lorsque nous traitons vos données sur la base de votre consentement</li>
                </ul>
                <p>
                  Pour exercer l'un de ces droits, veuillez nous contacter à l'adresse e-mail suivante : 
                  <a href="mailto:privacy@jo-billetterie.fr"> privacy@jo-billetterie.fr</a>
                </p>
              </section>
              
              <section className="mb-5" id="data-security">
                <h2>7. Sécurité des données</h2>
                <p>
                  Nous avons mis en place des mesures de sécurité appropriées pour empêcher que vos 
                  données personnelles ne soient accidentellement perdues, utilisées ou consultées 
                  de manière non autorisée, modifiées ou divulguées. Ces mesures comprennent :
                </p>
                <ul>
                  <li>Le chiffrement des données sensibles</li>
                  <li>L'authentification à deux facteurs pour l'accès aux comptes</li>
                  <li>Des systèmes de sécurité à double clé pour les billets électroniques</li>
                  <li>Des audits réguliers de nos systèmes et procédures de sécurité</li>
                  <li>La limitation de l'accès à vos données personnelles aux employés qui en ont besoin</li>
                </ul>
              </section>
              
              <section className="mb-5" id="data-sharing">
                <h2>8. Partage de vos informations</h2>
                <p>
                  Nous pouvons partager vos informations personnelles avec les tiers suivants :
                </p>
                <ul>
                  <li>Les prestataires de services qui nous fournissent des services d'administration, informatiques, de paiement</li>
                  <li>Les organisateurs des événements pour lesquels vous achetez des billets</li>
                  <li>Les autorités publiques lorsque la loi l'exige</li>
                </ul>
                <p>
                  Nous exigeons de tous les tiers qu'ils respectent la sécurité de vos données 
                  personnelles et qu'ils les traitent conformément à la loi.
                </p>
              </section>
              
              <section className="mb-5" id="cookies">
                <h2>9. Cookies</h2>
                <p>
                  Notre site utilise des cookies pour vous distinguer des autres utilisateurs. 
                  Cela nous aide à vous fournir une bonne expérience lorsque vous naviguez sur 
                  notre site et nous permet également d'améliorer notre site.
                </p>
                <p>
                  Pour des informations détaillées sur les cookies que nous utilisons et les 
                  finalités pour lesquelles nous les utilisons, veuillez consulter notre 
                  <Link to="/cookie-policy"> politique en matière de cookies</Link>.
                </p>
              </section>
              
              <section className="mb-5" id="policy-changes">
                <h2>10. Modifications de notre politique de confidentialité</h2>
                <p>
                  Nous pouvons modifier cette politique de confidentialité de temps à autre. 
                  Toute modification que nous pourrons apporter à notre politique de confidentialité 
                  à l'avenir sera publiée sur cette page et, le cas échéant, notifiée par e-mail.
                </p>
              </section>
              
              <section className="mb-5" id="contact">
                <h2>11. Contact</h2>
                <p>
                  Pour toute question concernant cette politique de confidentialité ou nos pratiques 
                  en matière de protection des données, veuillez nous contacter à l'adresse suivante :
                </p>
                <p>
                  <strong>E-mail</strong> : <a href="mailto:privacy@jo-billetterie.fr">privacy@jo-billetterie.fr</a><br />
                  <strong>Adresse postale</strong> : 123 Avenue des Champions, 75001 Paris, France<br />
                  <strong>Téléphone</strong> : +33 1 23 45 67 89
                </p>
              </section>
              
              <div className="text-center mt-5">
                <Link to="/">
                  <Button variant="outline-primary" className="rounded-pill px-4">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PrivacyPolicy;
