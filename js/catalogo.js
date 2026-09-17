// Catálogo de categorías para generar dinámicamente
const CATEGORIAS = {
    panes: {
        icono: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4a6 6 0 0 0 12 0 6 6 0 0 0-12 0"/><path d="M3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2"/><path d="M3 20a9 9 0 0 1 6-17"/></svg>',
        titulo: 'Panes Frescos',
        descripcion: 'Horneados diariamente con ingredientes naturales'
    },
    bolleria: {
        icono: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="12" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="16" y2="14"/></svg>',
        titulo: 'Cafetería',
        descripcion: 'Dulces y salados recién horneados'
    },
    pasteles: {
        icono: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        titulo: 'Pasteles y Postres',
        descripcion: 'Para ocasiones especiales'
    }
};

// Cargar productos desde JSON
async function cargarProductos() {
    const container = document.getElementById('productsContainer');
    const infoEl = document.getElementById('productsInfo');
    try {
        const respuesta = await fetch('productos.json');
        const productos = await respuesta.json();
        renderizarProductos(productos);
        if (infoEl) infoEl.textContent = `${productos.length} productos artesanales disponibles`;
        return productos;
    } catch (error) {
        console.error('Error al cargar productos:', error);
        container.innerHTML = `
            <div class="empty-state">
                <h3>Error al cargar productos</h3>
                <p>No pudimos cargar los productos. Por favor, intenta de nuevo más tarde.</p>
            </div>
        `;
        return [];
    } finally {
        const skeleton = document.getElementById('loadingSkeleton');
        if (skeleton) skeleton.remove();
    }
}

// Renderizar todos los productos agrupados por categoría
function renderizarProductos(productos) {
    const container = document.getElementById('productsContainer');
    let html = '';

    // Agrupar productos por categoría
    const categorias = {};
    productos.forEach(p => {
        if (!categorias[p.categoria]) categorias[p.categoria] = [];
        categorias[p.categoria].push(p);
    });

    // Generar HTML por cada categoría
    for (const [cat, prods] of Object.entries(categorias)) {
        const info = CATEGORIAS[cat] || { icono: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>', titulo: cat, descripcion: '' };
        html += `
            <div class="category-section" data-category="${cat}">
                <div class="category-header">
                    <span class="category-icon">${info.icono}</span>
                    <div>
                        <h3 class="category-title">${info.titulo}</h3>
                    </div>
                    <div class="category-description">${info.descripcion}</div>
                </div>
                <div class="products-grid">
                    ${prods.map(p => generarTarjetaProducto(p)).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    // Asignar eventos a las tarjetas y botones
    asignarEventosProductos();
    // Cargar imágenes de forma diferida (lazy) para mejor rendimiento
    inicializarLazyLoading();
    // Animación stagger: las tarjetas aparecen una por una
    animarTarjetasProgresivas();
}

// Generar HTML de una tarjeta de producto
function generarTarjetaProducto(p) {
    const estrellas = generarEstrellas(p.rating);
    const badgeHtml = p.badge ? `<span class="product-badge ${p.badge}">${p.badge === 'popular' ? 'Popular' : 'Nuevo'}</span>` : '';
    const nombreCategoria = p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1);

    return `
        <div class="product-card" data-category="${p.categoria}">
            <div class="product-image lazy" data-src="${p.imagen_url}" style="background-color: var(--lazy-bg, #f3e8d6);">
                ${badgeHtml}
            </div>
            <div class="product-content">
                <div class="product-category">${nombreCategoria}</div>
                <h4 class="product-title">${p.nombre}</h4>
                <p class="product-description">${p.descripcion}</p>
                <div class="product-details">
                    <div class="product-price">${p.precio_display}</div>
                    <div class="product-rating">
                        ${estrellas}
                        <span class="rating-text">(${p.rating})</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart"
                        data-id="${p.id}"
                        data-name="${p.nombre}"
                        data-price="${p.precio}"
                        data-price-display="${p.precio_display}"
                        data-image="${p.imagen_url}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-emoji" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Generar estrellas según rating
function generarEstrellas(rating) {
    const llenas = Math.round(rating);
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += `<div class="star ${i >= llenas ? 'empty' : ''}"></div>`;
    }
    return html;
}

// Asignar eventos a productos dinámicos
function asignarEventosProductos() {
    // Eventos para botones "Agregar al carrito"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            const priceDisplay = this.dataset.priceDisplay || `S/${price.toFixed(2)}`;
            const image = this.dataset.image;
            addToCart({ id, name, price, priceDisplay, image });
        });
    });

    // Eventos para abrir modal al hacer clic en tarjeta
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.add-to-cart')) {
                openProductModal(this);
            }
        });
    });
}

