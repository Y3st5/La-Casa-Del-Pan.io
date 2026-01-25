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
let cart = [];
let cartCount = 0;
let cartTotal = 0;

// DOM elements
const cartButton = document.getElementById('cartButton');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartCountElement = document.getElementById('cartCount');
const cartItemsElement = document.getElementById('cartItems');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');

// Filter functionality
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
const categorySection = document.querySelectorAll('.category-section');
const searchInput = document.getElementById('searchInput');

// Add to cart functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = parseFloat(this.dataset.price);
        const image = this.dataset.image;

        addToCart({ id, name, price, image });
    });
});

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
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
        updateCartUI();
    }
}
window.updateQuantity = updateQuantity;

function updateCartUI() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    cartCountElement.textContent = cartCount;
    subtotalElement.textContent = `$${cartTotal.toFixed(2)}`;
    totalElement.textContent = `$${(cartTotal + 2).toFixed(2)}`;
    
    // Update cart items display
    cartItemsElement.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Tu carrito está vacío</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', parseInt(this.value))">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button class="quantity-btn" onclick="removeFromCart('${item.id}')" style="margin-left: 0.5rem; color: #dc2626;">🗑️</button>
                    </div>
                </div>
            `;
            cartItemsElement.appendChild(cartItem);
        });
    }
}

// Cart sidebar toggle
cartButton.addEventListener('click', () => {
    cartSidebar.classList.add('open');
});

closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
});

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
        cartSidebar.classList.remove('open');
    }
});

// Filter functionality
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        const category = this.dataset.category;
        
        // Update active filter button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Filter products
        if (category === 'todos') {
            categorySection.forEach(section => section.style.display = 'block');
        } else {
            categorySection.forEach(section => {
                if (section.dataset.category === category) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }
    });
});

// Search functionality
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    productCards.forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        const description = card.querySelector('.product-description').textContent.toLowerCase();
        const category = card.querySelector('.product-category').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide category sections based on visible products
    categorySection.forEach(section => {
        const visibleProducts = section.querySelectorAll('.product-card[style*="block"], .product-card:not([style*="none"])');
        if (visibleProducts.length > 0) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
});

// Initialize cart
updateCartUI();
