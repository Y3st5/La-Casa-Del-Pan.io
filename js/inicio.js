// ============================================
// La Casa Del Pan - Script principal
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------
    // 0. Menú móvil accesible
    // (showToast/removeToast viven en shared.js)
    // ------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        // Estado inicial accesible
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-controls', 'mainNav');

        const openMenu = () => {
            mainNav.classList.add('open');
            menuToggle.classList.add('open');
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.setAttribute('aria-label', 'Cerrar menú');
        };

        const closeMenu = () => {
            mainNav.classList.remove('open');
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menú');
        };

        const toggleMenu = () => {
            if (mainNav.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        };

        // Click en el botón hamburguesa
        menuToggle.addEventListener('click', toggleMenu);

        // Click en un enlace: cerrar menú
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Click fuera del menú: cerrar
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                if (mainNav.classList.contains('open')) {
                    closeMenu();
                }
            }
        });

        // Tecla Escape: cerrar y devolver foco al botón
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav.classList.contains('open')) {
                closeMenu();
                menuToggle.focus();
            }
        });
    }

    // ------------------------------------------
    // 2. Smooth scroll con compensación de header
    // ------------------------------------------
    // El header está fixed, así que offset de ~80px
    const HEADER_OFFSET = 80;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Ignorar href="#" vacío
            if (href === '#' || href.length <= 1) return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ------------------------------------------
    // 3. Validación y envío del formulario
    // ------------------------------------------
    const form = document.getElementById('contactForm');

    if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : 'Enviar';

        // Mensajes de error
        const errorMessages = {
            required: 'Este campo es obligatorio',
            email: 'Ingresa un email válido',
            phone: 'Ingresa un teléfono válido (solo números, +, -, espacios)',
            minLength: (n) => `Mínimo ${n} caracteres`
        };

        const showError = (field, message) => {
            // Limpiar error previo
            const existingError = field.parentElement.querySelector('.error-message');
            if (existingError) existingError.remove();

            field.style.borderColor = '#dc2626';

            const errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.textContent = message;
            errorEl.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
            field.parentElement.appendChild(errorEl);
        };

        const clearError = (field) => {
            const existingError = field.parentElement.querySelector('.error-message');
            if (existingError) existingError.remove();
            field.style.borderColor = '';
        };

        const validateEmail = (email) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };

        const validatePhone = (phone) => {
            return /^[\d\s+\-()]{7,20}$/.test(phone);
        };

        // --- Validación unificada de un campo ---
        const validateField = (field) => {
            const value = field.value.trim();
            const fieldType = field.type || field.tagName.toLowerCase();
            const isRequired = field.hasAttribute('required');

            // Campo requerido vacío
            if (isRequired && !value) {
                showError(field, errorMessages.required);
                return false;
            }

            // Si está vacío y no es requerido, es válido
            if (!value) {
                clearError(field);
                return true;
            }

            // Validar según tipo
            if (fieldType === 'email') {
                if (!validateEmail(value)) {
                    showError(field, errorMessages.email);
                    return false;
                }
            } else if (fieldType === 'tel') {
                if (!validatePhone(value)) {
                    showError(field, errorMessages.phone);
                    return false;
                }
            } else if (field.id === 'mensaje' || fieldType === 'textarea') {
                if (value.length < 10) {
                    showError(field, errorMessages.minLength(10));
                    return false;
                }
            }

            clearError(field);
            return true;
        };

        // Validación al perder foco
        const fields = form.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                validateField(field);
            });

            // Limpiar error al escribir
            field.addEventListener('input', () => {
                if (field.parentElement.querySelector('.error-message')) {
                    clearError(field);
                }
            });
        });

        // Envío del formulario
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Limpiar errores previos
            fields.forEach(clearError);

            // Validar todos los campos con la función unificada
            let isValid = true;
            fields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                // Foco al primer error
                const firstError = form.querySelector('.error-message');
                if (firstError) firstError.previousElementSibling.focus();
                return;
            }

            // Número de WhatsApp de la panadería (el mismo que usa el catálogo)
            const numeroWilliams = 51998956056;

            const nombre = (form.querySelector('#nombre')?.value || '').trim();
            const email = (form.querySelector('#email')?.value || '').trim();
            const telefono = (form.querySelector('#telefono')?.value || '').trim();
            const mensaje = (form.querySelector('#mensaje')?.value || '').trim();

            let texto = `Hola, soy ${nombre}.`;
            if (email) texto += `\nEmail: ${email}`;
            if (telefono) texto += `\nTeléfono: ${telefono}`;
            texto += `\n\n${mensaje}`;

            const whatsappUrl = `https://wa.me/${numeroWilliams}?text=${encodeURIComponent(texto)}`;

            showToast('Abriendo WhatsApp...', 'success');
            window.open(whatsappUrl, '_blank');
            form.reset();
        });
    }

    // ------------------------------------------
    // 4. Gallery: soporte para touch mejorado
    // ------------------------------------------
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        // Soporte touch mejorado: tap toggle del overlay
        item.addEventListener('click', function(e) {
            // Solo en dispositivos táctiles (touch)
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                e.preventDefault();
                this.classList.toggle('touched');
            }
        });

        // En dispositivos no táctiles, el hover CSS funciona normalmente
        // En touch, mantener overlay visible después del tap hasta nuevo tap
        // Limpiar clase touched al hacer scroll para no dejar overlays colgados
        document.addEventListener('scroll', () => {
            galleryItems.forEach(el => el.classList.remove('touched'));
        }, { passive: true });
    });

});
