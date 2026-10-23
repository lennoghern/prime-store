// ==========================================
// Prime Store - Main Application
// ==========================================

import { router } from './router.js';
import { cart } from './cart.js';
import { icons } from './icons.js';
import {
  products,
  categories,
  formatPrice,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  getProductById,
} from './data.js';

// ==========================================
// DOM References
// ==========================================
const app = document.getElementById('app');
const cartToggle = document.getElementById('cart-toggle');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartBadge = document.getElementById('cart-badge');
const cartTotalAmount = document.getElementById('cart-total-amount');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart-btn');
const searchBtn = document.getElementById('search-btn');
const searchBox = document.getElementById('search-box');
const searchInput = document.getElementById('search-input');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mainNav = document.getElementById('main-nav');
const header = document.getElementById('main-header');
const flyingItem = document.getElementById('flying-item');
const toastContainer = document.getElementById('toast-container');

// ==========================================
// Initialize
// ==========================================
function init() {
  setupEventListeners();
  setupCartListeners();
  setupRoutes();
  updateCartUI();
  handleScroll();
}

// ==========================================
// Event Listeners
// ==========================================
function setupEventListeners() {
  // Cart toggle
  cartToggle.addEventListener('click', toggleCart);
  cartOverlay.addEventListener('click', closeCart);
  cartClose.addEventListener('click', closeCart);

  // Checkout button
  checkoutBtn.addEventListener('click', () => {
    closeCart();
    router.navigate('/checkout');
  });

  // Clear cart
  clearCartBtn.addEventListener('click', () => {
    cart.clear();
    showToast('Carrito vaciado', icons.trash(18));
  });

  // Search
  searchBtn.addEventListener('click', () => {
    searchBox.classList.toggle('active');
    if (searchBox.classList.contains('active')) {
      searchInput.focus();
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      searchBox.classList.remove('active');
      router.navigate(`/tienda?q=${encodeURIComponent(searchInput.value.trim())}`);
      searchInput.value = '';
    }
    if (e.key === 'Escape') {
      searchBox.classList.remove('active');
      searchInput.value = '';
    }
  });

  // Mobile menu
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mainNav.classList.toggle('active');
  });

  // Close mobile menu on nav link click
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      mainNav.classList.remove('active');
    });
  });

  // Scroll handler
  window.addEventListener('scroll', handleScroll);

  // Close search on outside click
  document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target)) {
      searchBox.classList.remove('active');
    }
  });
}

function handleScroll() {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// ==========================================
// Cart UI
// ==========================================
function setupCartListeners() {
  cart.onChange((items, total, count) => {
    updateCartUI();
  });
}

function updateCartUI() {
  const items = cart.getItems();
  const count = cart.getCount();
  const total = cart.getTotal();

  // Badge
  cartBadge.textContent = count;
  cartBadge.classList.toggle('empty', count === 0);

  // Total
  cartTotalAmount.textContent = formatPrice(total);

  // Items
  if (items.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <img src="/assets/images/mascot-crouch.png" alt="Prime Bear" class="cart-empty-mascot" />
        <p>Tu carrito está vacío</p>
        <p class="cart-empty-sub">¡El oso Prime te espera con los mejores accesorios tech!</p>
        <a href="#/tienda" class="btn btn-primary btn-sm" onclick="document.getElementById('cart-close').click()">Ver Catálogo</a>
      </div>
    `;
    return;
  }

  cartItemsEl.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.classList.add('img-fallback'); this.src=''; this.textContent='📦';" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price ? formatPrice(item.price) : item.priceRange}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-action="remove" data-id="${item.id}" aria-label="Eliminar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    </div>
  `).join('');

  // Bind cart item events
  cartItemsEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === 'increase') {
        const item = items.find(i => i.id === id);
        if (item) cart.updateQuantity(id, item.quantity + 1);
      } else if (action === 'decrease') {
        const item = items.find(i => i.id === id);
        if (item) cart.updateQuantity(id, item.quantity - 1);
      } else if (action === 'remove') {
        cart.remove(id);
        showToast('Producto eliminado', icons.trash(18));
      }
    });
  });
}

function toggleCart() {
  cartSidebar.classList.toggle('active');
  cartOverlay.classList.toggle('active');
  document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
}