// Carga diferida (lazy loading) de imágenes de producto con IntersectionObserver
let lazyObserver = null;

function inicializarLazyLoading() {
    const images = document.querySelectorAll('.product-image.lazy');
    if (!images.length) return;

    // Si el navegador no soporta IntersectionObserver, cargar todo inmediatamente
    if (!('IntersectionObserver' in window)) {
        images.forEach(cargarImagenLazy);
        return;
    }

    if (!lazyObserver) {
        lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cargarImagenLazy(entry.target);
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '400px 0px', threshold: 0.01 });
    }

    images.forEach(img => lazyObserver.observe(img));
}

function cargarImagenLazy(el) {
    const src = el.dataset.src;
    if (!src || el.style.backgroundImage.includes(src)) return;
    el.style.backgroundImage = `url('${src}')`;
    el.classList.add('loaded');
}

// Animación de entrada escalonada (stagger) para las tarjetas de producto.
// Se activa solo al cargar inicialmente (respeta prefers-reduced-motion).
function animarTarjetasProgresivas() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = document.querySelectorAll('.product-card');
    if (reduceMotion) {
        cards.forEach(card => card.classList.add('card-visible'));
        return;
    }
    // Cerrar observador anterior si existiera
    if (window.__staggerObserver) window.__staggerObserver.disconnect();
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const idx = Array.prototype.indexOf.call(cards, card);
                card.style.transitionDelay = `${Math.min(idx * 40, 300)}ms`;
                card.classList.add('card-visible');
                obs.unobserve(card);
            }
        });
    }, { threshold: 0.1 });
    window.__staggerObserver = observer;
    // Reiniciar el estado antes de animar
    cards.forEach(card => {
        card.classList.remove('card-visible');
        card.style.transitionDelay = '0ms';
        observer.observe(card);
    });
}

// Menú hamburguesa responsivo para navegación
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('open');
        menuToggle.classList.toggle('open');
    });
    // Cerrar menú al hacer clic en un enlace
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
            menuToggle.classList.remove('open');
        });
    });
}
// Cart functionality
const CART_STORAGE_KEY = 'lacasadepan_carrito';
let cart = [];
try {
    const guardado = localStorage.getItem(CART_STORAGE_KEY);
    if (guardado) cart = JSON.parse(guardado);
} catch (e) {
    cart = [];
}
let cartCount = 0;
let cartTotal = 0;

// Guardar el carrito en localStorage (persiste entre recargas)
function guardarCarrito() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        // Almacenamiento no disponible: se ignora y el carrito sigue en memoria
    }
}

// DOM elements
const cartButton = document.getElementById('cartButton');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartCountElement = document.getElementById('cartCount');
const cartItemsElement = document.getElementById('cartItems');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');

// Filter functionality (elementos se consultan después de cargar)
const searchInput = document.getElementById('searchInput');
// Agregar producto al carrito
function addToCart(product) {
    const qty = Number.isFinite(product.quantity) && product.quantity > 0
        ? product.quantity
        : 1;

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty });
    }

    guardarCarrito();
    updateCartUI();

    const cartBtn = document.getElementById('cartButton');
    if (cartBtn) {
        cartBtn.classList.remove('bump');
        void cartBtn.offsetWidth;
        cartBtn.classList.add('bump');
    }

    const nombre = product && product.name ? product.name : 'Producto';
    showToast(`${nombre} agregado al carrito`);
}

