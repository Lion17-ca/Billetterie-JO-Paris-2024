# Améliorations de Sécurité - Billetterie JO

Ce document détaille les améliorations de sécurité implémentées dans le système de billetterie électronique pour les Jeux Olympiques.

## 1. Authentification Multi-Facteurs (MFA)

L'authentification multi-facteurs a été implémentée avec les caractéristiques suivantes :

- **Affichage du code MFA à l'écran** : Pour ce projet académique, le code MFA est affiché directement à l'écran pour faciliter la démonstration, sans nécessiter d'application d'authentification externe.
- **Génération de code côté serveur** : Le code MFA est généré par le serveur d'authentification avec une durée de validité limitée (30 secondes).
- **Interface utilisateur intuitive** : Instructions claires pour guider l'utilisateur dans le processus de configuration MFA.
- **Fallback pour la démonstration** : Un code fixe (123456) est également accepté pour faciliter les démonstrations.

## 2. En-têtes de Sécurité HTTP

Des en-têtes de sécurité HTTP ont été ajoutés à l'API Gateway pour protéger contre diverses vulnérabilités web :

- **X-Content-Type-Options: nosniff** : Empêche le navigateur de deviner le type MIME d'un fichier.
- **X-Frame-Options: DENY** : Empêche l'application d'être chargée dans un iframe, protégeant contre les attaques de clickjacking.
- **X-XSS-Protection: 1; mode=block** : Active la protection XSS intégrée au navigateur.
- **Strict-Transport-Security** : Force les connexions HTTPS.
- **Content-Security-Policy** : Limite les sources de contenu pour prévenir les attaques XSS et les injections.

## 3. Limitation de Taux de Requêtes (Rate Limiting)

Un système de limitation de taux de requêtes a été implémenté pour prévenir les attaques par force brute :

- **Limitation spécifique pour l'authentification** : 5 tentatives de connexion par minute par adresse IP.
- **Limitation générale pour l'API** : 60 requêtes par minute par adresse IP.
- **En-têtes informatifs** : Des en-têtes sont ajoutés aux réponses pour informer le client des limites et du nombre de requêtes restantes.
- **Délai d'attente adaptatif** : Le temps d'attente avant de pouvoir réessayer est calculé dynamiquement.

## 4. Journalisation de Sécurité

Un système de journalisation dédié aux événements de sécurité a été mis en place :

- **Journalisation des tentatives de connexion** : Succès et échecs des tentatives de connexion avec informations contextuelles.
- **Journalisation des vérifications MFA** : Suivi des tentatives de vérification MFA.
- **Capture de l'adresse IP** : L'adresse IP du client est enregistrée pour faciliter l'analyse forensique en cas d'incident.
- **Format standardisé** : Format de log cohérent pour faciliter l'analyse et l'intégration avec des outils de surveillance.

## 5. Améliorations de la Logique d'Authentification

- **Redirection prioritaire pour les administrateurs** : Les utilisateurs avec le rôle admin sont redirigés vers le tableau de bord administrateur en priorité.
- **Gestion améliorée des rôles utilisateur** : Séparation claire des rôles admin et employé pour éviter les problèmes de redirection.
- **Validation des codes MFA** : Vérification stricte des codes MFA avec une option de fallback pour la démonstration.

## Recommandations pour le Déploiement en Production

1. **Utiliser HTTPS** : Configurer SSL/TLS pour toutes les communications.
2. **Sécuriser les clés secrètes** : Utiliser un gestionnaire de secrets pour les clés JWT et autres informations sensibles.
3. **Activer une authentification MFA réelle** : Remplacer le système de démonstration par une intégration avec des applications d'authentification standard (Google Authenticator, Authy, etc.).
4. **Mettre en place un système de surveillance** : Configurer des alertes sur les événements de sécurité anormaux.
5. **Effectuer des tests de pénétration** : Valider la sécurité de l'application avant le déploiement final.

---

*Note : Ces améliorations ont été conçues pour s'intégrer facilement à l'architecture existante sans perturber les fonctionnalités actuelles.*
