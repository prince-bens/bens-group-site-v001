document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.querySelector('.enumeration-tabs');
    const contentWrapper = document.querySelector('.enumeration-content-wrapper');
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.enumeration-content');
    const images = document.querySelectorAll('.etape-image');

    if (!tabsContainer || !contentWrapper) return;

    // --- Changement d'onglet au clic ---
    tabsContainer.addEventListener('click', (e) => {
        const clicked = e.target.closest('.tab-link');
        if (!clicked) return;

        const tabNumber = clicked.dataset.tab;
        switchTab(tabNumber);
    });

    // --- Fonctionnalité de balayage (swipe) pour mobile ---
    let touchstartX = 0;
    let touchendX = 0;

    contentWrapper.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });

    contentWrapper.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const currentActiveTab = document.querySelector('.tab-link.active');
        let currentTabIndex = parseInt(currentActiveTab.dataset.tab);
        let nextTabIndex;

        // Balayage vers la gauche
        if (touchendX < touchstartX - 50) { // Seuil de 50px
            nextTabIndex = currentTabIndex < tabs.length ? currentTabIndex + 1 : 1; // Boucle au début
            switchTab(nextTabIndex);
        }

        // Balayage vers la droite
        if (touchendX > touchstartX + 50) { // Seuil de 50px
            nextTabIndex = currentTabIndex > 1 ? currentTabIndex - 1 : tabs.length; // Boucle à la fin
            switchTab(nextTabIndex);
        }
    }

    function switchTab(tabNumber) {
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        images.forEach(image => image.classList.remove('active'));

        const newActiveTab = document.querySelector(`.tab-link[data-tab="${tabNumber}"]`);
        const newActiveContent = document.getElementById(`tab-${tabNumber}`);
        const newActiveImage = document.getElementById(`image-tab-${tabNumber}`);

        if (newActiveTab) newActiveTab.classList.add('active');
        if (newActiveContent) newActiveContent.classList.add('active');
        if (newActiveImage) newActiveImage.classList.add('active');
    }
});