// Exponer la función globalmente para uso en HTML
function removeFromCart(productId) {
    const item = cart.find(i => i.id === productId);
    cart = cart.filter(item => item.id !== productId);
    guardarCarrito();
    updateCartUI();
    if (item) showToast(`${item.name} eliminado del carrito`, 'error');
}
window.removeFromCart = removeFromCart;

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        guardarCarrito();
        updateCartUI();
    }
}
window.updateQuantity = updateQuantity;
// Actualizar la interfaz del carrito
function updateCartUI() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    // Total exacto: suma real sin redondear cada línea, y se redondea a céntimos UNA vez al final.
    // Así 3 x (1/3) = 1.00 (los combos tipo "3 x S/1" cuadran exactos).
    cartTotal = Math.round(cart.reduce((total, item) => total + item.price * item.quantity, 0) * 100) / 100;
    
    cartCountElement.textContent = cartCount;
    subtotalElement.textContent = `S/${cartTotal.toFixed(2)}`;
    totalElement.textContent = `S/${cartTotal.toFixed(2)}`;
    
    // Update cart items display
    cartItemsElement.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Tu carrito está vacío. ¡Agrega algo delicioso!</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">S/${item.price.toFixed(2)}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', parseInt(this.value))">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button class="quantity-btn" onclick="removeFromCart('${item.id}')" style="margin-left: 0.5rem; color: #dc2626;">✕</button>
                    </div>
                </div>
            `;
            cartItemsElement.appendChild(cartItem);
        });
    }
}

// Cart sidebar toggle
function abrirCarrito() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

cartButton.addEventListener('click', abrirCarrito);

cartOverlay.addEventListener('click', cerrarCarrito);
closeCart.addEventListener('click', cerrarCarrito);

// Close cart when clicking outside, pero ignorar clicks en controles de cantidad (mejorado)
document.addEventListener('mousedown', (e) => {
    // Si el click es dentro del sidebar pero sobre controles de cantidad, no cerrar
    if (cartSidebar.contains(e.target)) {
        // Buscar si el target o algún padre tiene la clase quantity-btn o quantity
        let el = e.target;
        while (el && el !== cartSidebar) {
            if (el.classList && (el.classList.contains('quantity-btn') || el.classList.contains('quantity'))) {
                return; // No cerrar
            }
            el = el.parentElement;
        }
    }
    if (!cartSidebar.contains(e.target) && !cartButton.contains(e.target)) {
        cerrarCarrito();
    }
});

// Filter functionality (usa querySelectorAll dinámico para elementos generados)
function aplicarFiltro(categoria) {
    const secciones = document.querySelectorAll('.category-section');
    const container = document.getElementById('productsContainer');
    
    // Limpiar estado vacío previo de búsqueda
    const noResults = container.querySelector('.no-results');
    if (noResults) noResults.remove();
    
    let primeraVisible = null;
    if (categoria === 'todos') {
        secciones.forEach(s => s.style.display = 'block');
    } else {
        secciones.forEach(s => {
            s.style.display = s.dataset.category === categoria ? 'block' : 'none';
            if (s.style.display === 'block' && !primeraVisible) primeraVisible = s;
        });
    }
    
    // Actualizar contador de productos según filtro
    if (productsInfoEl) {
        const tarjetasVisibles = document.querySelectorAll('.product-card:not([style*="none"])');
        productsInfoEl.textContent = `${tarjetasVisibles.length} producto${tarjetasVisibles.length === 1 ? '' : 's'} disponibles`;
    }
    
    // Smooth scroll a la categoría seleccionada (solo en desktop, y si hay búsqueda vacía)
    const searchValue = searchInput ? searchInput.value.trim() : '';
    if (categoria !== 'todos' && primeraVisible && !searchValue) {
        setTimeout(() => {
            primeraVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }
}

// Listener para botones de filtro
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        aplicarFiltro(this.dataset.category);
    });
});

// Search functionality (usa querySelectorAll dinámico)
const productsInfoEl = document.getElementById('productsInfo');

function aplicarBusqueda(termino) {
    const tarjetas = document.querySelectorAll('.product-card');
    const secciones = document.querySelectorAll('.category-section');
    const searchLower = termino.toLowerCase();
    const container = document.getElementById('productsContainer');
    
    // Limpiar estado vacío previo
    const noResults = container.querySelector('.no-results');
    if (noResults) noResults.remove();
    
    if (!searchLower) {
        // Mostrar todo si no hay búsqueda
        tarjetas.forEach(c => c.style.display = 'block');
        secciones.forEach(s => s.style.display = 'block');
        if (productsInfoEl) {
            const total = tarjetas.length;
            productsInfoEl.textContent = `${total} productos artesanales disponibles`;
        }
        return;
    }
    
    let contador = 0;
    tarjetas.forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        const description = card.querySelector('.product-description').textContent.toLowerCase();
        const category = card.querySelector('.product-category').textContent.toLowerCase();
        
        const visible = title.includes(searchLower) || description.includes(searchLower) || category.includes(searchLower);
        card.style.display = visible ? 'block' : 'none';
        if (visible) contador++;
    });
    
    // Mostrar/ocultar secciones según productos visibles
    secciones.forEach(section => {
        const visibleProducts = section.querySelectorAll('.product-card:not([style*="none"])');
        section.style.display = visibleProducts.length > 0 ? 'block' : 'none';
    });
    
    if (productsInfoEl) {
        productsInfoEl.textContent = contador > 0
            ? `${contador} resultado${contador === 1 ? '' : 's'} para "${termino}"`
            : '';
    }
    
    // Estado vacío cuando no hay resultados
    if (contador === 0) {
        const emptyHtml = `
            <div class="no-results">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <h3>Sin resultados</h3>
                <p>No encontramos productos que coincidan con "${termino}". Intenta con otra búsqueda.</p>
                <button class="btn btn-primary" id="clearSearchBtn">Ver todos los productos</button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', emptyHtml);
        const clearBtn = container.querySelector('#clearSearchBtn');
        clearBtn.addEventListener('click', function() {
            const input = document.getElementById('searchInput');
            if (input) input.value = '';
            aplicarFiltro(document.querySelector('.filter-btn.active').dataset.category);
            aplicarBusqueda('');
            input.focus();
        });
    }
}

