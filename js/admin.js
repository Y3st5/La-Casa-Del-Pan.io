// ============================================
// admin.js — La Casa Del Pan (Panel de Administración)
// CRUD completo, import/export, validación, previsualización
// ============================================

const ADMIN_CONFIG = {
    jsonPath: 'productos.json',
    categories: ['panes', 'bolleria', 'pasteles'],
    badges: ['', 'popular', 'nuevo'],
    storageKey: 'lacasadepan_admin_products'
};

// Escape HTML proviene de shared.js (con fallback defensivo).
const esc = window.escapeHtml || ((text) => String(text == null ? '' : text));

// Estado global
let products = [];
let filteredProducts = [];
let currentEditId = null;
let deleteTargetId = null;

// Elementos DOM (referencias cacheadas: evita querySelector repetido)
const elements = {
    tableBody: document.getElementById('productsTableBody'),
    productCount: document.getElementById('productCount'),
    statsGrid: document.getElementById('statsGrid'),
    emptyState: document.getElementById('emptyState'),
    searchInput: document.getElementById('adminSearch'),
    categoryFilter: document.getElementById('categoryFilter'),
    addProductBtn: document.getElementById('addProductBtn'),
    addFirstProductBtn: document.getElementById('addFirstProductBtn'),
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFile: document.getElementById('importFile'),
    modalOverlay: document.getElementById('modalOverlay'),
    productModal: document.getElementById('productModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalClose: document.getElementById('modalClose'),
    cancelBtn: document.getElementById('cancelBtn'),
    productForm: document.getElementById('productForm'),
    saveBtn: document.getElementById('saveBtn'),
    deleteModalOverlay: document.getElementById('deleteModalOverlay'),
    deleteModal: document.getElementById('deleteModal'),
    deleteProductName: document.getElementById('deleteProductName'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    previewImageBtn: document.getElementById('previewImageBtn'),
    removeImageBtn: document.getElementById('removeImageBtn'),
    imagePreview: document.getElementById('imagePreview'),
    previewImg: document.getElementById('previewImg'),
    previewCard: document.getElementById('previewCard'),
    previewCardImage: document.getElementById('previewCardImage'),
    previewCategory: document.getElementById('previewCategory'),
    previewName: document.getElementById('previewName'),
    previewDesc: document.getElementById('previewDesc'),
    previewPrice: document.getElementById('previewPrice'),
    previewRating: document.getElementById('previewRating'),
    previewBadge: document.getElementById('previewBadge'),
    // Campos del formulario (para preview en vivo y validación)
    productName: document.getElementById('productName'),
    productCategory: document.getElementById('productCategory'),
    productBadge: document.getElementById('productBadge'),
    productDescription: document.getElementById('productDescription'),
    productPrice: document.getElementById('productPrice'),
    productPriceDisplay: document.getElementById('productPriceDisplay'),
    productRating: document.getElementById('productRating'),
    productImage: document.getElementById('productImage')
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    renderAll();
    attachEventListeners();
    updatePreview();
});

// ============================================
// CARGA Y PERSISTENCIA
// ============================================
async function loadProducts() {
    try {
        // Primero intentar cargar desde localStorage (para edición offline)
        const stored = localStorage.getItem(ADMIN_CONFIG.storageKey);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                products = parsed;
                return;
            }
        }

        // Si no hay localStorage (o es inválido), cargar desde JSON
        const response = await fetch(ADMIN_CONFIG.jsonPath);
        if (!response.ok) throw new Error('No se pudo cargar productos.json');
        products = await response.json();
        saveToStorage();
    } catch (error) {
        console.error('Error cargando productos:', error);
        showToast('Error al cargar productos. Usando datos de ejemplo.', 'error');
        products = getDefaultProducts();
        saveToStorage();
    }
}

function saveToStorage() {
    try {
        localStorage.setItem(ADMIN_CONFIG.storageKey, JSON.stringify(products));
    } catch (e) {
        console.warn('No se pudo guardar en localStorage:', e);
    }
}

