// ============================================
// shared.js — La Casa Del Pan
// Utilidades comunes a todas las páginas:
// toasts, escape HTML, debounce/throttle.
// ============================================

// ---------- Utilidades base ----------

// Escapa texto para evitar inyección de HTML/XSS.
// Se usa en toda interpolación de datos (admin, catálogo, carrito).
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}

// Debounce: retrasa la ejecución hasta que se deje de llamar `ms` ms.
// Devuelve una función que preserva `this` y args.
function debounce(fn, ms = 150) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
    };
}

// Throttle: ejecuta como máximo una vez cada `ms` ms (con requestAnimationFrame opcional).
function throttle(fn, ms = 100) {
    let waiting = false;
    return function (...args) {
        if (waiting) return;
        waiting = true;
        setTimeout(() => {
            fn.apply(this, args);
            waiting = false;
        }, ms);
    };
}

// Escapa un valor para usarlo dentro de `url('...')` en CSS.
function escapeCssUrl(url) {
    return String(url).replace(/['"\\()\s]/g, (ch) => ch === ' ' ? '%20' : encodeURIComponent(ch));
}

// ---------- Toast / Notificaciones ----------

function showToast(message, type = 'success') {
    // Crear contenedor si no existe
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'success' ? 'status' : 'alert');

    const iconSpan = document.createElement('span');
    iconSpan.className = 'toast-icon';
    iconSpan.textContent = type === 'success' ? '✓' : '✕';

    const msgSpan = document.createElement('span');
    msgSpan.textContent = message; // textContent: evita inyección HTML

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Cerrar notificación');
    closeBtn.textContent = '×';

    // Botón cerrar manual
    closeBtn.addEventListener('click', () => removeToast(toast));

    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);
    toast.appendChild(closeBtn);
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