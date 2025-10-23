document.addEventListener('DOMContentLoaded', () => {
    window.onRecaptchaSuccess = function(token) {
        console.log('reCAPTCHA validated');
        document.getElementById('main-contact-form')
            .setAttribute('data-recaptcha-validated', 'true');
    };

    window.onRecaptchaExpired = function() {
        console.log('reCAPTCHA expired');
        document.getElementById('main-contact-form')
            .setAttribute('data-recaptcha-validated', 'false');
    };
    // --- GESTION DU FORMULAIRE DE DEVIS NÉGOCE ---
    const devisNegoceForm = document.getElementById('devis-negoce-form');
    if (devisNegoceForm) {
        devisNegoceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = devisNegoceForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';

            const formData = new FormData(devisNegoceForm);
            const devisLivraisonCheckbox = document.getElementById('devis-livraison');
            const devisData = {
                produit: formData.get('product'),
                quantité: formData.get('quantity'),
                caracteristique: formData.get('quality'),
                contact: formData.get('contact'),
                livraison: devisLivraisonCheckbox ? devisLivraisonCheckbox.checked : false
                // La date sera ajoutée côté serveur
            };

            const response = await fetch('/api/data/public/devis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(devisData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const devisNegoceModal = document.getElementById('devis-negoce-modal');
                if (devisNegoceModal) devisNegoceModal.style.display = 'none';

                const confirmationModal = document.getElementById('devis-confirmation-modal');
                if (confirmationModal) confirmationModal.style.display = 'flex';

                devisNegoceForm.reset();
            } else {
                alert("Une erreur s'est produite lors de l'envoi de votre demande. Veuillez réessayer.");
            }

            submitButton.disabled = false;
            submitButton.textContent = 'Envoyer la demande';
        });
    }

    // --- GESTION DU FORMULAIRE DE DEVIS GLOBAL ---
    const devisGlobalForm = document.getElementById('devis-global-form');
    if (devisGlobalForm) {
        devisGlobalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = devisGlobalForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...'; // Changer le texte du bouton
            const formData = new FormData(devisGlobalForm);
            const devisData = {
                nom: formData.get('name'),
                email: formData.get('email'),
                telephone: formData.get('phone'),
                entreprise: formData.get('company'),
                message: formData.get('message')
                // La date sera ajoutée côté serveur
            };
            const response = await fetch('/api/data/public/devis-global', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(devisData)
            });
            const result = await response.json();
            if (response.ok && result.success) {
                const devisGlobalModal = document.getElementById('devis-global-modal');
                if (devisGlobalModal) devisGlobalModal.style.display = 'none';

                const confirmationModal = document.getElementById('devis-confirmation-modal');
                if (confirmationModal) confirmationModal.style.display = 'flex';

                devisGlobalForm.reset();
            } else {
                alert("Une erreur s'est produite lors de l'envoi de votre demande. Veuillez réessayer.");
            }
            submitButton.disabled = false;
            submitButton.textContent = 'Envoyer la demande'; // Réinitialiser le texte du bouton
        });
    }

    // --- GESTION DU FORMULAIRE DE CONTACT PRINCIPAL ---
    const contactForm = document.getElementById('main-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';

            const formData = new FormData(contactForm);
            const token = formData.get('g-recaptcha-response');

            if (!token || token.trim() === '') {
                alert("Veuillez cocher la case reCAPTCHA pour prouver que vous n'êtes pas un robot.");
                submitButton.disabled = false;
                submitButton.textContent = 'Envoyer le Message';
                return;
            }

            const contactData = {
                nom: formData.get('name'),
                mail: formData.get('email'),
                sujet: formData.get('subject'),
                message: formData.get('message'),
                'g-recaptcha-response': token
            };

            const response = await fetch('/api/form/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Fermer le formulaire de contact s'il est dans une modale, ou simplement afficher la confirmation
                const confirmationModal = document.getElementById('devis-confirmation-modal');
                if (confirmationModal) confirmationModal.style.display = 'flex';

                console.log('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
                contactForm.reset();
            } else {
                // Si la validation échoue (y compris le reCAPTCHA), on réinitialise le widget.
                grecaptcha.reset();
                const errorMessage = result.message || "Une erreur s'est produite. Veuillez réessayer.";
                alert(`Erreur : ${errorMessage}`);
            }

            submitButton.disabled = false;
            submitButton.textContent = 'Envoyer le Message';
        });
    }

    // ------- CONFIRMATION --------
    const closeConfirmationBtn = document.getElementById('close-confirmation-modal-btn');
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click',()=> {
            const confirmationModal = document.getElementById('devis-confirmation-modal');
            if (confirmationModal) {
                confirmationModal.style.display = 'none';
            }
        });
    }
});