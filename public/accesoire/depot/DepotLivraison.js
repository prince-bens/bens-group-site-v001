// Variables globales
let map;
let truckMarker;
let userMarker;
let idLigneTransport;
let directionsService;
let directionsRenderer;

// Fonction pour charger le script Google Maps de manière asynchrone
function loadGoogleMapsScript(apiKey) {
    return new Promise((resolve, reject) => {
        // Si le script est déjà là, on résout directement
        if (window.google && window.google.maps) {
            return resolve();
        }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=geometry`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error("Le script Google Maps n'a pas pu être chargé."));
        
        // Le callback `initMap` sera appelé par le script Google.
        // On attache la fonction de résolution à une fonction globale que `initMap` appellera.
        window.onMapApiLoad = resolve;
        document.head.appendChild(script);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    LoadingAnimation.start();
    
    // 1. Récupérer la clé Google Maps et charger le script
    try {
        const keyResponse = await fetch('/api/config/google-maps-key');
        const keyData = await keyResponse.json();
        if (!keyData.success) throw new Error(keyData.error);
        await loadGoogleMapsScript(keyData.key);
    } catch (error) {
        LoadingAnimation.stop();
        return showError(error.message);
    }

    // Récupération de l'ID depuis l'URL
    const pathParts = window.location.pathname.split('/');
    idLigneTransport = pathParts[pathParts.length - 1];
    
    if (!idLigneTransport) {
        LoadingAnimation.stop();
        return showError("ID de livraison manquant dans l'URL.");
    }

    try {
        // 2. Charger les informations de base de la livraison
        const deliveryData = await getDeliveryInfo();

        // 3. Mettre à jour l'interface (panneau) avec les informations
        updateUI(deliveryData);

        // Charger les détails dans la modale
        populateDetailsModal(deliveryData);

        // 4. Vérifier si la livraison est "En cours"
        if (deliveryData.Statut_Trajet?.toLowerCase() !== 'en cours') {
            displayStatusMessage(`Le suivi en direct n'est pas disponible. Statut de la livraison : <strong>${deliveryData.Statut_Trajet || 'Inconnu'}</strong>`);
            LoadingAnimation.stop();
            return;
        }

        // 5. Si oui, initialiser la carte et charger le reste des données
        // initMap est maintenant appelé par le callback du script Google
        await loadTrackingData();
        setupRealTimeUpdates();
        
    } catch (error) {
        console.error("Erreur d'initialisation:", error);
        showError(error.message || "Erreur de chargement des données de livraison.");
        LoadingAnimation.stop();
    }
});

function displayStatusMessage(message) {
    const mapDiv = document.getElementById('map');
    if (mapDiv) {
        mapDiv.innerHTML = `<div class="status-message-overlay">${message}</div>`;
    }
}

window.initMap = function() {
    const defaultCenter = { lat: 14.7167, lng: -17.46768 }; // Position par défaut (Dakar)
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // On gère nos propres marqueurs
        polylineOptions: {
            strokeColor: '#ff6600',
            strokeWeight: 5,
            strokeOpacity: 0.9
        }
    });
    
    // Indique que l'API est prête
    if (window.onMapApiLoad) {
        window.onMapApiLoad();
    }
}

async function loadTrackingData() {
    try {
        const [allPoints, userPosition] = await Promise.all([
            getRoutePoints(),
            getUserPosition()
        ]);
        
        await updateMapWithFullPath(allPoints, userPosition);
    } finally {
        LoadingAnimation.stop();
    }
}

async function getDeliveryInfo() {
    const response = await fetch(`/api/data/delivery-info/${idLigneTransport}`);
    if (!response.ok) {
        if (response.status === 404) throw new Error("Livraison introuvable.");
        throw new Error("Erreur serveur lors de la récupération des informations.");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    console.log("Données de livraison récupérées:", result.data);
    return result.data;
}

async function getRoutePoints() {
    const response = await fetch(`/api/data/delivery-route/${idLigneTransport}`);
    if (!response.ok) {
        throw new Error("Impossible de récupérer l'itinéraire.");
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    console.log("Points de l'itinéraire récupérés:", result.data);
    return result.data;
}

function getUserPosition() {
    return new Promise(resolve => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null) // Gère le cas où l'utilisateur refuse la géolocalisation
        );
    });
}