// Debounce para la búsqueda: evitar re-render en cada tecla
let searchTimer = null;
searchInput.addEventListener('input', function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function() {
        aplicarBusqueda(searchInput.value);
    }, 150);
});

// Scroll listener for header shadow (pasivo + throttled con rAF para fluidez)
window.addEventListener('scroll', function() {
    if (window._scrollTicking) return;
    window._scrollTicking = true;
    requestAnimationFrame(function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        window._scrollTicking = false;
    });
}, { passive: true });

// Filters toggle for mobile
const filtersToggle = document.getElementById('filtersToggle');
const filtersContent = document.getElementById('filtersContent');
const filtersToggleText = document.getElementById('filtersToggleText');

if (filtersToggle && filtersContent) {
    filtersToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = filtersContent.classList.toggle('open');
        filtersToggle.classList.toggle('open', isOpen);
        if (filtersToggleText) filtersToggleText.textContent = isOpen ? 'Cerrar Filtros' : 'Filtrar Productos';
    });

    // Cerrar el panel al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!filtersContent.contains(e.target) && !filtersToggle.contains(e.target)) {
            filtersContent.classList.remove('open');
            filtersToggle.classList.remove('open');
            if (filtersToggleText) filtersToggleText.textContent = 'Filtrar Productos';
        }
    });

    // Cerrar al seleccionar un filtro
    filtersContent.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                filtersContent.classList.remove('open');
                filtersToggle.classList.remove('open');
                if (filtersToggleText) filtersToggleText.textContent = 'Filtrar Productos';
            }
        });
    });
}

