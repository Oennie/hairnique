/* ── HAIRNIQUE cart.js ────────────────────────────────────────────────
   Shared utilities included by every page (except admin.html)
   Provides: Supabase client, cart CRUD, security helpers, nav init,
             toast, scroll animations, SVG icons, image helpers
   ──────────────────────────────────────────────────────────────────── */

// ── SUPABASE ──────────────────────────────────────────────────────────
const SUPA_URL = 'https://vtmulueztugoaotouqza.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bXVsdWV6dHVnb2FvdG91cXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzAzMjUsImV4cCI6MjA5MzgwNjMyNX0.24ei4t75FkYb138AL_Nz1ghsNgFIDihHnI8s6lzKhsk';
const db = supabase.createClient(SUPA_URL, SUPA_KEY);
const WA = '2348080081215';

// ── SECURITY ──────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
function sanitizeInput(str, maxLen = 500) {
  if (!str) return '';
  return String(str).trim().substring(0, maxLen).replace(/[<>]/g, '');
}

// ── FORMATTING ────────────────────────────────────────────────────────
const fmt = n => '₦' + Number(n || 0).toLocaleString('en-NG');

// ── CART ──────────────────────────────────────────────────────────────
// Cart lives in localStorage under 'hairnique_cart'
// Item shape: { key, product_id, variant_id, product_name, variant_label,
//               retail_price, image_url, emoji, qty }
const CART_KEY = 'hairnique_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch (e) {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}
function updateNavCartCount() {
  const count = getCartCount();
  const el = document.getElementById('cartCount');
  if (el) {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  }
  const btn = document.getElementById('cartBtn');
  if (btn) btn.setAttribute('aria-label', `Shopping cart, ${count} item${count === 1 ? '' : 's'}`);
}
function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.key === item.key);
  if (existing) {
    existing.qty += (item.qty || 1);
  } else {
    cart.push({ ...item, qty: item.qty || 1 });
  }
  saveCart(cart);
  updateNavCartCount();
}
function updateQty(key, delta) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  updateNavCartCount();
}
function removeFromCart(key) {
  saveCart(getCart().filter(i => i.key !== key));
  updateNavCartCount();
}

// ── PRODUCT IMAGES ────────────────────────────────────────────────────
// IMG_MAP is defined as a separate inline <script> in pages that need it.
// It maps: 'clips','oils','combs','headbands','scrunchies' -> base64 strings.
// Extracted from original index.html (lines 840-847).
const OIL_CAT = 'Oils & Ayurveda';
const PROD_IMG = {
  'Claw Clip': 'clips', 'Snap Clips': 'clips',
  'Scrunchie': 'scrunchies',
  'Wide Tooth Comb': 'combs', 'Wide Tail Comb': 'combs',
  'Afro Comb': 'combs', 'Cutting Comb': 'combs', 'Plastic Brush': 'combs',
  'Headband': 'headbands',
};

function getProductImage(name, category, imageUrl) {
  // 1. Supabase storage URL
  if (imageUrl) return { type: 'img', src: imageUrl };
  // 2. Embedded base64 photo map (if IMG_MAP loaded by page)
  if (typeof IMG_MAP !== 'undefined') {
    if (category === OIL_CAT && IMG_MAP['oils']) return { type: 'img', src: IMG_MAP['oils'] };
    const key = PROD_IMG[name];
    if (key && IMG_MAP[key]) return { type: 'img', src: IMG_MAP[key] };
  }
  return null; // fallback to emoji
}
function renderProductImg(name, category, imageUrl, emoji, extraStyle = '') {
  const img = getProductImage(name, category, imageUrl);
  if (img) {
    return `<img src="${esc(img.src)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover${extraStyle ? ';' + extraStyle : ''}">`;
  }
  return `<div class="emoji-ph">${emoji || '✨'}</div>`;
}

// ── TOAST ─────────────────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, actions = null, duration = 3500) {
  const t = document.getElementById('toast');
  if (!t) return;
  let html = esc(msg);
  if (actions) {
    actions.forEach(a => {
      if (a.onclick) {
        html += ` <a href="#" class="toast-action" onclick="${esc(a.onclick)};return false">${esc(a.label)}</a>`;
      } else {
        html += ` <a href="${esc(a.href)}" class="toast-action">${esc(a.label)}</a>`;
      }
    });
  }
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

// ── SVG ICONS ─────────────────────────────────────────────────────────
const SVG_IG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;

const SVG_TT = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1-.07z"/></svg>`;

const SVG_WA = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

const SVG_CART = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;