function updateUI(deliveryData) {
    const deliveryName = `Identifiant: ${deliveryData.ID_Ligne_Transport || idLigneTransport}`;
    document.querySelectorAll('.nom').forEach(el => el.textContent = deliveryName);
    document.querySelectorAll('.Ref_Ligne_Transport').forEach(el => el.textContent = `${deliveryData.Ref_Ligne_Transport || 'N/A'}`);
    
    if (deliveryData.Lieu_Chargement && deliveryData.Lieu_Dechargement) {
        document.querySelectorAll('.moreInfoLivraison').forEach(el => {
            el.innerHTML = `<span title="Lieu de chargement">${deliveryData.Lieu_Chargement}</span> <img src="/assets/svg/arrowgray.svg" alt="vers" class="arrowgray"> <span title="Lieu de déchargement">${deliveryData.Lieu_Dechargement}</span>`;
        });
    }

    const status = deliveryData.Statut_Trajet || 'Inconnu';
    document.querySelectorAll('.statut').forEach(el => {
        el.textContent = status;
        el.className = `statut ${status.toLowerCase().replace(/ /g, '-')}`;
    });
}

function populateDetailsModal(deliveryData) {
    const detailsList = document.getElementById('details-list');
    if (!detailsList) return;
    detailsList.innerHTML = '';

    const fields = [
        { label: 'Satisfaction Client', value: deliveryData.Satisfaction_Client },
        { label: 'Ref Ligne Transport', value: deliveryData.Ref_Ligne_Transport },
        { label: 'Ref Conteneur', value: deliveryData.Ref_Conteneur },
        { label: 'Ref Booking', value: deliveryData.Ref_Booking },
        { label: 'Nature Transport', value: deliveryData.Nature_Transport },
        // { label: 'Lieu Chargement', value: deliveryData.Lieu_Chargement },
        { label: 'Date Chargement', value: deliveryData.Date_Chargement },
        // { label: 'Lieu Déchargement', value: deliveryData.Lieu_Dechargement },
        { label: 'Date Déchargement', value: deliveryData.Date_Dechargement },
        { label: 'Date Dépotage', value: deliveryData.Date_Depotage },
        { label: 'Confirmation Client', value: deliveryData.ConfirmattionClient ? 'Oui' : 'Non' },
        { label: 'Téléphone Chauffeur', value: deliveryData.Driver_Phone }
    ];

    let content = '';
    fields.forEach(field => {
        if (field.value) {
            content += `<p><strong>${field.label}:</strong> ${field.value}</p>`;
        }
    });

    detailsList.innerHTML = content || '<span>Aucun détail disponible.</span>';
}

function createMarker(options) {
    const { position, mapInstance, title, icon, label } = options;

    const marker = new google.maps.Marker({
        position: position,
        map: mapInstance,
        title: title,
        icon: icon, // Peut être une URL, un objet Icon, ou null pour le défaut
        label: label // Peut être une chaîne ou un objet MarkerLabel
    });

    // Si un titre est fourni, on crée une infobulle
    if (!title) return marker;

    const infowindow = new google.maps.InfoWindow({
        content: `<h4>${title}</h4>`
    });

    marker.addListener('click', () => {
        infowindow.open(mapInstance, marker);
    });

    return marker;
}

async function updateMapWithFullPath(allPoints, userPos) {
    const bounds = new google.maps.LatLngBounds();

    // Handle case with no points
    if (!allPoints || allPoints.length === 0) {
        console.warn("Aucun point de route à afficher.");
        // We can still show the user's position if available
        if (userPos) {
            userMarker = createMarker({
                position: userPos,
                mapInstance: map,
                title: 'Votre position'
            });
            map.setCenter(userPos);
        }
        return;
    }

    // Get all points from the array
    const startPoint = allPoints[0];
    const endPoint = allPoints[allPoints.length - 1];

    // Add start marker
    if (startPoint && startPoint.position && startPoint.position._longitude && startPoint.position._latitude) {
        const startCoords = { lat: startPoint.position._latitude, lng: startPoint.position._longitude };
        createMarker({
            position: startCoords,
            mapInstance: map,
            title: 'Point de départ',
            label: 'D' // 'D' pour Départ
        });
        bounds.extend(startCoords);
    }

    // Add end/truck marker (at the last known position)
    if (endPoint && endPoint.position && endPoint.position._longitude && endPoint.position._latitude) {
        const endCoords = { lat: endPoint.position._latitude, lng: endPoint.position._longitude };
        truckMarker = createMarker({
            position: endCoords,
            mapInstance: map,
            title: 'Votre livreur',
            // Utilise une icône SVG en ligne pour le camion, évitant un fichier externe
            icon: {
                path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8h3v-2h12v2h3v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-1.5.67-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
                fillColor: '#ff6600',
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 1.2,
                anchor: new google.maps.Point(12, 12)
            }
        });
        bounds.extend(endCoords);
    }

    // Add user marker
    if (userPos) {
        userMarker = createMarker({ position: userPos, mapInstance: map, title: 'Votre position' });
        bounds.extend(userPos);
    }

    // Draw the full path using all points
    await drawFullPath(allPoints);

    // Google's DirectionsRenderer handles bounds automatically, but we can fit it manually if needed.
    // The bounds already include markers. Let's fit the map.
    if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
    }
}

