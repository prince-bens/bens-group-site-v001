# BENS Groupe - Site Web Corporatif

Ce dépôt contient le code source du site web vitrine et de l'espace client pour BENS Groupe, une entreprise spécialisée dans le transport, la logistique et le négoce de matériaux de construction en Afrique de l'Ouest.

## 1. Aperçu du Projet

Le site a pour objectif de présenter les services de l'entreprise, de générer des prospects via des formulaires de devis, et d'offrir un espace client complet pour le suivi des opérations logistiques.

### Fonctionnalités Clés

- **Site Vitrine :** Présentation de l'entreprise, des services (Transport & Logistique, Négoce de matériaux) et des valeurs.
- **Espace Client (BENS NEXUS) :**
    - Authentification sécurisée pour les clients.
    - Tableau de bord listant les livraisons en cours et l'historique.
    - Page de suivi en temps réel des livraisons sur une carte (via Mapbox et WebSockets).
    - Gestion documentaire (upload, consultation, suppression de documents liés à une livraison).
    - Interaction client : confirmation de réception, signalement de problème, évaluation de la satisfaction.
- **Chatbot IA :** Un assistant virtuel (propulsé par l'API Gemini de Google) pour répondre aux questions des visiteurs.
- **Formulaires Interactifs :** Demandes de devis, formulaires de contact avec validation et protection reCAPTCHA.
- **Design Responsive :** Le site est conçu pour s'adapter aux ordinateurs de bureau, tablettes et appareils mobiles.

## 2. Stack Technique

- **Frontend :**
    - HTML5
    - CSS3 (avec une architecture modulaire par page)
    - JavaScript (ES6+ Modules)
    - **Librairies :**
        - [Leaflet.js](https://leafletjs.com/) & [Mapbox](https://www.mapbox.com/) pour la cartographie.
        - [Font Awesome](https://fontawesome.com/) pour les icônes.
        - [Google Fonts](https://fonts.google.com/) pour la typographie.

- **Backend (déduit du code frontend) :**
    - Probablement **Node.js** avec **Express.js** pour servir les fichiers statiques et gérer l'API.
    - **WebSockets** (via `Socket.io`) pour la communication en temps réel sur la page de suivi de livraison.
    - **API REST** pour :
        - L'authentification et la gestion des sessions.
        - La récupération des données des livraisons.
        - La gestion des formulaires (devis, contact).
        - L'upload de fichiers.
    - Intégration avec l'API **Google Gemini** pour le chatbot.

## 3. Structure du Projet

Le projet est principalement organisé autour du dossier `public/`, qui sert de racine pour le serveur web.

```
public/
├── css/               # Feuilles de style globales et par page
├── js/                # Scripts JavaScript (logique métier, UI, API)
├── assets/            # Ressources statiques (images, SVG, logos)
├── *.html             # Pages HTML du site
├── site.webmanifest   # Manifeste de l'application web
└── ...
```

### Pages Principales

- `index.html`: Page d'accueil.
- `a-propos.html`: Page de présentation de l'entreprise.
- `transport-logistique.html`: Détail des services de transport.
- `negoce-materiaux.html`: Détail des services de négoce.
- `PresentationNexus.html`: Page de présentation de la plateforme BENS NEXUS.
- `authentification.html`: Page de connexion et d'inscription pour l'espace client.
- `dashboard.html`: Tableau de bord client avec la liste des livraisons.
- `livraison.html`: Page de suivi en temps réel d'une livraison spécifique.
- `mention.html`: Mentions légales.
- `404.html`: Page d'erreur pour les ressources non trouvées.

## 4. Installation et Lancement

Ce projet nécessite un serveur backend pour fonctionner pleinement (API, WebSockets, authentification).

### Prérequis

- Un serveur web statique pour un aperçu de base.
- Un environnement **Node.js** pour faire fonctionner le backend (non inclus dans ce dépôt).

### Lancement (avec un serveur statique simple)

1.  Si vous avez Node.js, vous pouvez utiliser `http-server` pour un test rapide :
    ```bash
    # Installer http-server globalement (si ce n'est pas déjà fait)
    npm install -g http-server

    # Se placer dans le dossier du projet
    cd chemin/vers/bens-group-site-v001

    # Lancer le serveur depuis la racine du dossier public
    http-server public
    ```

2.  Ouvrez votre navigateur et allez à l'adresse indiquée (généralement `http://localhost:8080`).

**Note :** Sans le backend, les fonctionnalités dynamiques comme la connexion, le suivi de commande et le chatbot ne fonctionneront pas.

## 5. Déploiement

Avant le déploiement en production, il est recommandé de minifier et d'obfusquer les fichiers CSS et JavaScript pour optimiser les performances et protéger le code source.

Le fichier `test.html` présent dans le dépôt semble être un outil développé à cet effet. Il pourrait être utilisé pour préparer les fichiers avant de les téléverser sur le serveur de production.

---
*Ce README a été généré pour documenter l'état actuel du projet BENS Groupe.*