// ── NAV INIT ──────────────────────────────────────────────────────────
// Call this on DOMContentLoaded on every page.
// activePage: 'home' | 'shop' | null
function initNav(activePage) {
  // Bind hamburger with aria-expanded
  const ham = document.getElementById('hamBtn');
  const mobNav = document.getElementById('mobNav');
  const mobClose = document.getElementById('mobClose');
  if (ham && mobNav) {
    ham.addEventListener('click', () => {
      const isOpen = mobNav.classList.toggle('open');
      ham.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
  if (mobClose && mobNav) {
    mobClose.addEventListener('click', () => {
      mobNav.classList.remove('open');
      if (ham) ham.setAttribute('aria-expanded', 'false');
    });
  }
  // Close on link click inside mobile nav
  if (mobNav) {
    mobNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobNav.classList.remove('open');
        if (ham) ham.setAttribute('aria-expanded', 'false');
      });
    });
  }
  // Wire cart button to openCart (not navigate)
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.onclick = null;
    cartBtn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  }
  // Highlight active nav link
  if (activePage) {
    document.querySelectorAll(`[data-nav="${activePage}"]`).forEach(el => {
      el.classList.add('nav-active');
    });
  }
  // Show cart count
  updateNavCartCount();
}

// ── SCROLL ANIMATION ──────────────────────────────────────────────────
function initScrollAnim() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
}

// ── CART DRAWER ────────────────────────────────────────────────

function trapFocus(element) {
  const focusable = element.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];
  element._trapHandler = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  element.addEventListener('keydown', element._trapHandler);
}
function releaseFocus(element) {
  if (element._trapHandler) element.removeEventListener('keydown', element._trapHandler);
}

function openCart() {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer) return;
  renderCart();
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  if (overlay) { overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); }
  document.body.style.overflow = 'hidden';
  trapFocus(drawer);
  setTimeout(() => { drawer.querySelector('.cart-close')?.focus(); }, 80);
}

function closeCart() {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer) return;
  releaseFocus(drawer);
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  if (overlay) { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); }
  document.body.style.overflow = '';
  document.getElementById('cartBtn')?.focus();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const drawer = document.getElementById('cartDrawer');
    if (drawer && drawer.classList.contains('open')) closeCart();
  }
});

function renderCart() {
  const cart    = getCart();
  const itemsEl = document.getElementById('cartItems');
  const footEl  = document.getElementById('cartFoot');
  if (!itemsEl) return;

  updateNavCartCount();

  const count    = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.retail_price * i.qty, 0);

  if (!cart.length) {
    itemsEl.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;color:var(--muted)">
        <div style="font-size:3rem;margin-bottom:.75rem" role="img" aria-label="Empty cart">&#x1F6D2;</div>
        <p style="margin-bottom:1rem">Your cart is empty.</p>
        <button onclick="closeCart()"
          style="background:var(--purple);color:#fff;border:none;
          padding:.6rem 1.4rem;border-radius:100px;
          font-family:inherit;font-weight:600;cursor:pointer">
          Start Shopping
        </button>
      </div>`;
    if (footEl) footEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="ci-img">
        ${item.image_url
          ? `<img src="${esc(item.image_url)}" alt="${esc(item.product_name)}" loading="lazy">`
          : `<div class="ci-emoji" role="img" aria-label="${esc(item.product_name)}">${item.emoji || '&#x1F9F4;'}</div>`}
      </div>
      <div class="ci-info">
        <div class="ci-name">${esc(item.product_name)}</div>
        ${item.variant_label && item.variant_label !== 'Default'
          ? `<div class="ci-variant">${esc(item.variant_label)}</div>` : ''}
        <div class="ci-price">${fmt(item.retail_price)}</div>
        <div class="ci-qty">
          <button class="ci-qty-btn"
            onclick="updateCartQty('${esc(item.key)}',-1)"
            aria-label="Decrease quantity of ${esc(item.product_name)}">&#x2212;</button>
          <span class="ci-qty-val" aria-label="Quantity: ${item.qty}">${item.qty}</span>
          <button class="ci-qty-btn"
            onclick="updateCartQty('${esc(item.key)}',1)"
            aria-label="Increase quantity of ${esc(item.product_name)}">+</button>
          <button class="ci-remove"
            onclick="removeCartItem('${esc(item.key)}')"
            aria-label="Remove ${esc(item.product_name)} from cart">Remove</button>
        </div>
      </div>
    </div>`).join('');

  const subEl = document.getElementById('cartSubtotal');
  if (subEl) subEl.textContent = fmt(subtotal);
  if (footEl) footEl.style.display = 'block';
}

function updateCartQty(key, delta) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    saveCart(cart.filter(i => i.key !== key));
  } else {
    saveCart(cart);
  }
  renderCart();
}

function removeCartItem(key) {
  saveCart(getCart().filter(i => i.key !== key));
  renderCart();
}

function applyPromoCode() {
  const code = document.getElementById('promoCodeInput')?.value.trim();
  const msg  = document.getElementById('promoMsg');
  if (!code) { if (msg) { msg.textContent = 'Please enter a code'; msg.className = 'code-msg err'; } return; }
  // Save to localStorage — validation happens on checkout page
  localStorage.setItem('hairnique_promo', code.toUpperCase());
  if (msg) { msg.textContent = 'Code saved — apply on checkout'; msg.className = 'code-msg ok'; }
}