function closeCart() {
  cartSidebar.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ==========================================
// Add to Cart Animation
// ==========================================
function addToCartWithAnimation(product, buttonEl) {
  cart.add(product);

  // Badge bounce
  cartBadge.classList.remove('bounce');
  void cartBadge.offsetWidth;
  cartBadge.classList.add('bounce');

  // Flying animation
  const imgEl = buttonEl.closest('.product-card')?.querySelector('.product-card-image img');
  if (imgEl) {
    const imgRect = imgEl.getBoundingClientRect();
    const cartRect = cartToggle.getBoundingClientRect();

    flyingItem.style.backgroundImage = `url(${product.image})`;
    flyingItem.style.backgroundSize = 'cover';
    flyingItem.style.backgroundPosition = 'center';
    flyingItem.style.left = imgRect.left + imgRect.width / 2 - 25 + 'px';
    flyingItem.style.top = imgRect.top + imgRect.height / 2 - 25 + 'px';
    flyingItem.style.transform = 'scale(1)';
    flyingItem.style.opacity = '1';
    flyingItem.style.transition = 'none';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flyingItem.style.transition = 'all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)';
        flyingItem.style.left = cartRect.left + cartRect.width / 2 - 25 + 'px';
        flyingItem.style.top = cartRect.top + cartRect.height / 2 - 25 + 'px';
        flyingItem.style.transform = 'scale(0.1)';
        flyingItem.style.opacity = '0';
      });
    });

    setTimeout(() => {
      flyingItem.style.opacity = '0';
    }, 800);
  }

  showToast(`${product.name} agregado al carrito`, icons.check(18));
}

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, icon = null) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  const iconHtml = icon || icons.check(18);
  toast.innerHTML = `<span style="display:inline-flex;align-items:center;">${iconHtml}</span> ${message}`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ==========================================
// Product Card Component
// ==========================================
function renderProductCard(product) {
  const cat = categories.find(c => c.id === product.category);
  const catIcon = cat && icons[cat.iconKey] ? icons[cat.iconKey](14) : icons.package(14);
  const priceDisplay = product.price
    ? formatPrice(product.price)
    : `<span class="product-card-price-range">${product.priceRange}</span>`;

  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-card-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy"
          onerror="this.parentElement.classList.add('img-fallback'); this.style.display='none'; this.parentElement.innerHTML='<span style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:var(--primary);\\'>${cat && icons[cat.iconKey] ? icons[cat.iconKey](48) : icons.package(48)}</span>'" />
        ${product.featured ? `<span class="product-card-badge">${icons.star(12)} Destacado</span>` : ''}
      </div>
      <div class="product-card-body">
        <div class="product-card-category" style="display:flex;align-items:center;gap:6px;">${catIcon} ${cat ? cat.name : ''}</div>
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-desc">${product.description}</div>
        <div class="product-card-footer">
          <div class="product-card-price">${priceDisplay}</div>
          <button class="btn-add-cart" data-add-cart="${product.id}">
            ${icons.cart(16)} Agregar
          </button>
        </div>
      </div>
    </div>
  `;
}

function showProductModal(product) {
  const cat = categories.find(c => c.id === product.category);
  const catIcon = cat && icons[cat.iconKey] ? icons[cat.iconKey](16) : icons.package(16);
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="product-modal">
      <button class="product-modal-close" id="modal-close">&times;</button>
      <div class="product-modal-img">
        <img src="${product.image}" alt="${product.name}" onerror="this.parentElement.innerHTML='<span style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:var(--primary);\\'>${cat && icons[cat.iconKey] ? icons[cat.iconKey](64) : icons.package(64)}</span>'" />
      </div>
      <div class="product-modal-info">
        <span class="product-modal-category" style="display:flex;align-items:center;gap:6px;">${catIcon} ${cat ? cat.name : ''}</span>
        <h2 class="product-modal-title">${product.name}</h2>
        <div class="product-modal-price">${product.price ? formatPrice(product.price) : product.priceRange}</div>
        <p class="product-modal-desc">${product.description}</p>
        <div class="product-modal-tags">
          ${product.tags.map(t => `<span class="product-modal-tag">#${t}</span>`).join('')}
        </div>
        <button class="btn btn-primary btn-block" id="modal-add-btn" style="margin-top: auto;">
          ${icons.cart(18)} Agregar al Carrito
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  const addBtn = modal.querySelector('#modal-add-btn');
  addBtn.addEventListener('click', () => {
    cart.add(product);
    showToast(`${product.name} agregado al carrito`, icons.check(18));
    cartBadge.classList.remove('bounce');
    void cartBadge.offsetWidth;
    cartBadge.classList.add('bounce');
    modal.remove();
  });
}

