/**
 * Ce script initialise Firebase et Google Analytics de manière sécurisée.
 * Il récupère la configuration depuis le backend pour ne pas exposer les clés API côté client.
 */
async function initializeFirebaseAnalytics() {
  // Vérifie si Firebase est déjà initialisé pour éviter les erreurs
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    console.log("Firebase est déjà initialisé.");
    return;
  }

  try {
    // 1. Récupérer la configuration depuis le backend via l'API sécurisée
    const response = await fetch('/api/config/firebase');
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! statut: ${response.status}`);
    }
    const serverConfig = await response.json();

    if (serverConfig.success && serverConfig.config) {
      // 2. Initialiser Firebase avec la configuration reçue du serveur
      firebase.initializeApp(serverConfig.config);
      
      // 3. Initialiser Google Analytics
      firebase.analytics();
      
      console.log("Firebase & Analytics initialisés avec succès via le backend.");
    } else {
      throw new Error(serverConfig.error || "La configuration Firebase n'a pas pu être récupérée.");
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase:", error);
  }
}

// Lancer l'initialisation
initializeFirebaseAnalytics();