import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useScrollToHash from '../hooks/useScrollToHash';
import './TermsOfService.css';

const TermsOfService = () => {
  // Utiliser notre hook personnalisé pour gérer le défilement vers les ancres
  useScrollToHash();
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <h1 id="main-title" className="text-center mb-4">Conditions Générales d'Utilisation</h1>
              <p className="text-muted text-center mb-5">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
              
              <div className="table-of-contents mb-5 p-4 bg-light rounded">
                <h5 className="mb-3">Table des matières</h5>
                <ol className="toc-list">
                  <li><a href="#intro" className="toc-link">Introduction</a></li>
                  <li><a href="#definitions" className="toc-link">Définitions</a></li>
                  <li><a href="#account" className="toc-link">Inscription et compte utilisateur</a></li>
                  <li><a href="#tickets" className="toc-link">Achat de billets</a></li>
                  <li><a href="#security" className="toc-link">E-tickets et système de sécurité</a></li>
                  <li><a href="#access" className="toc-link">Accès aux événements</a></li>
                  <li><a href="#cancellation" className="toc-link">Annulation et remboursement</a></li>
                  <li><a href="#ip" className="toc-link">Propriété intellectuelle</a></li>
                  <li><a href="#liability" className="toc-link">Limitation de responsabilité</a></li>
                  <li><a href="#privacy" className="toc-link">Protection des données personnelles</a></li>
                  <li><a href="#changes" className="toc-link">Modification des CGU</a></li>
                  <li><a href="#law" className="toc-link">Droit applicable et juridiction compétente</a></li>
                  <li><a href="#contact-us" className="toc-link">Contact</a></li>
                </ol>
              </div>
              
              <section className="mb-5" id="intro">
                <h2>1. Introduction</h2>
                <p>
                  Bienvenue sur la plateforme de billetterie électronique des Jeux Olympiques. 
                  Les présentes Conditions Générales d'Utilisation (CGU) régissent votre utilisation 
                  de notre site web et de nos services de billetterie électronique.
                </p>
                <p>
                  En accédant à notre site ou en utilisant nos services, vous acceptez d'être lié 
                  par ces CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
                </p>
              </section>
              
              <section className="mb-5" id="definitions">
                <h2>2. Définitions</h2>
                <p>Dans les présentes CGU, les termes suivants ont la signification indiquée ci-dessous :</p>
                <ul>
                  <li><strong>"Nous", "notre", "nos"</strong> désignent la plateforme de billetterie électronique des Jeux Olympiques</li>
                  <li><strong>"Vous", "votre", "vos"</strong> désignent l'utilisateur de notre site</li>
                  <li><strong>"Site"</strong> désigne notre site web et notre application mobile</li>
                  <li><strong>"Services"</strong> désignent tous les services que nous proposons, y compris la vente de billets électroniques</li>
                  <li><strong>"Billet"</strong> désigne un e-ticket acheté sur notre plateforme</li>
                  <li><strong>"Événement"</strong> désigne toute compétition ou cérémonie des Jeux Olympiques</li>
                </ul>
              </section>
              
              <section className="mb-5" id="account">
                <h2>3. Inscription et compte utilisateur</h2>
                <p>
                  Pour acheter des billets sur notre plateforme, vous devez créer un compte utilisateur. 
                  Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre inscription.
                </p>
                <p>
                  Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les 
                  activités qui se produisent sous votre compte. Nous vous recommandons d'activer 
                  l'authentification à deux facteurs pour renforcer la sécurité de votre compte.
                </p>
                <p>
                  Vous acceptez de nous informer immédiatement de toute utilisation non autorisée 
                  de votre compte ou de toute autre violation de la sécurité.
                </p>
              </section>
              
              <section className="mb-5" id="tickets">
                <h2>4. Achat de billets</h2>
                <p>
                  Les billets achetés sur notre plateforme sont soumis aux conditions suivantes :
                </p>
                <ul>
                  <li>Les billets sont personnels et nominatifs</li>
                  <li>Les billets ne peuvent pas être revendus ou transférés sans notre autorisation</li>
                  <li>Le prix des billets est indiqué en euros et inclut la TVA</li>
                  <li>Des frais de service peuvent s'appliquer et sont clairement indiqués avant la finalisation de l'achat</li>
                  <li>Le paiement est sécurisé et traité par nos prestataires de paiement</li>
                  <li>Une fois l'achat finalisé, vous recevrez une confirmation par e-mail</li>
                </ul>
              </section>
              
              <section className="mb-5" id="security">
                <h2>5. E-tickets et système de sécurité</h2>
                <p>
                  Nos e-tickets utilisent un système de sécurité à double clé pour garantir leur authenticité :
                </p>
                <ul>
                  <li>Une première clé est générée lors de la création de votre compte</li>
                  <li>Une deuxième clé est générée lors de l'achat d'un billet</li>
                  <li>Ces deux clés sont combinées pour générer un QR code sécurisé unique pour chaque billet</li>
                  <li>Le QR code change toutes les 30 secondes pour prévenir la copie et la fraude</li>
                  <li>Lors de la validation sur site, le système vérifie l'authenticité du billet en validant la signature basée sur ces deux clés</li>
                </ul>
                <p>
                  Il est strictement interdit de tenter de falsifier, copier ou modifier les e-tickets. 
                  Toute tentative de fraude sera signalée aux autorités compétentes.
                </p>
              </section>
              
              <section className="mb-5" id="access">
                <h2>6. Accès aux événements</h2>
                <p>
                  Pour accéder à un événement, vous devez présenter votre e-ticket sur votre appareil mobile. 
                  Le QR code sera scanné à l'entrée pour vérifier l'authenticité du billet.
                </p>
                <p>
                  Vous devez également présenter une pièce d'identité correspondant au nom indiqué sur le billet.
                </p>
                <p>
                  L'organisateur se réserve le droit de refuser l'accès à toute personne ne respectant 
                  pas les conditions d'accès ou présentant un billet non valide.
                </p>
              </section>
              
              <section className="mb-5" id="cancellation">
                <h2>7. Annulation et remboursement</h2>
                <p>
                  Les conditions d'annulation et de remboursement sont les suivantes :
                </p>
                <ul>
                  <li>En cas d'annulation de l'événement par l'organisateur, les billets seront remboursés intégralement</li>
                  <li>En cas de report de l'événement, les billets restent valables pour la nouvelle date</li>
                  <li>Les demandes de remboursement pour raisons personnelles sont soumises à des conditions spécifiques et doivent être effectuées au moins 30 jours avant l'événement</li>
                  <li>Des frais de traitement peuvent s'appliquer en cas de remboursement</li>
                </ul>
              </section>
              
              <section className="mb-5" id="ip">
                <h2>8. Propriété intellectuelle</h2>
                <p>
                  Tous les contenus présents sur notre site (textes, images, logos, etc.) sont protégés 
                  par des droits de propriété intellectuelle et appartiennent à nous ou à nos partenaires.
                </p>
                <p>
                  Toute reproduction, distribution, modification ou utilisation de ces contenus sans 
                  notre autorisation écrite préalable est strictement interdite.
                </p>
              </section>
              
              <section className="mb-5" id="liability">
                <h2>9. Limitation de responsabilité</h2>
                <p>
                  Dans les limites autorisées par la loi, nous ne pourrons être tenus responsables :
                </p>
                <ul>
                  <li>Des dommages indirects résultant de l'utilisation de notre site ou de nos services</li>
                  <li>Des problèmes techniques indépendants de notre volonté</li>
                  <li>Du contenu des sites tiers vers lesquels des liens peuvent pointer depuis notre site</li>
                  <li>De l'annulation ou du report d'un événement par l'organisateur</li>
                </ul>
              </section>
              
              <section className="mb-5" id="privacy">
                <h2>10. Protection des données personnelles</h2>
                <p>
                  Nous attachons une grande importance à la protection de vos données personnelles. 
                  Notre traitement de vos données est conforme au Règlement Général sur la Protection 
                  des Données (RGPD).
                </p>
                <p>
                  Pour plus d'informations sur la manière dont nous collectons, utilisons et protégeons 
                  vos données, veuillez consulter notre <Link to="/privacy-policy">Politique de Confidentialité</Link>.
                </p>
              </section>
              
              <section className="mb-5" id="changes">
                <h2>11. Modification des CGU</h2>
                <p>
                  Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications 
                  prendront effet dès leur publication sur notre site.
                </p>
                <p>
                  Il vous appartient de consulter régulièrement ces CGU pour prendre connaissance 
                  des éventuelles modifications.
                </p>
              </section>
              
              <section className="mb-5" id="law">
                <h2>12. Droit applicable et juridiction compétente</h2>
                <p>
                  Les présentes CGU sont régies par le droit français. Tout litige relatif à leur 
                  interprétation ou à leur exécution relève de la compétence des tribunaux français.
                </p>
              </section>
              
              <section className="mb-5" id="contact-us">
                <h2>13. Contact</h2>
                <p>
                  Pour toute question concernant ces CGU, veuillez nous contacter à l'adresse suivante :
                </p>
                <p>
                  <strong>E-mail</strong> : <a href="mailto:contact@jo-billetterie.fr">contact@jo-billetterie.fr</a><br />
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

export default TermsOfService;
