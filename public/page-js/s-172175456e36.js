
document.addEventListener("DOMContentLoaded", () => {
    // Disable Right-Click Context Menu
// Initialize Bootstrap Tooltips for the FAB
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // FAB Toggle Logic
    const fabToggle = document.getElementById('fabToggle');
    if (fabToggle) {
        fabToggle.addEventListener('click', function() {
            this.closest('.fab-container').classList.toggle('active');
        });
    }
});