function bindProductInteractions(container) {
  // Add to cart buttons
  container.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productId = parseInt(btn.dataset.addCart);
      const product = getProductById(productId);
      if (product) {
        addToCartWithAnimation(product, btn);
      }
    });
  });

  // Card click for quick view
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-add-cart]')) return;
      const id = parseInt(card.dataset.productId);
      const product = getProductById(id);
      if (product) showProductModal(product);
    });
  });
}

// ==========================================
// PAGES
// ==========================================

// ---------- HOME PAGE ----------
function renderHomePage() {
  const featured = getFeaturedProducts().slice(0, 8);

  app.innerHTML = `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-particles" id="hero-particles"></div>
      <div class="container hero-inner">
        <div class="hero-content">
          <div class="hero-badge">${icons.award(16)} Tu tienda tech de confianza</div>
          <h1>Todo lo que tu <span>dispositivo</span> necesita</h1>
          <p class="hero-desc">Descubre los mejores accesorios y gadgets tecnológicos. Calidad premium a precios increíbles. Envíos a todo Colombia.</p>
          <div class="hero-actions">
            <a href="#/tienda" class="btn btn-white">${icons.store(18)} Ver Tienda</a>
            <a href="#/tienda/audio" class="btn btn-outline" style="color: white; border-color: rgba(255,255,255,0.3);">${icons.headphones(18)} Audio</a>
          </div>
        </div>
        <div class="hero-mascot">
          <div class="mascot-badge-pill">🐻 ¡Tu experto tech favorito!</div>
          <img src="/assets/images/mascot-standing.png" alt="Prime Store Mascota" />
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div class="section-badge">${icons.grid(14)} Explora</div>
          <h2 class="section-title">Nuestras Categorías</h2>
          <p class="section-subtitle">Encuentra todo lo que necesitas organizado para ti</p>
        </div>
        <div class="categories-grid">
          ${categories.map(cat => {
            const count = getProductsByCategory(cat.id).length;
            const catSvg = icons[cat.iconKey] ? icons[cat.iconKey](28) : icons.package(28);
            return `
              <a href="#/tienda/${cat.id}" class="category-card" style="--cat-color: ${cat.color}">
                <span class="category-icon" style="color: ${cat.color}">${catSvg}</span>
                <div class="category-name">${cat.name}</div>
                <div class="category-count">${count} productos</div>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section class="section" style="background: white;">
      <div class="container">
        <div class="section-header">
          <div class="section-badge">${icons.star(14)} Lo Mejor</div>
          <h2 class="section-title">Productos Destacados</h2>
          <p class="section-subtitle">Los más vendidos y mejor valorados de nuestra tienda</p>
        </div>
        <div class="products-grid">
          ${featured.map(p => renderProductCard(p)).join('')}
        </div>
        <div style="text-align: center; margin-top: 40px;">
          <a href="#/tienda" class="btn btn-primary">Ver todos los productos ${icons.arrowRight(16)}</a>
        </div>
      </div>
    </section>

    <!-- PROMO BANNER -->
    <section class="section">
      <div class="container">
        <div class="promo-banner">
          <div class="promo-content">
            <h2>${icons.flame(24)} Accesorios para tu iPhone</h2>
            <p>Descubre nuestra línea completa de accesorios compatibles con todo el ecosistema Apple. Desde cargadores hasta fundas premium.</p>
            <a href="#/tienda/apple" class="btn btn-white">Explorar Apple ${icons.arrowRight(16)}</a>
          </div>
          <div class="promo-mascot">
            <img src="/assets/images/mascot-lying.png" alt="Prime Store Mascota" />
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="section" style="background: white;">
      <div class="container">
        <div class="section-header">
          <div class="section-badge">${icons.sparkles(14)} Por qué elegirnos</div>
          <h2 class="section-title">La Experiencia Prime</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-mascot-container">
              <img src="/assets/images/mascot-running.png" alt="Envío Rápido" class="feature-mascot-img" />
            </div>
            <div class="feature-title">Envío Rápido</div>
            <div class="feature-desc">Envíos a toda Colombia. Tu pedido llega en tiempo récord a la puerta de tu casa.</div>
          </div>
          <div class="feature-card">
            <div class="feature-mascot-container">
              <img src="/assets/images/mascot-standing.png" alt="Calidad Garantizada" class="feature-mascot-img" />
            </div>
            <div class="feature-title">Calidad Garantizada</div>
            <div class="feature-desc">Todos nuestros productos pasan por control de calidad. Garantía en cada compra.</div>
          </div>
          <div class="feature-card">
            <div class="feature-mascot-container">
              <img src="/assets/images/mascot-crouch.png" alt="Atención 24/7" class="feature-mascot-img" />
            </div>
            <div class="feature-title">Atención 24/7</div>
            <div class="feature-desc">Escríbenos por WhatsApp cuando quieras. Siempre estamos para ayudarte.</div>
          </div>
          <div class="feature-card">
            <div class="feature-mascot-container">
              <img src="/assets/images/mascot-lying.png" alt="Mejores Precios" class="feature-mascot-img" />
            </div>
            <div class="feature-title">Mejores Precios</div>
            <div class="feature-desc">Precios competitivos sin comprometer la calidad. Los mejores accesorios tech.</div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Bind interactions
  bindProductInteractions(app);

  // Create particles
  createParticles();

  // Update active nav
  updateActiveNav('/');
}