function getDefaultProducts() {
    return [
        { id: 1, nombre: "Pan Frances", categoria: "panes", descripcion: "Pan tradicional con corteza crujiente", precio: 0.25, precio_display: "4 x S/1", rating: 4.9, badge: "popular", imagen_url: "https://images.unsplash.com/photo-1635662279991-b7181585a72c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { id: 2, nombre: "Croissants de Mantequilla", categoria: "bolleria", descripcion: "Croissants franceses con capas de mantequilla", precio: 1.75, precio_display: "S/1.75", rating: 4.9, badge: "popular", imagen_url: "https://images.unsplash.com/photo-1555507036-ab794f4afe5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { id: 3, nombre: "Torta de Chocolate", categoria: "pasteles", descripcion: "Deliciosa torta de chocolate con ganache", precio: 25.00, precio_display: "S/25.00", rating: 5.0, badge: "popular", imagen_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
    ];
}

// ============================================
// RENDERIZADO
// ============================================
function renderAll() {
    applyFilters();
    renderTable();
    renderStats();
    updateProductCount();
    toggleEmptyState();
}

function applyFilters() {
    const search = elements.searchInput.value.toLowerCase().trim();
    const category = elements.categoryFilter.value;

    filteredProducts = products.filter(p => {
        const matchesSearch = !search ||
            (p.nombre || '').toLowerCase().includes(search) ||
            (p.descripcion || '').toLowerCase().includes(search) ||
            (p.categoria || '').toLowerCase().includes(search);

        const matchesCategory = category === 'todos' || p.categoria === category;

        return matchesSearch && matchesCategory;
    });
}

function renderTable() {
    const tbody = elements.tableBody;
    tbody.innerHTML = '';

    if (filteredProducts.length === 0) {
        return;
    }

    filteredProducts.forEach((product, index) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${index * 30}ms`;
        tr.classList.add('fade-in-row');
        tr.innerHTML = `
            <td class="cell-image">
                <img src="${esc(product.imagen_url)}" alt="${esc(product.nombre)}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%23d97706\\' stroke-width=\\'1.5\\'%3E%3Crect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/%3E%3Ccircle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/%3E%3Cpolyline points=\\'21 15 16 10 5 21\\'/%3E%3C/svg%3E'">
            </td>
            <td class="cell-name">${esc(product.nombre)}</td>
            <td class="cell-category ${esc(product.categoria)}">${esc(product.categoria)}</td>
            <td class="cell-price">${esc(product.precio_display)}</td>
            <td class="cell-rating">
                <div class="stars">${generateStarsHtml(product.rating)}</div>
                <span class="rating-value">${Number(product.rating || 0).toFixed(1)}</span>
            </td>
            <td class="cell-badge">
                ${product.badge ? `<span class="badge ${esc(product.badge)}">${esc(product.badge)}</span>` : ''}
            </td>
            <td class="cell-actions">
                <button class="action-btn edit" data-id="${product.id}" aria-label="Editar ${esc(product.nombre)}" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn delete" data-id="${product.id}" aria-label="Eliminar ${esc(product.nombre)}" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Event delegation: los click en los botones de acción se resuelven
    // por el listener único en tbody (attachEventListeners).
}

function generateStarsHtml(rating) {
    const fullStars = Math.round(Number(rating) || 0);
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += `<div class="star ${i >= fullStars ? 'empty' : ''}"></div>`;
    }
    return html;
}

function renderStats() {
    const stats = {
        total: products.length,
        panes: products.filter(p => p.categoria === 'panes').length,
        bolleria: products.filter(p => p.categoria === 'bolleria').length,
        pasteles: products.filter(p => p.categoria === 'pasteles').length
    };

    elements.statsGrid.innerHTML = `
        <div class="stat-card total">
            <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div class="stat-info">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Total Productos</div>
            </div>
        </div>
        <div class="stat-card panes">
            <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4a6 6 0 0 0 12 0 6 6 0 0 0-12 0"/><path d="M3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2"/><path d="M3 20a9 9 0 0 1 6-17"/></svg>
            </div>
            <div class="stat-info">
                <div class="stat-value">${stats.panes}</div>
                <div class="stat-label">Panes</div>
            </div>
        </div>
        <div class="stat-card bolleria">
            <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="12" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="16" y2="14"/></svg>
            </div>
            <div class="stat-info">
                <div class="stat-value">${stats.bolleria}</div>
                <div class="stat-label">Bollería</div>
            </div>
        </div>
        <div class="stat-card pasteles">
            <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <div class="stat-info">
                <div class="stat-value">${stats.pasteles}</div>
                <div class="stat-label">Pasteles</div>
            </div>
        </div>
    `;
}

function updateProductCount() {
    const total = products.length;
    const showing = filteredProducts.length;
    if (total === showing) {
        elements.productCount.textContent = `${total} producto${total !== 1 ? 's' : ''}`;
    } else {
        elements.productCount.textContent = `Mostrando ${showing} de ${total} productos`;
    }
}

function toggleEmptyState() {
    const hasProducts = products.length > 0;
    const hasFiltered = filteredProducts.length > 0;

    elements.emptyState.hidden = hasProducts || hasFiltered;
    elements.tableBody.parentElement.style.display = hasFiltered ? '' : 'none';
}

// ============================================
// MODAL PRODUCTO
// ============================================
function openAddModal() {
    currentEditId = null;
    elements.modalTitle.textContent = 'Nuevo Producto';
    resetForm();
    openModal();
}

function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    currentEditId = id;
    elements.modalTitle.textContent = 'Editar Producto';
    populateForm(product);
    openModal();
}

