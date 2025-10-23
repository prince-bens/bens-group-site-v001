
// Cette fonction sera appelée par le script Google reCAPTCHA une fois qu'il sera chargé.
var onloadCallback = function() {
    // Trouve le conteneur reCAPTCHA sur la page.
    const recaptchaContainer = document.getElementById('recaptcha-widget');
    
    // Si le conteneur n'existe pas sur la page actuelle, on ne fait rien.
    if (!recaptchaContainer) {
        return;
    }

    // Récupère la clé de site depuis notre backend.
    fetch('/api/config/recaptcha-site-key')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Le serveur a répondu avec le statut : ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.key) {
                // Si la clé est obtenue, on affiche le widget reCAPTCHA.
                grecaptcha.render('recaptcha-widget', {
                    'sitekey': data.key
                });
            } else {
                // Si le backend signale une erreur, on l'affiche.
                console.error('Impossible de charger la clé de site reCAPTCHA depuis le serveur.');
                recaptchaContainer.innerHTML = "<p style='color: red;'>Erreur de chargement du reCAPTCHA. Veuillez rafraîchir la page.</p>";
            }
        })
        .catch(error => {
            // S'il y a eu une erreur réseau, on l'affiche.
            console.error('Erreur lors de la récupération de la clé reCAPTCHA :', error);
            recaptchaContainer.innerHTML = "<p style='color: red;'>Erreur de chargement du reCAPTCHA. Veuillez rafraîchir la page.</p>";
        });
};