// ---------- STORE PAGE ----------
function renderStorePage(params) {
  const categoryFilter = params[0] || null;
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const searchQuery = urlParams.get('q') || '';

  let filteredProducts = [...products];
  let activeCategory = null;

  if (categoryFilter) {
    filteredProducts = getProductsByCategory(categoryFilter);
    activeCategory = categories.find(c => c.id === categoryFilter);
  }

  if (searchQuery) {
    filteredProducts = searchProducts(searchQuery);
  }

  const activeCatSvg = activeCategory && icons[activeCategory.iconKey] ? icons[activeCategory.iconKey](26) : '';
  const heroTitle = activeCategory
    ? `<span style="display:inline-flex;align-items:center;gap:10px;"><span style="color:${activeCategory.color}">${activeCatSvg}</span> ${activeCategory.name}</span>`
    : searchQuery
      ? `<span style="display:inline-flex;align-items:center;gap:10px;">${icons.search(24)} Resultados para "${searchQuery}"</span>`
      : `<span style="display:inline-flex;align-items:center;gap:10px;">${icons.store(24)} Nuestra Tienda</span>`;

  const heroDesc = activeCategory
    ? activeCategory.description
    : `${filteredProducts.length} productos disponibles para ti`;

  app.innerHTML = `
    <div class="store-hero">
      <div class="container">
        <h1>${heroTitle}</h1>
        <p>${heroDesc}</p>
      </div>
    </div>
    <div class="container">
      <div class="store-layout">
        <aside class="store-sidebar">
          <div class="filter-section">
            <div class="filter-title">Categorías</div>
            <a href="#/tienda" class="filter-option ${!categoryFilter ? 'active' : ''}">
              <span class="filter-option-icon">${icons.layers(16)}</span>
              Todos
              <span class="filter-option-count">${products.length}</span>
            </a>
            ${categories.map(cat => {
              const count = getProductsByCategory(cat.id).length;
              const catSvg = icons[cat.iconKey] ? icons[cat.iconKey](16) : icons.package(16);
              return `
                <a href="#/tienda/${cat.id}" class="filter-option ${categoryFilter === cat.id ? 'active' : ''}">
                  <span class="filter-option-icon" style="color: ${cat.color}">${catSvg}</span>
                  ${cat.name}
                  <span class="filter-option-count">${count}</span>
                </a>
              `;
            }).join('')}
          </div>

          <div class="filter-section">
            <div class="filter-title">Precio</div>
            <div class="filter-option" data-sort="low">${icons.sortAsc(16)} Menor a mayor</div>
            <div class="filter-option" data-sort="high">${icons.sortDesc(16)} Mayor a menor</div>
          </div>
        </aside>

        <div class="store-main">
          <div class="store-search-inline">
            <input type="text" class="store-search-input" id="store-search" placeholder="Buscar en ${activeCategory ? activeCategory.name : 'toda la tienda'}..." value="${searchQuery}" />
          </div>

          <div class="store-controls">
            <div class="store-count">Mostrando <strong id="visible-count">${filteredProducts.length}</strong> productos</div>
            <select class="store-sort" id="store-sort">
              <option value="default">Ordenar por</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>
          </div>

          <div class="products-grid" id="products-grid">
            ${filteredProducts.map(p => renderProductCard(p)).join('')}
          </div>

          ${filteredProducts.length === 0 ? `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
              <div style="margin-bottom: 16px; color: var(--text-muted);">${icons.search(48)}</div>
              <h3>No encontramos productos</h3>
              <p>Intenta con otra búsqueda o categoría</p>
              <a href="#/tienda" class="btn btn-primary" style="margin-top: 20px;">Ver todos ${icons.arrowRight(16)}</a>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Bind events
  bindProductInteractions(app);
  setupStoreEvents(categoryFilter);
  
  // Update navbar active state correctly
  if (categoryFilter) {
    updateActiveNav(`/tienda/${categoryFilter}`);
  } else {
    updateActiveNav('/tienda');
  }
}

