
        document.addEventListener("DOMContentLoaded", () => {
            // Initialize Bootstrap Tooltips
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

            // FAB Toggle Logic
            const fabToggle = document.getElementById('fabToggle');
            if (fabToggle) {
                fabToggle.addEventListener('click', function () {
                    this.closest('.fab-container').classList.toggle('active');
                });
            }

            // Reference Site Trending Services Carousel Navigation
            const carousel = document.querySelector('.service-carousel');
            const prevBtn = document.querySelector('.carousel-prev');
            const nextBtn = document.querySelector('.carousel-next');

            if (carousel && prevBtn && nextBtn) {
                prevBtn.addEventListener('click', function () {
                    carousel.scrollBy({ left: -300, behavior: 'smooth' });
                });
                nextBtn.addEventListener('click', function () {
                    carousel.scrollBy({ left: 300, behavior: 'smooth' });
                });
            }

        });
    