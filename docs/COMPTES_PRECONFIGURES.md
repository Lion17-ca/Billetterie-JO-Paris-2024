# Guide des Comptes Pré-configurés

Ce document explique comment utiliser les comptes pré-configurés intégrés dans l'application de billetterie des Jeux Olympiques de Paris 2024.

## Objectif des comptes pré-configurés

Ces comptes sont fournis pour faciliter les tests et la démonstration de l'application sans avoir à créer manuellement des comptes avec différents niveaux d'accès. Ils permettent d'accéder immédiatement aux différentes fonctionnalités du système.

## Comptes disponibles

### Compte Administrateur

**Informations de connexion :**
- **Email :** admin@example.com
- **Mot de passe :** Admin123!

**Fonctionnalités accessibles :**
- Tableau de bord d'administration complet
- Création et gestion des offres de billets
- Visualisation des statistiques de vente
- Gestion des événements
- Accès à toutes les fonctionnalités de l'application

**Comment l'utiliser :**
1. Accédez à la page de connexion : http://localhost:3000/login
2. Entrez l'email et le mot de passe de l'administrateur
3. Vous serez redirigé vers le tableau de bord d'administration

### Compte Employé

**Informations de connexion :**
- **Email :** employee@example.com
- **Mot de passe :** Employee123!

**Fonctionnalités accessibles :**
- Interface de validation des billets
- Scan des QR codes des billets
- Vérification de l'authenticité des billets
- Marquage des billets comme utilisés

**Comment l'utiliser :**
1. Accédez à la page de connexion : http://localhost:3000/login
2. Entrez l'email et le mot de passe de l'employé
3. Vous serez redirigé vers l'interface de validation des billets

## Remarques importantes

- **Sécurité :** Ces comptes sont destinés uniquement aux tests et à la démonstration. Pour un environnement de production réel, il est fortement recommandé de :
  - Supprimer ces comptes
  - Ou modifier leurs mots de passe
  - Créer de nouveaux comptes avec des identifiants sécurisés

- **Authentification MFA :** Dans une configuration normale, l'authentification multi-facteurs (MFA) est obligatoire. Pour ces comptes de test, la MFA est désactivée par défaut pour faciliter les démonstrations.

- **Persistance :** Ces comptes sont automatiquement créés au démarrage du service d'authentification s'ils n'existent pas déjà dans la base de données.

## Dépannage

Si vous rencontrez des problèmes de connexion avec ces comptes :

1. Vérifiez que tous les services sont correctement démarrés :
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

2. Vérifiez les logs du service d'authentification :
   ```bash
   docker logs bloc3-auth-1
   ```

3. Assurez-vous que la base de données PostgreSQL est accessible et fonctionne correctement.

4. Si nécessaire, redémarrez le service d'authentification :
   ```bash
   docker-compose -f docker-compose.prod.yml restart auth
   ```

## Support

Pour toute question ou problème concernant ces comptes, veuillez contacter l'équipe de développement.
