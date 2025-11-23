// Update stats on page load
document.addEventListener('DOMContentLoaded', () => {
    const flashcards = AppState.flashcards;
    const posts = AppState.posts;

    document.getElementById('totalFlashcards').textContent = flashcards.length;
    document.getElementById('totalPosts').textContent = posts.length;

    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
});