// Formatea el precio unitario para el mensaje de WhatsApp.
// Si el precio_display viene como combo tipo "4 x S/1" o "3 x S/1",
// muestra solo el precio unitario real (S/0.25, S/0.33) para no confundir.
function formatearPrecioUnitario(item) {
    const display = (item.priceDisplay || '').trim();
    // Detecta patrón "<n> x S/<m>" (combo por unidad)
    const match = display.match(/^\d+\s*x\s*S\/\s*\d+(\.\d+)?$/i);
    if (match) {
        return `S/${item.price.toFixed(2)}`;
    }
    // Si no es combo, usa el display tal cual ("S/25.00", "S/12.00", etc.)
    if (display) return display;
    // Fallback final
    return `S/${item.price.toFixed(2)}`;
}

// Checkout via WhatsApp
function proceedToWhatsApp() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de realizar tu pedido.');
        return;
    }

    // Build message
    let message = '*Pedido - La Casa Del Pan*\n\n';
    message += '*Productos:*\n';

    cart.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        const precioTxt = formatearPrecioUnitario(item);
        message += `• ${item.name}\n`;
        message += `  Cantidad: ${item.quantity} x ${precioTxt} = S/${itemTotal}\n\n`;
    });
    
    message += `─────────────────\n`;
    message += `*Total: S/${cartTotal.toFixed(2)}*\n\n`;
    message += '¡Gracias por tu preferencia!';
    
    // Encode and open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${numeroWilliams}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}
//numeros de contacto para WhatsApp
const numeroWilliams = 51998956056;
const numeroJuan = 51942853549;

// Checkout button event listener
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToWhatsApp);
}

// Initialize cart
updateCartUI();

// Cargar productos desde JSON al iniciar
cargarProductos();

// ==========================================
// PRODUCT MODAL FUNCTIONALITY
// ==========================================

// Modal elements
const productModal = document.getElementById('productModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalAddToCart = document.getElementById('modalAddToCart');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const modalQuantityInput = document.getElementById('modalQuantityInput');

// Modal data elements
const modalProductImage = document.getElementById('modalProductImage');
const modalBadge = document.getElementById('modalBadge');
const modalCategory = document.getElementById('modalCategory');
const modalTitle = document.getElementById('modalTitle');
const modalRating = document.getElementById('modalRating');
const modalDescription = document.getElementById('modalDescription');
const modalPrice = document.getElementById('modalPrice');

// Current product data
let currentProduct = null;

// Open modal with product data
function openProductModal(card) {
    const imgEl = card.querySelector('.product-image');
    // Si la imagen aún no se cargó (lazy), cargarla antes de abrir el modal
    if (imgEl && imgEl.classList.contains('lazy')) {
        cargarImagenLazy(imgEl);
    }
    // Get product data from card
    const imageStyle = imgEl.style.backgroundImage;
    // Fix the URL extraction - remove url("...") wrapper
    let image = imageStyle.replace(/url\(/g, '').replace(/"/g, '').replace(/\)/g, '');
    
    const category = card.querySelector('.product-category').textContent;
    const title = card.querySelector('.product-title').textContent;
    const description = card.querySelector('.product-description').textContent;
    const priceText = card.querySelector('.product-price').textContent;
    const ratingContainer = card.querySelector('.product-rating');
    const badge = card.querySelector('.product-badge');
    const addToCartBtn = card.querySelector('.add-to-cart');
    
    // Extract rating
    const stars = ratingContainer.querySelectorAll('.star').length;
    const emptyStars = ratingContainer.querySelectorAll('.star.empty').length;
    const fullStars = stars - emptyStars;
    const ratingText = ratingContainer.querySelector('.rating-text').textContent;
    
    // Store current product data
    currentProduct = {
        id: addToCartBtn.dataset.id,
        name: addToCartBtn.dataset.name,
        price: parseFloat(addToCartBtn.dataset.price),
        priceDisplay: addToCartBtn.dataset.priceDisplay || `S/${parseFloat(addToCartBtn.dataset.price).toFixed(2)}`,
        image: addToCartBtn.dataset.image
    };
    
    // Populate modal
    modalProductImage.src = image;
    modalCategory.textContent = category;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalPrice.textContent = priceText;
    
    // Set badge
    if (badge) {
        modalBadge.textContent = badge.textContent;
        modalBadge.className = 'modal-badge ' + badge.className.replace('product-badge', '');
        modalBadge.style.display = 'block';
    } else {
        modalBadge.style.display = 'none';
    }
    
    // Set rating stars
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += '<div class="star"></div>';
        } else {
            starsHtml += '<div class="star empty"></div>';
        }
    }
    starsHtml += `<span class="rating-text">${ratingText}</span>`;
    modalRating.innerHTML = starsHtml;
    
    // Reset quantity
    modalQuantityInput.value = 1;
    
    // Show modal
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
    currentProduct = null;
}

// Event listeners for opening modal
// (Los listeners de .product-card se asignan en asignarEventosProductos() tras renderizar.

// Close modal events
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && productModal.classList.contains('active')) {
        closeModal();
    }
    if (e.key === 'Escape' && cartSidebar.classList.contains('open')) {
        cerrarCarrito();
    }
});

