/* ==========================================
   LÓGICA DEL MENÚ DESPLEGABLE EN MÓVIL
========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const btnMenuToggle = document.getElementById('btn-menu-toggle');
    const sidebarMenu = document.getElementById('sidebar-menu');

    if (btnMenuToggle && sidebarMenu) {
        // Abrir / Cerrar menú al presionar el botón de la barra superior
        btnMenuToggle.addEventListener('click', () => {
            sidebarMenu.classList.toggle('active');
            
            const icon = btnMenuToggle.querySelector('i');
            if (sidebarMenu.classList.contains('active')) {
                icon.className = 'ph ph-x'; // Cambia el icono a una 'X'
            } else {
                icon.className = 'ph ph-list'; // Regresa al icono de hamburguesa
            }
        });

        // Cerrar menú desplegable al hacer clic en cualquier opción de navegación
        const navButtons = sidebarMenu.querySelectorAll('.nav-btn, .backup-actions button, .backup-actions label');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebarMenu.classList.remove('active');
                    const icon = btnMenuToggle.querySelector('i');
                    if (icon) icon.className = 'ph ph-list';
                }
            });
        });
    }
});
