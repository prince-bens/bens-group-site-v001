document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (window.IntersectionObserver) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Déclenche l'animation quand 10% de l'élément est visible
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for older browsers
        animatedElements.forEach(element => element.classList.add('is-visible'));
    }
});