// Quantity controls
qtyMinus.addEventListener('click', function() {
    let currentQty = parseInt(modalQuantityInput.value);
    if (currentQty > 1) {
        modalQuantityInput.value = currentQty - 1;
    }
});

qtyPlus.addEventListener('click', function() {
    let currentQty = parseInt(modalQuantityInput.value);
    if (currentQty < 99) {
        modalQuantityInput.value = currentQty + 1;
    }
});

// Add to cart from modal
modalAddToCart.addEventListener('click', function() {
    if (currentProduct) {
        const quantity = parseInt(modalQuantityInput.value);

        addToCart({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            priceDisplay: currentProduct.priceDisplay,
            image: currentProduct.image,
            quantity: quantity
        });

        // Show feedback
        const originalText = this.innerHTML;
        this.innerHTML = '✓ ¡Agregado!';
        this.style.background = '#059669';

        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.background = '';
        }, 1500);

        // Close modal after adding
        setTimeout(() => {
            closeModal();
        }, 500);
    }
});

// ==========================================
// NUEVAS MEJORAS 2026
// ==========================================

// Botón "Volver arriba": aparece al hacer scroll, vuelve suavemente al inicio
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', function() {
        if (window._scrollTickingBack) return;
        window._scrollTickingBack = true;
        requestAnimationFrame(function() {
            backToTop.classList.toggle('visible', window.scrollY > 400);
            window._scrollTickingBack = false;
        });
    }, { passive: true });

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Compartir producto desde el modal (Web Share API + fallback de portapapeles)
const modalShare = document.getElementById('modalShare');
if (modalShare) {
    modalShare.addEventListener('click', async function() {
        if (!currentProduct) return;
        const titulo = currentProduct.name;
        const texto = `🍞 ${titulo} — ¡Míralo en La Casa Del Pan!`;
        const url = window.location.href.split('#')[0];

        const shareData = {
            title: `${titulo} | La Casa Del Pan`,
            text: texto,
            url: url
        };

        try {
            if (navigator.share && window.matchMedia('(max-width: 768px)').matches) {
                await navigator.share(shareData);
                return;
            }
        } catch (e) {
            // El usuario canceló o falló el share nativo; ignorar
            return;
        }

        // Fallback: copiar al portapapeles
        try {
            await navigator.clipboard.writeText(`${titulo} — ${url}`);
            showToast('Enlace copiado al portapapeles');
        } catch (e) {
            showToast('No se pudo copiar el enlace', 'error');
        }
    });
}
