document.addEventListener('DOMContentLoaded', () => {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) {
        console.error("L'élément #navbar-placeholder est introuvable.");
        return;
    }

    // Déterminer la page actuelle pour le style du lien actif
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash;

    const navLinks = [
        { href: 'index.html', text: 'ACCUEIL' },
        { href: 'transport-logistique.html', text: 'BENS TRANSPORT' },
        { href: 'negoce-materiaux.html', text: 'BENS NÉGOCE' },
        { href: 'PresentationNexus.html', text: 'BENS NEXUS' },
        { href: 'a-propos.html', text: 'À PROPOS' },
        // { href: 'index.html#contact-us', text: 'Contact' }
    ];

    // Générer les liens de navigation
    const linksHTML = navLinks.map(link => {
        const [linkPath, linkHash = ''] = link.href.split('#');
        let isActive = false;

        if (currentHash) { // Si l'URL a un hash (ex: #contact-us)
            isActive = linkPath === currentPath && `#${linkHash}` === currentHash;
        } else { // Si l'URL n'a pas de hash
            isActive = linkPath === currentPath && !link.href.includes('#');
        }
        return `<li><a class="optionMenu ${isActive ? 'indexé' : ''}" href="${link.href}">${link.text}</a></li>`; // 'indexé' est la classe pour le style actif
    }).join('');

    // Template HTML de la barre de navigation
    const navbarHTML = `
        <header class="main-header">
            <div class="logo" onclick="window.location.href='index.html'">
                <img src="./assets/image/bensLogo.png" class="LogoEntreprise" alt="Logo BENS Groupe">
            </div>
            <nav>
                <ul class="menu">
                    ${linksHTML}
                    <li class="auth-button"><a href="./dashboard" id="auth-button">Espace client</a></li>
                </ul>
                <div class="hamburger">
                    <img src="./assets/svg/burger.svg" alt="Menu">
                </div>
            </nav>
        </header>
    `;

    navbarPlaceholder.innerHTML = navbarHTML;

    // Ré-attacher la logique du menu hamburger
    const hamburger = navbarPlaceholder.querySelector('.hamburger');
    const menu = navbarPlaceholder.querySelector('.menu');
    if (hamburger && menu) {
        hamburger.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        // Fermer le menu en cliquant sur une option
        navbarPlaceholder.querySelectorAll('.optionMenu').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
            });
        });
    }
});