function openModal() {
    elements.modalOverlay.classList.add('active');
    elements.productModal.classList.add('active');
    elements.productModal.setAttribute('aria-hidden', 'false');
    elements.modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus al primer campo
    setTimeout(() => {
        elements.productName.focus();
    }, 100);
}

function closeModal() {
    elements.modalOverlay.classList.remove('active');
    elements.productModal.classList.remove('active');
    elements.productModal.setAttribute('aria-hidden', 'true');
    elements.modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentEditId = null;
}

function resetForm() {
    elements.productForm.reset();
    elements.imagePreview.hidden = true;
    elements.previewImg.src = '';
    updatePreview();
    clearErrors();
}

function populateForm(product) {
    elements.productName.value = product.nombre;
    elements.productCategory.value = product.categoria;
    elements.productBadge.value = product.badge || '';
    elements.productDescription.value = product.descripcion;
    elements.productPrice.value = product.precio;
    elements.productPriceDisplay.value = product.precio_display;
    elements.productRating.value = product.rating;
    elements.productImage.value = product.imagen_url;

    if (product.imagen_url) {
        elements.previewImg.src = product.imagen_url;
        elements.imagePreview.hidden = false;
    } else {
        elements.imagePreview.hidden = true;
    }

    updatePreview();
    clearErrors();
}