function setupStoreEvents(categoryFilter) {
  const storeSearch = document.getElementById('store-search');
  const storeSortEl = document.getElementById('store-sort');
  const productsGrid = document.getElementById('products-grid');
  const visibleCountEl = document.getElementById('visible-count');

  let currentProducts = categoryFilter
    ? getProductsByCategory(categoryFilter)
    : [...products];

  // Search
  if (storeSearch) {
    storeSearch.addEventListener('input', () => {
      const q = storeSearch.value.trim().toLowerCase();
      let filtered = categoryFilter
        ? getProductsByCategory(categoryFilter)
        : [...products];

      if (q) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }

      currentProducts = filtered;
      applySortAndRender();
    });
  }

  // Sort
  if (storeSortEl) {
    storeSortEl.addEventListener('change', () => {
      applySortAndRender();
    });
  }

  // Price filter from sidebar
  document.querySelectorAll('[data-sort]').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.sort === 'low') {
        storeSortEl.value = 'price-asc';
      } else if (el.dataset.sort === 'high') {
        storeSortEl.value = 'price-desc';
      }
      applySortAndRender();
    });
  });

  function applySortAndRender() {
    const sortValue = storeSortEl ? storeSortEl.value : 'default';
    let sorted = [...currentProducts];

    switch (sortValue) {
      case 'price-asc':
        sorted.sort((a, b) => (a.price || 999999) - (b.price || 999999));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    productsGrid.innerHTML = sorted.map(p => renderProductCard(p)).join('');
    if (visibleCountEl) visibleCountEl.textContent = sorted.length;
    bindProductInteractions(productsGrid);
  }
}

