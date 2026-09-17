// ============================================
// shared.js — La Casa Del Pan
// Utilidades comunes a todas las páginas
// ============================================

// Toast / Notificaciones
function showToast(message, type = 'success') {
    // Crear contenedor si no existe
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const icon = type === 'success' ? '✓' : '✕';
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'success' ? 'status' : 'alert');
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span>${message}</span>
        <button class="toast-close" aria-label="Cerrar notificación">&times;</button>
    `;

    // Botón cerrar manual
    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });

    container.appendChild(toast);

    // Auto-eliminar después de 4.5s
    setTimeout(() => {
        if (toast.isConnected) {
            removeToast(toast);
        }
    }, 4500);
}

function removeToast(toast) {
    toast.classList.add('toast-out');
    setTimeout(() => {
        if (toast.isConnected) {
            toast.remove();
        }
        // Limpiar contenedor vacío
        const container = document.querySelector('.toast-container');
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, 350);
}