// ============================================
// PREVISUALIZACIÓN EN TIEMPO REAL (con debounce)
// ============================================
function updatePreview() {
    const name = elements.productName?.value || 'Nombre del producto';
    const category = elements.productCategory?.value;
    const desc = elements.productDescription?.value || 'Descripción del producto...';
    const priceDisplay = elements.productPriceDisplay?.value || 'S/0.00';
    const rating = parseFloat(elements.productRating?.value) || 0;
    const badge = elements.productBadge?.value;
    const imageUrl = elements.productImage?.value;

    // Solo actualizar si el valor cambió (evita re-renders innecesarios)
    if (elements.previewName.textContent !== name) elements.previewName.textContent = name;

    const catText = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Categoría';
    if (elements.previewCategory.textContent !== catText) elements.previewCategory.textContent = catText;

    if (elements.previewDesc.textContent !== desc) elements.previewDesc.textContent = desc;
    if (elements.previewPrice.textContent !== priceDisplay) elements.previewPrice.textContent = priceDisplay;

    // Rating stars - solo reconstruir si cambió el rating
    const fullStars = Math.round(rating);
    const currentStars = elements.previewRating.querySelectorAll('.star:not(.empty)').length;
    if (currentStars !== fullStars || elements.previewRating.querySelector('.rating-value')?.textContent !== rating.toFixed(1)) {
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            starsHtml += `<div class="star ${i >= fullStars ? 'empty' : ''}"></div>`;
        }
        starsHtml += `<span class="rating-value">${rating.toFixed(1)}</span>`;
        elements.previewRating.innerHTML = starsHtml;
    }

    // Badge
    if (badge) {
        if (elements.previewBadge.textContent !== badge || elements.previewBadge.className !== 'preview-badge ' + badge) {
            elements.previewBadge.textContent = badge;
            elements.previewBadge.className = 'preview-badge ' + badge;
            elements.previewBadge.hidden = false;
        }
    } else if (!elements.previewBadge.hidden) {
        elements.previewBadge.hidden = true;
    }

    // Image - solo actualizar si cambió la URL
    const currentBg = elements.previewCardImage.style.backgroundImage;
    const newBg = imageUrl ? `url('${imageUrl.replace(/['"()]/g, '')}')` : 'none';
    if (currentBg !== newBg) {
        elements.previewCardImage.style.backgroundImage = newBg;
    }
}

// ============================================
// VALIDACIÓN
// ============================================
function validateForm() {
    clearErrors();
    let isValid = true;

    const fields = [
        { el: elements.productName, required: true, message: 'El nombre es obligatorio' },
        { el: elements.productCategory, required: true, message: 'Selecciona una categoría' },
        { el: elements.productDescription, required: true, message: 'La descripción es obligatoria', minLength: 10 },
        { el: elements.productPrice, required: true, type: 'number', min: 0, message: 'Precio inválido' },
        { el: elements.productPriceDisplay, required: true, message: 'El precio a mostrar es obligatorio' },
        { el: elements.productRating, required: true, type: 'number', min: 0, max: 5, message: 'Rating debe ser entre 0 y 5' },
        { el: elements.productImage, required: true, type: 'url', message: 'URL de imagen inválida' }
    ];

    for (const rules of fields) {
        const field = rules.el;
        if (!field) continue;
        const value = field.value.trim();

        if (rules.required && !value) {
            showFieldError(field, rules.message);
            isValid = false;
            continue;
        }

        if (value) {
            if (rules.type === 'number') {
                const num = parseFloat(value);
                if (isNaN(num) || (rules.min !== undefined && num < rules.min) || (rules.max !== undefined && num > rules.max)) {
                    showFieldError(field, rules.message);
                    isValid = false;
                }
            }
            if (rules.type === 'url') {
                try {
                    new URL(value);
                } catch {
                    showFieldError(field, rules.message);
                    isValid = false;
                }
            }
            if (rules.minLength && value.length < rules.minLength) {
                showFieldError(field, `Mínimo ${rules.minLength} caracteres`);
                isValid = false;
            }
        }
    }

    return isValid;
}

function showFieldError(field, message) {
    field.style.borderColor = '#dc2626';
    const error = document.createElement('span');
    error.className = 'error-message';
    error.textContent = message;
    error.style.cssText = 'color: #dc2626; font-size: 0.75rem; margin-top: 0.25rem; display: block;';
    field.parentElement.appendChild(error);
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.remove());
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(f => {
        f.style.borderColor = '';
    });
}

