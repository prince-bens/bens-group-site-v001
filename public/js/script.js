// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- NAVIGATION LOGO ---
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('dblclick', () => {
            window.location.href = 'index.html';
        });
    }
    // --- MODAL DE SUIVI (TRACKING) ---
 

    const modal = document.getElementById('tracking-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = modal ? modal.querySelector('.close-btn') : null;

    if (modal && openModalBtn && closeModalBtn) {
        const openModal = () => { modal.style.display = 'flex'; };
        const closeModal = () => { modal.style.display = 'none'; };

        openModalBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    }

    // --- MODAL DE DEVIS (GÉNÉRIQUE) ---
    const openDevisModalButtons = document.querySelectorAll('.open-devis-modal');
    const devisModal = document.getElementById('devis-modal');

    if (devisModal) {
        openDevisModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const product = button.dataset.product;
                loadDevisForm(product);
                devisModal.style.display = 'flex';
            });
        });

        devisModal.addEventListener('click', (e) => {
            if (e.target === devisModal) {
                devisModal.style.display = 'none';
            }
        });

        function loadDevisForm(product) {
            const modalContent = devisModal.querySelector('.modal-content');
            if (!modalContent) return;

            // Vider le contenu pour éviter les doublons d'écouteurs d'événements
            modalContent.innerHTML = '';

            const form = document.createElement('form');
            form.id = 'devis-form';
            form.innerHTML = `
                <h2>Demande de devis - ${product}</h2>
                <p>Veuillez remplir le formulaire ci-dessous.</p>
                <div class="form-group"><label for="name">Nom:</label><input type="text" id="name" name="name" required></div>
                <div class="form-group"><label for="email">Email:</label><input type="email" id="email" name="email" required></div>
                <div class="form-group"><label for="quantity">Quantité désirée:</label><input type="number" id="quantity" name="quantity" required></div>
                <div class="form-group"><label for="product">Produit:</label><input type="text" id="product" name="product" value="${product}" readonly></div>
                <button type="submit" class="cta-button">Envoyer la demande</button>
            `;

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = form.querySelector('#name').value;
                const email = form.querySelector('#email').value;
                const quantity = form.querySelector('#quantity').value;

                alert(`Demande de devis envoyée pour ${quantity} unités de ${product} par ${name} (${email})`);
                devisModal.style.display = 'none';
            });

            const closeModalButton = document.createElement('span');
            closeModalButton.className = 'close-btn';
            closeModalButton.innerHTML = '&times;';
            closeModalButton.addEventListener('click', () => {
                devisModal.style.display = 'none';
            });

            modalContent.appendChild(closeModalButton);
            modalContent.appendChild(form);
        }
    }

    // --- CARTE LEAFLET ---
    const mapContainer = document.getElementById('company-map');
    // Vérifier également que la librairie Leaflet (L) est chargée
    if (mapContainer && typeof L !== 'undefined') {
        const lat = 14.735556;
        const lng = -17.496194;
        const map = L.map('company-map').setView([lat, lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        L.marker([lat, lng]).addTo(map)
            .bindPopup('<b>BENS GROUPE</b><br>Notre siège.')
            .openPopup();
    }

    // --- MODAL DE DEVIS (NÉGOCE) ---
    const openNegoceDevisBtns = document.querySelectorAll('.open-negoce-devis-btn');
    const devisNegoceModal = document.getElementById('devis-negoce-modal');
    const confirmationModal = document.getElementById('devis-confirmation-modal');

    if (devisNegoceModal && confirmationModal) {
        const closeDevisNegoceBtn = devisNegoceModal.querySelector('.close-btn-negoce');
        const qualityOptionsContainer = document.getElementById('devis-quality-options');
        const productInput = document.getElementById('devis-product');
        
        const qualityOptions = {
            'Ciment': `
            <h4>Classe de résistance</h4>
            <div class="quality-group">
                <label><input type="radio" name="quality" value="CEM II/B-L 32.5R" checked> CEM II/B-L 32.5R</label>
                <label><input type="radio" name="quality" value="CEM I 42.5R"> CEM I 42.5R</label>
                <label><input type="radio" name="quality" value="CEM I 52.5R"> CEM I 52.5R</label>
            </div>`,
            'Fer a béton': `
            <h4>Type de fer</h4>
            <div class="quality-group">
                <label><input type="radio" name="quality" value="FE400 (Local)" checked> FE400 (Local)</label>
                <label><input type="radio" name="quality" value="FE500 (Importé)"> FE500 (Importé)</label>
            </div>`,
        'Gravier': `
            <h4>Type et Calibre</h4>
            <div class="quality-group">
                <label><input type="radio" name="quality" value="Basalte 3/8" checked> Basalte 3/8</label>
                <label><input type="radio" name="quality" value="Basalte 8/16"> Basalte 8/16</label>
                <label><input type="radio" name="quality" value="Calcaire 3/8"> Calcaire 3/8</label>
                <label><input type="radio" name="quality" value="Calcaire 8/16"> Calcaire 8/16</label>
            </div>`,
        
        'Autres': `
            <h4>Précisez les caractéristiques</h4>
            <div class="form-group quality-group"> 
            
                <textarea name="quality" rows="4" placeholder="Décrivez les ce que vous souhaitez... "></textarea>
            </div>`
        };

        openNegoceDevisBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const product = btn.dataset.product;
                if (productInput) productInput.value = product;
                if (qualityOptionsContainer) qualityOptionsContainer.innerHTML = qualityOptions[product] || '';
                devisNegoceModal.style.display = 'flex';
            });
        });

        
        const closeNegoceModal = () => { devisNegoceModal.style.display = 'none'; };

    


        if (closeDevisNegoceBtn) closeDevisNegoceBtn.addEventListener('click', closeNegoceModal);

        const closeConfirmModal = () => { confirmationModal.style.display = 'none'; };
        window.addEventListener('click', (event) => {
            if (event.target === devisNegoceModal) closeNegoceModal();
            if (event.target === confirmationModal) closeConfirmModal();
        });
    }

    // --- MODAL DE DEVIS (GLOBAL) ---
    function createGlobalDevisModal() {
        const modalHTML = `
        <div id="devis-global-modal" class="modal">
            <div class="modal-content">
                <span class="close-btn-devis-global">&times;</span>
                <h2>Demande de devis global</h2>
                <form id="devis-global-form" class="devis-global-form">
                    <div class="form-group">
                        <label for="devis-name">Nom Complet</label>
                        <input type="text" id="devis-name" name="name" placeholder="Votre nom complet" required>
                    </div>
                    <div class="form-group">
                        <label for="devis-email">Adresse Email</label>
                        <input type="email" id="devis-email" name="email" placeholder="Votre adresse email" required>
                    </div>
                    <div class="form-group">
                        <label for="devis-phone">Numéro de Téléphone</label>
                        <input type="text" id="devis-phone" name="phone" placeholder="Ex: +221 77 123 45 67" required>
                    </div>
                    <div class="form-group">
                        <label for="devis-service">Service Intéressé</label>
                        <select id="devis-service" name="service" required>
                            <option value="" disabled selected>Choisissez un service</option>
                            <option value="Transport">Transport</option>
                            <option value="Négoce de matériaux BTP">Négoce de matériaux BTP</option>
                        </select>
                    </div>
                    <div class="form-group">
                    <label for="devis-details">Détails de la Demande</label>
                    <textarea id="Devis-message" name="message" rows="4" placeholder="Décrivez vos besoins ou posez vos questions..." required></textarea>
                    </div>
                    <div class="form-group"> 
                        <div id="recaptcha-widget" class="g-recaptcha" 
                            data-sitekey="6Lctic8rAAAAADDTmkjZ2fXqVb5e2w1vefpV5pDX"
                            data-callback="onRecaptchaSuccess"
                            data-expired-callback="onRecaptchaExpired">
                        </div>
                    </div>
                    <button type="submit" class="cta-button">Envoyer la demande</button>
                </form>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    createGlobalDevisModal();

    const openDevisGlobalModal = document.getElementById('devis-global-modal');
    const openDevisGlobalBtns = document.querySelectorAll('.open-modal-btn-devis-global');

    if (openDevisGlobalModal) {
        openDevisGlobalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                openDevisGlobalModal.style.display = 'flex';
            });
        });

        const closeDevisGlobalBtn = openDevisGlobalModal.querySelector('.close-btn-devis-global');
        if (closeDevisGlobalBtn) closeDevisGlobalBtn.addEventListener('click', () => { openDevisGlobalModal.style.display = 'none'; });

        window.addEventListener('click', (event) => {
            if (event.target === openDevisGlobalModal) openDevisGlobalModal.style.display = 'none';
        });
    }

    // La logique de soumission des formulaires est gérée dans formulaireLogique.js
});
