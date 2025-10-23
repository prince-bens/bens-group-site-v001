let IdATransmetre = '';
document.addEventListener('DOMContentLoaded', function() {
    // Gestion des onglets (identique)
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    const tabIndicator = document.getElementById('tab-indicator');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const activeTabIndex = Array.from(tabs).findIndex(t => t.classList.contains('active'));
            const clickedTabIndex = Array.from(tabs).findIndex(t => t === this);
            tabIndicator.style.transform = `translateX(${clickedTabIndex * 100}%)`;
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            forms.forEach(form => {
                if (form.id === `${tabId}-form`) {
                    form.classList.remove('slide-in-left', 'slide-in-right');
                    form.classList.add(clickedTabIndex > activeTabIndex ? 'slide-in-right' : 'slide-in-left');
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        });
    });

    // Éléments du formulaire de connexion
    const loginForm = document.getElementById('login-form');
    const loginIdInput = document.getElementById('login-id');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const loginPasswordInput = document.getElementById('login-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordGroup = document.getElementById('login-password-group');
    const newPasswordGroup = document.getElementById('new-password-group');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');
    const contactGroup = document.getElementById('contact-group');
    const contactInfoInput = document.getElementById('contact-info');

    // Logique de connexion conditionnelle
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formState = loginSubmitBtn.textContent.trim();
        const clientId = loginIdInput.value.trim();

        LoadingAnimation.start('login-loading');

        try {
            if (formState === "Vérifier l'identifiant") {
                if (!clientId) {
                    showError('login-id-error', 'Veuillez entrer votre identifiant');
                    return;
                }

                const response = await fetch('/api/verify-client', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clientId })
                });

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error || 'Erreur de vérification');
                }
                console.log('Résultat de la vérification de l\'identifiant:', result);
                switch (result.status) {
                    case 'EXISTING_ACCOUNT':
                        showPasswordField();
                        loginSubmitBtn.textContent = "Se connecter";
                        loginForm.dataset.authEmail = result.authEmail;
                        break;
                    case 'NEW_ACCOUNT_NEEDED':
                        showNewPasswordFields();
                        IdATransmetre = result.clientInfo.ID_Client;
                        console.log("ID_Client à transmettre lors de la création du compte :", IdATransmetre);
                        // Vérifie si l'email est valide avant de le pré-remplir
                        if (result.clientInfo.Email && validateEmail(result.clientInfo.Email)) {
                            contactInfoInput.value = result.clientInfo.Email;
                        }
                        loginSubmitBtn.textContent = "Créer mon compte";
                        break;
                    case 'UNKNOWN_CLIENT':
                        showError('login-id-error', 'Identifiant introuvable. Veuillez vous inscrire.');
                        suggestRegistration();
                        break;
                }

            } else if (formState === "Se connecter") {
                const password = loginPasswordInput.value;
                if (!password) {
                    showError('login-password-error', 'Veuillez entrer votre mot de passe');
                    return;
                }

                const loginResponse = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        authEmail: loginForm.dataset.authEmail,
                        password: password
                    })
                });

                const loginResult = await loginResponse.json();
                if (loginResult.success) {
                    window.location.href = '/dashboard';
                } else {
                    showError('login-password-error', loginResult.error || 'Mot de passe ou identifiant incorrect');
                }

            } else if (formState === "Créer mon compte") {
                const newPassword = newPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                const contactInfo = contactInfoInput.value.trim();

                if (!newPassword || !confirmPassword) {
                    showError('new-password-error', 'Veuillez remplir tous les champs de mot de passe');
                    return;
                }

                if (newPassword !== confirmPassword) {
                    showError('confirm-password-error', 'Les mots de passe ne correspondent pas');
                    return;
                }

                const createResponse = await fetch('/api/create-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientId: clientId,
                        password: newPassword,
                        contactInfo: contactInfo
                    })
                });

                const createResult = await createResponse.json();
                if (createResult.success) {
                    // Redirige vers le tableau de bord avec un paramètre pour la première connexion
                    window.location.href = `/dashboard?new_account=true&clientId=${IdATransmetre}`;
                } else {
                    showError('new-password-error', createResult.error || 'Erreur lors de la création du compte');
                }
            }
        } catch (error) {
            console.error("Erreur dans le formulaire de connexion:", error);
            showError('login-id-error', 'Erreur de communication avec le serveur.');
        } finally {
            LoadingAnimation.stop('login-loading');
        }
    });

    // Logique d'inscription (inchangée)
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        LoadingAnimation.start('register-loading');
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const termsAccepted = document.getElementById('register-terms').checked;
        let isValid = true;

        // Validation (identique)
        if (!name) {
            showError('register-name-error', 'Veuillez entrer votre nom complet');
            isValid = false;
        } else {
            hideError('register-name-error');
        }

        if (!email && !phone) {
            showError('register-email-error', 'Veuillez renseigner au moins un email ou un numéro de téléphone');
            showError('register-phone-error', 'Veuillez renseigner au moins un email ou un numéro de téléphone');
            isValid = false;
        } else {
            hideError('register-email-error');
            hideError('register-phone-error');
            if (email && !validateEmail(email)) {
                showError('register-email-error', 'Veuillez entrer un email valide');
                isValid = false;
            }
            if (phone && !validatePhone(phone)) {
                showError('register-phone-error', 'Veuillez entrer un numéro valide');
                isValid = false;
            }
        }

        if (!termsAccepted) {
            alert('Veuillez accepter les conditions d\'utilisation');
            isValid = false;
        }
        if (!isValid) {
            LoadingAnimation.stop('register-loading');
            return;
        }

        try {
            
            const response = await fetch('/api/inscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom: name, email, telephone: phone })
            });
            const result = await response.json();
            if (result.success) {
                LoadingAnimation.stop('register-loading');
                console.log('info envoyées', name, email, phone);
                if (email!=='' && phone!=='') {
                    showTraiementInscriptionModal(name, 'Email et téléphone');
                }
                else if (email) {
                    showTraiementInscriptionModal(name, 'Email');
                }
                else if (phone) {
                    showTraiementInscriptionModal(name, 'Téléphone');
                }
            } else {
                showError('register-email-error', result.error || 'Erreur inscription');
            }
        } catch (err) {
            LoadingAnimation.stop('register-loading');
            console.error(err);
            showError('register-email-error', 'Erreur réseau ou serveur');
        }
    });

    // Fonctions utilitaires
    function showPasswordField() {
        passwordGroup.style.display = 'block';
        loginPasswordInput.required = true;
        newPasswordGroup.style.display = 'none';
        newPasswordInput.required = false;
        confirmPasswordGroup.style.display = 'none';
        confirmPasswordInput.required = false;
        contactGroup.style.display = 'none';
        hideError('login-id-error');
    }
    
    function showNewPasswordFields() {
        passwordGroup.style.display = 'none';
        loginPasswordInput.required = false;
        newPasswordGroup.style.display = 'block';
        newPasswordInput.required = true;
        confirmPasswordGroup.style.display = 'block';
        confirmPasswordInput.required = true;
        contactGroup.style.display = 'block';
        hideError('login-id-error');
    }
    
    function suggestRegistration() {
        document.querySelector('.auth-tab[data-tab="register"]').click();
    }
    
    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.style.display = 'block';
    }
    
    function hideError(elementId) {
        const element = document.getElementById(elementId);
        element.style.display = 'none';
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        const re = /^(\+?\d{1,4}[\s.-]?)?(\d{2,3}[\s.-]?){3,4}$/;
        return re.test(phone);
    }
    
    function formatPhone(phone) {
        return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }

    function showTraiementInscriptionModal(name, contact) {
        console.log(`Affichage modal pour ${name} avec contact: ${contact}`);
        const modal = document.getElementById('traiementInscription-modal');
        const contactSpan = modal.querySelector('.contact');
        if(name){
            document.querySelector('.nameInscription').textContent = `, Mr/s ${name}`;
            if(contact === 'Email et téléphone') {
                contactSpan.textContent = "+221781941351 ou contact@bens-groupe.com";
            }
            else if(contact === 'Email') {
                contactSpan.textContent = "contact@bens-groupe.com";
            }
            else if(contact === 'Téléphone') {
                contactSpan.textContent = "+221781941351";
            }
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        modal.querySelector('.modal-ok').onclick = closeTraiementInscriptionModal;
        modal.querySelector('.close-modal').onclick = closeTraiementInscriptionModal;
    }

    function closeTraiementInscriptionModal() {
        const modal = document.getElementById('traiementInscription-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // --- Logique pour afficher/masquer le mot de passe ---
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');

    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            // L'input est l'élément juste avant l'icône dans le HTML
            const passwordField = this.previousElementSibling;
            if (passwordField && passwordField.type === 'password') {
                passwordField.type = 'text';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            } else if (passwordField) {
                passwordField.type = 'password';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

// Animation chargement
const LoadingAnimation = {
    start: function(containerId) {
        const container = document.getElementById(containerId);
        if (container) container.style.display = 'block';
    },
    stop: function(containerId) {
        const container = document.getElementById(containerId);
        if (container) container.style.display = 'none';
    }
};

});