async function drawFullPath(allPoints) {
    if (!allPoints || allPoints.length < 2) return;

    const validPoints = allPoints
        .filter(p => p?.position?._longitude && p?.position?._latitude)
        .map(p => ({ lat: p.position._latitude, lng: p.position._longitude }));

    if (validPoints.length < 2) return;

    const origin = validPoints[0];
    const destination = validPoints[validPoints.length - 1];

    // Prepare waypoints, with sampling when too many
    let waypointsList = validPoints.slice(1, -1);
    const MAX_WAYPOINTS = 23;
    if (waypointsList.length > MAX_WAYPOINTS) {
        const step = Math.ceil(waypointsList.length / MAX_WAYPOINTS);
        const sampled = [];
        for (let i = 0; i < waypointsList.length; i += step) sampled.push(waypointsList[i]);
        waypointsList = sampled.slice(0, MAX_WAYPOINTS);
        console.log(`Waypoints échantillonnés → ${waypointsList.length} points (step=${step})`);
    }

    const waypointsForRequest = waypointsList.map(p => ({ location: p, stopover: false }));

    const request = {
        origin,
        destination,
        waypoints: waypointsForRequest,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false
    };

    return new Promise(resolve => {
        directionsService.route(request, (result, status) => {
            console.log('Directions status:', status);
            if (status === google.maps.DirectionsStatus.OK || status === 'OK') {
                directionsRenderer.setDirections(result);
                resolve();
            } else {
                console.error("Directions API error:", status);
                // fallback: tracer polyline brute
                const poly = new google.maps.Polyline({
                    path: validPoints,
                    geodesic: true,
                    strokeColor: '#ff6600',
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                    map
                });
                resolve();
            }
        });
    });
}


function setupRealTimeUpdates() {
    console.log("Configuration des mises à jour en temps réel pour la livraison :", idLigneTransport);

    // Se connecte au serveur WebSocket
    const socket = io();

    // Une fois connecté, on rejoint la "room" de cette livraison
    socket.on('connect', () => {
        console.log('Connecté au serveur WebSocket avec l\'ID:', socket.id);
        socket.emit('join_delivery_room', idLigneTransport);
    });

    // Écoute des événements de mise à jour de position
    socket.on('position_update', (newPosition) => {
        console.log('Nouvelle position reçue:', newPosition);
        if (truckMarker && newPosition.lat && newPosition.lng) {
            const newLatLng = new google.maps.LatLng(newPosition.lat, newPosition.lng);
            truckMarker.setPosition(newLatLng);
        }
    });

    // Écoute des événements de mise à jour des données de la livraison
    socket.on('delivery_update', (updatedData) => {
        console.log('Mise à jour des données de livraison reçue:', updatedData);

        // Mettre à jour le statut si présent dans les données
        if (updatedData.Statut_Trajet) {
            const status = updatedData.Statut_Trajet;
            document.querySelectorAll('.statut').forEach(el => {
                el.textContent = status;
                el.className = `statut ${status.toLowerCase().replace(/ /g, '-')}`;
            });
        }

        // je vais ajouter ici d'autres logiques pour mettre à jour
        // l'interface avec d'autres champs (ex: Satisfaction_Client, etc.)
        // Pour une mise à jour complète, on pourrait re-fetcher toutes les données
        // ou fusionner `updatedData` avec les données existantes et ré-afficher.
        // Par exemple, pour mettre à jour la modale des détails :
        getDeliveryInfo().then(populateDetailsModal);
    });
}

function showError(message) {
    console.error(message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message + " Vous serez redirigé dans 10 secondes.";
    document.body.appendChild(errorDiv);
    setTimeout(() => { window.location.href = '/'; }, 30000);
}