// ============================================
// GUARDAR PRODUCTO
// ============================================
function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        const firstError = elements.productForm.querySelector('.error-message');
        if (firstError) {
            const field = firstError.previousElementSibling;
            if (field) field.focus();
        }
        return;
    }

    setSaving(true);

    const formData = {
        nombre: elements.productName.value.trim(),
        categoria: elements.productCategory.value,
        badge: elements.productBadge.value || null,
        descripcion: elements.productDescription.value.trim(),
        precio: parseFloat(elements.productPrice.value),
        precio_display: elements.productPriceDisplay.value.trim(),
        rating: parseFloat(elements.productRating.value),
        imagen_url: elements.productImage.value.trim()
    };

    try {
        if (currentEditId) {
            // Editar
            const index = products.findIndex(p => p.id === currentEditId);
            if (index !== -1) {
                products[index] = { ...products[index], ...formData };
                showToast('Producto actualizado correctamente');
            }
        } else {
            // Nuevo
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, ...formData });
            showToast('Producto creado correctamente');
        }

        saveToStorage();
        renderAll();
        closeModal();
    } catch (error) {
        console.error('Error guardando:', error);
        showToast('Error al guardar el producto', 'error');
    } finally {
        setSaving(false);
    }
}

function setSaving(isSaving) {
    const btnText = elements.saveBtn.querySelector('.btn-text');
    const btnLoader = elements.saveBtn.querySelector('.btn-loader');
    elements.saveBtn.disabled = isSaving;

    if (isSaving) {
        btnText.hidden = true;
        btnLoader.hidden = false;
    } else {
        btnText.hidden = false;
        btnLoader.hidden = true;
    }
}

// ============================================
// ELIMINAR PRODUCTO
// ============================================
function openDeleteModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    deleteTargetId = id;
    elements.deleteProductName.textContent = product.nombre;
    elements.deleteModalOverlay.classList.add('active');
    elements.deleteModal.classList.add('active');
    elements.deleteModal.setAttribute('aria-hidden', 'false');
    elements.deleteModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    elements.deleteModalOverlay.classList.remove('active');
    elements.deleteModal.classList.remove('active');
    elements.deleteModal.setAttribute('aria-hidden', 'true');
    elements.deleteModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    deleteTargetId = null;
}

function confirmDelete() {
    if (deleteTargetId !== null) {
        products = products.filter(p => p.id !== deleteTargetId);
        saveToStorage();
        renderAll();
        showToast('Producto eliminado');
    }
    closeDeleteModal();
}

