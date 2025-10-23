document.addEventListener('DOMContentLoaded', async () => {

    let isLoggedIn = false;

    // --- Element Selection ---
    const buttons = {
        uploadDoc: document.getElementById('btn-upload-doc'),
        justificatif: document.getElementById('btn-justificatif'),
        details: document.getElementById('btn-details'),
        reception: document.getElementById('btn-reception'),
        probleme: document.getElementById('btn-probleme'),
        satisfied: document.getElementById('btn-satisfied'),
        unsatisfied: document.getElementById('btn-unsatisfied')
    };

    const modals = {
        uploadDoc: document.getElementById('modal-upload-doc'),
        justificatif: document.getElementById('modal-justificatif'),
        details: document.getElementById('modal-details'),
        reception: document.getElementById('modal-reception'),
        probleme: document.getElementById('modal-probleme'),
        authRequired: document.getElementById('modal-auth-required'),
        satisfaction: document.getElementById('modal-satisfaction')
    };

    const forms = {
        uploadDoc: document.getElementById('form-upload-doc'),
        reception: document.getElementById('form-reception'),
        probleme: document.getElementById('form-probleme')
    };

    const justificatifList = document.getElementById('justificatif-list');

    const allCloseButtons = document.querySelectorAll('.close-modal');
    const allOverlays = document.querySelectorAll('.modal-overlay');

    // --- Fonctions ---
    const checkLoginStatus = async () => {
        try {
            const response = await fetch('/api/session-info');
            const sessionData = await response.json();
            isLoggedIn = sessionData.isLoggedIn;
        } catch (error) {
            console.error("Impossible de vérifier l'état de la session:", error);
            isLoggedIn = false;
        }
    };

    async function deleteDocument(docId) {
        try {
            const response = await fetch(`/api/data/delete-document/${docId}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                alert('Document supprimé avec succès !');
            }
            loadJustificatifs(); // Rafraîchit
            return result.success;
        } catch (error) {
            console.error('Erreur lors de la suppression du document:', error);
            alert(`Erreur: ${error.message}`);
            return false;
        }
    }

    // --- Functions ---
    const openModal = (modal) => {
        if (modal) modal.classList.add('visible'); // Ouvre la modale
    };

    const closeModal = (modal) => {
        if (modal) modal.classList.remove('visible'); // Ferme la modale
    };

    // --- Event Listeners ---

    const setupAuthenticatedClick = (button, modal, action) => {
        if (!button) return;
        button.addEventListener('click', async () => {
            if (isLoggedIn) {
                // Si une action est fournie (ex: charger des données), on l'exécute avant d'ouvrir la modale
                if (action) {
                    await action();
                }
                openModal(modal);
            } else {
                openModal(modals.authRequired);
            }
        });
    };

    // --- Get Delivery ID from URL ---
    const pathParts = window.location.pathname.split('/');
    const idLigneTransport = pathParts[pathParts.length - 1];

    // Close modals using the 'X' button
    allCloseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            closeModal(modal);
        });
    });

    // Close modals by clicking on the overlay background
    allOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            // Only close if the click is on the overlay itself, not the content
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    // Ferme les menus d'options des documents en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
        // Si le clic n'est pas sur un bouton d'options ou dans un menu, on ferme tout
        if (!e.target.closest('.doc-options')) {
            document.querySelectorAll('.options-menu.visible').forEach(menu => {
                menu.classList.remove('visible');
            });
        }
    });


    // --- Form Submission Logic ---
    
    // Reception Form
    if (forms.reception) {
        forms.reception.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevents page reload
            const checkbox = e.target.querySelector('#reception-confirm');
            
            if (!checkbox.checked) {
                alert("Veuillez cocher la case pour confirmer la réception.");
                return;
            }

            try {
                const response = await fetch('/api/data/confirm-reception', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idLigneTransport: idLigneTransport })
                });

                const result = await response.json();

                if (result.success) {
                    // Ne pas recharger, ouvrir la modale de satisfaction
                    closeModal(modals.reception);
                    openModal(modals.satisfaction);
                } else {
                    throw new Error(result.error || 'Une erreur est survenue.');
                }

            } catch (error) {
                console.error("Erreur lors de la confirmation de réception:", error);
                alert(`Erreur: ${error.message}`);
            }
        });
    }

    // Upload Document Form
    if (forms.uploadDoc) {
        forms.uploadDoc.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = e.target.querySelector('#doc-file-input');
            if (fileInput.files.length === 0) {
                alert("Veuillez sélectionner un fichier.");
                return;
            }

            const formData = new FormData();
            formData.append('files', fileInput.files[0]);
            formData.append('idLigneTransport', idLigneTransport);

            try {
                const response = await fetch('/api/data/upload-document', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    alert('Document envoyé avec succès !');
                    fileInput.value = ''; // Reset input
                    closeModal(modals.uploadDoc);
                } else {
                    throw new Error(result.error || 'Erreur lors de l\'envoi du document.');
                }
            } catch (error) {
                alert(`Erreur : ${error.message}`);
            }
        });
    }

    // Problem Report Form
    if (forms.probleme) {
        forms.probleme.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevents page reload
            const descriptionInput = e.target.querySelector('#probleme-description');
            const description = descriptionInput.value;
            
            if (!description.trim()) {
                alert("Veuillez décrire le problème.");
                return;
            }

            try {
                const response = await fetch('/api/data/report-problem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        idLigneTransport: idLigneTransport,
                        description: description 
                    })
                });

                const result = await response.json();

                if (result.success) {
                    alert("Signalement envoyé. Nous vous contacterons bientôt.");
                    descriptionInput.value = ''; // Vider le champ
                    closeModal(modals.probleme);
                } else {
                    throw new Error(result.error || 'Une erreur est survenue.');
                }

            } catch (error) {
                console.error("Erreur lors du signalement du problème:", error);
                alert(`Erreur: ${error.message}`);
            }
        });
    }

    // --- Action Logic ---

    // Charge et affiche les documents pour la livraison
    async function loadJustificatifs() {
        if (!justificatifList) return;
        justificatifList.innerHTML = '<span>Chargement des documents...</span>';
        try {
            const response = await fetch(`/api/data/documents/${idLigneTransport}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Impossible de charger les documents.');
            }

            if (result.data.length === 0) {
                justificatifList.innerHTML = '<span>Aucun document disponible pour cette livraison.</span>';
                return;
            }

            justificatifList.innerHTML = ''; // Vider le message de chargement
            result.data.forEach(doc => {
                const docItem = document.createElement('div');
                docItem.className = 'doc-item';
                
                // Ajoute une icône en fonction du type de fichier
                let iconClass = 'fa-solid fa-file'; // Icône par défaut
                if (doc.fileType?.startsWith('image/')) {
                    iconClass = 'fa-solid fa-file-image';
                } else if (doc.fileType === 'application/pdf') {
                    iconClass = 'fa-solid fa-file-pdf';
                }

                docItem.innerHTML = `
                    <a href="${doc.url}" target="_blank" rel="noopener noreferrer" class="doc-link">
                        <i class="${iconClass}"></i>
                        <span>${doc.fileName}</span>
                    </a>
                    <div class="doc-options">
                        <button class="options-btn" aria-label="Options pour ${doc.fileName}">
                            <i class="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <div class="options-menu">
                            <a href="${doc.url}" download="${doc.fileName}">Télécharger</a>
                            <span class="delete-btn" id="delete-btn-${doc.id}">Supprimer</span>
                        </div>
                    </div>
                `;
                justificatifList.appendChild(docItem);

                // Ajoute un écouteur pour le bouton d'options
                const optionsBtn = docItem.querySelector('.options-btn');
                optionsBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Empêche le clic de se propager et de fermer le menu immédiatement
                    const menu = docItem.querySelector('.options-menu');
                    // Ferme les autres menus ouverts avant d'ouvrir celui-ci
                    document.querySelectorAll('.options-menu.visible').forEach(openMenu => {
                        if (openMenu !== menu) openMenu.classList.remove('visible');
                    });
                    menu.classList.toggle('visible');
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche le clic de se propager
            const docId = btn.id.replace('delete-btn-', '');
            console.log("Suppression du document: ", docId);
            deleteDocument(docId);
        });
    });

        } catch (error) {
            console.error('Erreur chargement justificatifs:', error);
            justificatifList.innerHTML = `<span class="error-message">Erreur: ${error.message}</span>`;
        }
    }

    


    // --- Suppression d'un document uploade





    // --- Satisfaction Buttons Logic ---
    async function handleSatisfaction(satisfaction) {
        try {
            const response = await fetch('/api/data/record-satisfaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idLigneTransport, satisfaction })
            });
            console.log(`Satisfaction enregistrée: ${satisfaction}`);
            const result = await response.json();
            if (result.success) {
                alert("Merci pour votre retour ! La page va maintenant se rafraîchir.");
                closeModal(modals.satisfaction);
                window.location.reload(); // Rafraîchit pour afficher le statut final
            } else {
                throw new Error(result.error || 'Erreur lors de l\'enregistrement de votre avis.');
            }
        } catch (error) {
            alert(`Erreur : ${error.message}`);
        }
    }

    // --- Initialisation ---
    await checkLoginStatus();

    // Configuration des clics sur les boutons
    setupAuthenticatedClick(buttons.details, modals.details);
    setupAuthenticatedClick(buttons.uploadDoc, modals.uploadDoc);
    setupAuthenticatedClick(buttons.justificatif, modals.justificatif, loadJustificatifs); // Passe l'action pour charger les docs
    setupAuthenticatedClick(buttons.reception, modals.reception);
    setupAuthenticatedClick(buttons.probleme, modals.probleme);

    // Configuration des boutons de satisfaction
    if (buttons.satisfied) {
        buttons.satisfied.addEventListener('click', () => handleSatisfaction('Satisfait'));
    }
    if (buttons.unsatisfied) {
        buttons.unsatisfied.addEventListener('click', () => handleSatisfaction('Non satisfait'));
    }
});