// ---------- CHECKOUT PAGE ----------
function renderCheckoutPage() {
  const items = cart.getItems();
  const total = cart.getTotal();

  if (items.length === 0) {
    app.innerHTML = `
      <div class="checkout-page">
        <div class="container" style="text-align: center; padding: 100px 20px;">
          <div style="margin-bottom: 24px; color: var(--text-muted);">${icons.cart(64)}</div>
          <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 12px;">Tu carrito está vacío</h2>
          <p style="color: var(--text-secondary); margin-bottom: 32px;">Agrega productos antes de ir al checkout.</p>
          <a href="#/tienda" class="btn btn-primary">Ir a la tienda ${icons.arrowRight(16)}</a>
        </div>
      </div>
    `;
    updateActiveNav('/checkout');
    return;
  }

  app.innerHTML = `
    <div class="checkout-page">
      <div class="container">
        <h1 style="font-size: 2rem; font-weight: 900; margin-bottom: 32px; display:flex; align-items:center; gap:12px;">
          ${icons.receipt(26)} Finalizar Compra
        </h1>
        <div class="checkout-grid">
          <div>
            <!-- Información Personal -->
            <div class="checkout-form-section" style="margin-bottom: 24px;">
              <h2 style="display:flex;align-items:center;gap:8px;">${icons.user(18)} Información de Contacto</h2>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="checkout-name">Nombre completo</label>
                  <input type="text" class="form-input" id="checkout-name" placeholder="Tu nombre" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="checkout-phone">Teléfono / WhatsApp</label>
                  <input type="tel" class="form-input" id="checkout-phone" placeholder="+57 300 000 0000" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="checkout-email">Correo electrónico</label>
                <input type="email" class="form-input" id="checkout-email" placeholder="tu@email.com" />
              </div>
            </div>

            <!-- Dirección de Envío -->
            <div class="checkout-form-section" style="margin-bottom: 24px;">
              <h2 style="display:flex;align-items:center;gap:8px;">${icons.mapPin(18)} Dirección de Envío</h2>
              <div class="form-group">
                <label class="form-label" for="checkout-address">Dirección</label>
                <input type="text" class="form-input" id="checkout-address" placeholder="Calle, carrera, número" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="checkout-city">Ciudad</label>
                  <input type="text" class="form-input" id="checkout-city" placeholder="Tu ciudad" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="checkout-dept">Departamento</label>
                  <select class="form-select" id="checkout-dept">
                    <option value="">Seleccionar</option>
                    <option>Amazonas</option><option>Antioquia</option>
                    <option>Arauca</option><option>Atlántico</option>
                    <option>Bogotá D.C.</option><option>Bolívar</option>
                    <option>Boyacá</option><option>Caldas</option>
                    <option>Caquetá</option><option>Casanare</option>
                    <option>Cauca</option><option>Cesar</option>
                    <option>Chocó</option><option>Córdoba</option>
                    <option>Cundinamarca</option><option>Guainía</option>
                    <option>Guaviare</option><option>Huila</option>
                    <option>La Guajira</option><option>Magdalena</option>
                    <option>Meta</option><option>Nariño</option>
                    <option>Norte de Santander</option><option>Putumayo</option>
                    <option>Quindío</option><option>Risaralda</option>
                    <option>San Andrés</option><option>Santander</option>
                    <option>Sucre</option><option>Tolima</option>
                    <option>Valle del Cauca</option><option>Vaupés</option>
                    <option>Vichada</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="checkout-notes">Notas adicionales (opcional)</label>
                <textarea class="form-textarea form-input" id="checkout-notes" rows="3" placeholder="Instrucciones especiales para la entrega..."></textarea>
              </div>
            </div>

            <!-- Método de Pago -->
            <div class="checkout-form-section">
              <h2 style="display:flex;align-items:center;gap:8px;">${icons.creditCard(18)} Método de Pago</h2>
              <div class="payment-methods" id="payment-methods">
                <div class="payment-method active" data-method="nequi">
                  <span class="payment-method-icon">${icons.smartphone(20)}</span>
                  Nequi
                </div>
                <div class="payment-method" data-method="daviplata">
                  <span class="payment-method-icon">${icons.wallet(20)}</span>
                  Daviplata
                </div>
                <div class="payment-method" data-method="transferencia">
                  <span class="payment-method-icon">${icons.bank(20)}</span>
                  Transferencia
                </div>
                <div class="payment-method" data-method="contraentrega">
                  <span class="payment-method-icon">${icons.package(20)}</span>
                  Contra entrega
                </div>
                <div class="payment-method" data-method="efectivo">
                  <span class="payment-method-icon">${icons.dollarSign(20)}</span>
                  Efectivo
                </div>
                <div class="payment-method" data-method="pse">
                  <span class="payment-method-icon">${icons.lock(20)}</span>
                  PSE
                </div>
              </div>
              <button class="btn btn-primary btn-block" id="place-order-btn" style="padding: 16px; font-size: 1rem;">
                ${icons.check(18)} Confirmar Pedido
              </button>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="order-summary">
            <div class="order-summary-card">
              <h3 style="display:flex;align-items:center;gap:8px;">${icons.receipt(18)} Resumen del Pedido</h3>
              ${items.map(item => `
                <div class="order-item">
                  <img src="${item.image}" alt="${item.name}" class="order-item-img"
                    onerror="this.style.background='var(--bg)'; this.src=''" />
                  <div class="order-item-info">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-qty">Cantidad: ${item.quantity}</div>
                  </div>
                  <div class="order-item-price">${item.price ? formatPrice(item.price * item.quantity) : item.priceRange}</div>
                </div>
              `).join('')}
              <div class="order-totals">
                <div class="order-total-row">
                  <span>Subtotal</span>
                  <span>${formatPrice(total)}</span>
                </div>
                <div class="order-total-row">
                  <span>Envío</span>
                  <span style="color: var(--success);">Por confirmar</span>
                </div>
                <div class="order-total-row total">
                  <span>Total</span>
                  <span>${formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Payment method selection
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', () => {
      document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
      method.classList.add('active');
    });
  });

  // Place order
  document.getElementById('place-order-btn').addEventListener('click', () => {
    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    const city = document.getElementById('checkout-city').value.trim();
    const dept = document.getElementById('checkout-dept').value.trim();
    const activeMethod = document.querySelector('.payment-method.active')?.dataset.method || 'Nequi';

    if (!name || !phone) {
      showToast('Por favor completa tu nombre y teléfono', icons.alertCircle(18));
      return;
    }

    const orderData = {
      name,
      phone,
      address: address || 'Por acordar',
      city: city || 'Bogotá',
      dept: dept || 'Cundinamarca',
      payment: activeMethod,
      items: cart.getItems(),
      total: cart.getTotal(),
    };

    showSuccessModal(orderData);
  });

  updateActiveNav('/checkout');
}

// ---------- SUCCESS MODAL ----------
function showSuccessModal(orderData) {
  const modal = document.createElement('div');
  modal.className = 'success-modal-overlay';

  const itemsText = (orderData.items || []).map(i => `• ${i.name} x${i.quantity} (${formatPrice(i.price * i.quantity)})`).join('%0A');
  const waMsg = `¡Hola Prime Store! 🐻 He realizado un pedido en la tienda:%0A%0A*Cliente:* ${encodeURIComponent(orderData.name)}%0A*Teléfono:* ${encodeURIComponent(orderData.phone)}%0A*Ciudad:* ${encodeURIComponent(orderData.city + (orderData.dept ? ', ' + orderData.dept : ''))}%0A*Dirección:* ${encodeURIComponent(orderData.address)}%0A*Método de Pago:* ${encodeURIComponent(orderData.payment.toUpperCase())}%0A%0A*Productos:*%0A${itemsText}%0A%0A*Total:* ${encodeURIComponent(formatPrice(orderData.total))}`;
  const waLink = `https://wa.me/573001234567?text=${waMsg}`;

  modal.innerHTML = `
    <div class="success-modal">
      <img src="/assets/images/mascot-standing.png" alt="Prime Bear" class="success-mascot-img" />
      <h2>¡Pedido Realizado!</h2>
      <p>¡Gracias por tu compra, <strong>${orderData.name}</strong>! Tu pedido por un total de <strong>${formatPrice(orderData.total)}</strong> ha sido registrado.</p>
      <div class="success-actions">
        <a href="${waLink}" target="_blank" class="btn btn-whatsapp">
          ${icons.whatsapp(20)} Enviar Confirmación por WhatsApp
        </a>
        <button class="btn btn-outline" id="success-close">Volver al Inicio</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#success-close').addEventListener('click', () => {
    cart.clear();
    modal.remove();
    router.navigate('/');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      cart.clear();
      modal.remove();
      router.navigate('/');
    }
  });
}

// ==========================================
// ROUTING
// ==========================================
function setupRoutes() {
  router
    .on('/', () => renderHomePage())
    .on('/tienda', (params) => renderStorePage(params))
    .on('/checkout', () => renderCheckoutPage());
}

// ==========================================
// UTILITIES
// ==========================================
function updateActiveNav(route) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkRoute = link.dataset.route;
    link.classList.toggle('active', linkRoute === route);
  });
}

function createParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.width = Math.random() * 4 + 2 + 'px';
    particle.style.height = particle.style.width;
    particle.style.animationDuration = Math.random() * 15 + 10 + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    container.appendChild(particle);
  }
}

// ==========================================
// BOOT
// ==========================================
init();