// ============================================
// IMPORT / EXPORT
// ============================================
function exportJson() {
    const json = JSON.stringify(products, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON exportado correctamente');
}

// Normaliza y valida un array importado:
// - descarta productos sin datos esenciales
// - valida categorías contra las permitidas
// - elimina IDs duplicados (conserva el primero)
// - acota rating (0-5) y precio (>= 0)
function sanitizeImportedProducts(list) {
    const seen = new Set();
    const valid = [];

    for (const item of list) {
        const id = Number(item.id);
        if (!Number.isFinite(id) || !item.nombre || !item.categoria) continue;
        if (typeof item.precio !== 'number' || !Number.isFinite(item.precio)) continue;
        if (seen.has(id)) continue;

        const categoria = ADMIN_CONFIG.categories.includes(item.categoria) ? item.categoria : null;
        if (!categoria) continue;

        seen.add(id);

        const precio = Math.max(0, item.precio);
        const rating = Math.min(5, Math.max(0, Number(item.rating) || 0));

        valid.push({
            id,
            nombre: String(item.nombre).trim(),
            categoria,
            descripcion: String(item.descripcion || '').trim(),
            precio,
            precio_display: String(item.precio_display || '').trim() || `S/${precio.toFixed(2)}`,
            rating,
            badge: ['', 'popular', 'nuevo'].includes(item.badge) ? item.badge : null,
            imagen_url: String(item.imagen_url || '').trim()
        });
    }

    return valid;
}

async function importJsonFromFile(file) {
    const text = await file.text();
    const imported = JSON.parse(text);

    if (!Array.isArray(imported)) {
        throw new Error('El JSON debe ser un array de productos');
    }

    const validProducts = sanitizeImportedProducts(imported);

    if (validProducts.length !== imported.length) {
        showToast(
            `${imported.length - validProducts.length} producto(s) con estructura inválida fueron omitidos (IDs duplicados, categoría no válida o datos incompletos).`,
            'error'
        );
    }

    if (validProducts.length === 0) {
        showToast('Ningún producto válido en el archivo.', 'error');
        elements.importFile.value = '';
        return;
    }

    products = validProducts;
    saveToStorage();
    renderAll();
    showToast(`${validProducts.length} productos importados`);
}

// ============================================
// IMAGEN PREVIEW
// ============================================
function previewExternalImage() {
    const url = elements.productImage.value.trim();
    if (url) {
        elements.previewImg.src = url;
        elements.imagePreview.hidden = false;
        elements.previewImg.onload = () => showToast('Imagen cargada');
        elements.previewImg.onerror = () => {
            showToast('No se pudo cargar la imagen', 'error');
            elements.imagePreview.hidden = true;
        };
    }
}

function removeImage() {
    elements.productImage.value = '';
    elements.imagePreview.hidden = true;
    elements.previewImg.src = '';
    updatePreview();
}

// ============================================
// EVENT LISTENERS
// ============================================
function attachEventListeners() {
    // Botones de abrir modal
    elements.addProductBtn.addEventListener('click', openAddModal);
    elements.addFirstProductBtn.addEventListener('click', openAddModal);

    // Cerrar modales
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.deleteModalOverlay.addEventListener('click', closeDeleteModal);

    // Guardar / eliminar
    elements.productForm.addEventListener('submit', handleFormSubmit);
    elements.confirmDeleteBtn.addEventListener('click', confirmDelete);

    // Import / Export
    elements.exportBtn.addEventListener('click', exportJson);
    elements.importBtn.addEventListener('click', () => elements.importFile.click());
    elements.importFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            await importJsonFromFile(file);
        } catch (error) {
            console.error('Error importando:', error);
            showToast('Error al importar: ' + error.message, 'error');
        } finally {
            elements.importFile.value = '';
        }
    });

    // Imagen preview
    elements.previewImageBtn.addEventListener('click', previewExternalImage);
    elements.removeImageBtn.addEventListener('click', removeImage);

    // Escape key cierra modales (en este orden: producto, luego eliminar)
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (elements.productModal.classList.contains('active')) {
            closeModal();
        } else if (elements.deleteModal.classList.contains('active')) {
            closeDeleteModal();
        }
    });

    // Filtros con debounce
    const searchDebounced = debounce(() => renderAll(), 150);
    elements.searchInput.addEventListener('input', searchDebounced);
    elements.categoryFilter.addEventListener('change', renderAll);

    // Event delegation para acciones de fila (un solo listener global)
    elements.tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.action-btn');
        if (!btn || !elements.tableBody.contains(btn)) return;
        const id = parseInt(btn.dataset.id, 10);
        if (!Number.isFinite(id)) return;

        if (btn.classList.contains('edit')) {
            openEditModal(id);
        } else if (btn.classList.contains('delete')) {
            openDeleteModal(id);
        }
    });

    // Preview en vivo con debounce (input) y cambio inmediato (selects)
    const previewDebounced = debounce(updatePreview, 80);
    const previewInputs = [
        elements.productName,
        elements.productDescription,
        elements.productPriceDisplay,
        elements.productRating,
        elements.productImage
    ];
    const previewSelects = [elements.productCategory, elements.productBadge];

    previewInputs.forEach(el => el && el.addEventListener('input', previewDebounced));
    previewSelects.forEach(el => el && el.addEventListener('change', updatePreview));
}

// ============================================
// API DE DEBUG (consola)
// ============================================
window.adminPanel = {
    getProducts: () => products,
    exportJson: () => JSON.stringify(products, null, 2),
    importJson: (json) => {
        products = sanitizeImportedProducts(JSON.parse(json));
        saveToStorage();
        renderAll();
    },
    reset: () => {
        products = getDefaultProducts();
        saveToStorage();
        renderAll();
    }
};