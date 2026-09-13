
            document.addEventListener("DOMContentLoaded", () => {
                const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
                [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

                const fabToggle = document.getElementById('fabToggle');
                if (fabToggle) {
                    fabToggle.addEventListener('click', function () {
                        this.closest('.fab-container').classList.toggle('active');
                    });
                }
            });
        