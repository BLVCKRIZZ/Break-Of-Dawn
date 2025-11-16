/* script.js
   - Contains data, rendering for pages, cart logic (localStorage), and simple UI interactions.
   - Designed to be used across all HTML pages.
*/

/* ---------------------------
   Sample product data
   (Use simple filenames like "s1.jpg" or full URLs; filenames will be resolved to assets/)
   --------------------------- */
const PRODUCTS = [
  { id: '12120819811', title: 'Silk Tailored Shorts', category: 'Shorts', price: 429, img: 'Trim Minimalist Women White Outfit.jpeg', desc: 'Smooth silk blend tailored shorts — elevated summer staple.' },
  { id: '12120819812', title: 'Silk Tailored Shorts', category: 'Shorts', price: 429, img: 'blackshorts.jpeg', desc: 'Smooth silk blend tailored shorts — elevated summer staple.' },
  { id: '12120819813', title: 'Silk Tailored Shorts', category: 'Shorts', price: 429, img: 'bluesshorts.jpeg', desc: 'Smooth silk blend tailored shorts — elevated summer staple.' },
  { id: '12120819814', title: 'Pleated Mini Skirt', category: 'Skirts', price: 499, img: 'Mid Rise Faux Pearl Button Mini Skirt.jpeg', desc: 'Fine pleats, elegant silhouette.' },
  { id: '12120819815', title: 'Cashmere Blend Top', category: 'Tops', price: 799, img: 'download (1).jpg', desc: 'Lightweight cashmere for refined comfort.' },
  { id: '12120819816', title: 'Cashmere Blend Top', category: 'Tops', price: 799, img: 'download.jpg', desc: 'Lightweight cashmere for refined comfort.' },
  { id: '12120819817', title: 'Cashmere Blend Top', category: 'Tops', price: 799, img: 'Two-Tone Ribbed Knit Tank Top in Sand.jpeg', desc: 'Lightweight cashmere for refined comfort.' },
  { id: '12120819818', title: 'High Waist Trousers', category: 'Pants', price: 899, img: 'Pants1.jpeg', desc: 'Tailored high waist with subtle taper.' },
  { id: '12120819819', title: 'Leather Belt — Matte', category: 'Accessories', price: 249, img: 'LeatherBelt.jpeg', desc: 'Minimal matte leather belt.' },
  { id: '121208198110', title: 'Ear Rings', category: 'Accessories', price: 249, img: 'Triple Knot Earrings - Gold.jpg', desc: 'Minimal matte leather belt.' },
  { id: '121208198111', title: 'Glasses', category: 'Accessories', price: 399, img: 'Glasses.jpeg', desc: 'Classic gold hoops.' },
  { id: '121208198112', title: 'Linen A-line Skirt', category: 'Skirts', price: 359, img: 'Flap Front Golden Button Trim Skorts in Ivory beige.jpeg', desc: 'Breezy linen in a soft A-line cut.' },
  { id: '121208198113', title: 'Wide-Leg Culottes', category: 'Pants', price: 579, img: 'Pants3.jpeg', desc: 'Versatile culottes that dress up or down.' },
  { id: '121208198114', title: 'Tailored Satin Trousers', category: 'Pants', price: 649, img: 'Pants2.jpeg', desc: 'Satin finish, streamlined silhouette.' },
];
// normalize categories (Bottoms -> Pants) for consistent UI
PRODUCTS.forEach(p => { if (p.category === 'Bottoms') p.category = 'Pants'; });

const PLACEHOLDER_IMG = 'heroimage.png';

/* ---------------------------
   Configurable sections
   --------------------------- */
// Featured items on homepage (by product IDs from PRODUCTS array)
const FEATURED_ITEMS = [
  '12120819814', // Pleated Mini Skirt
  '12120819815', // Cashmere Blend Top
  '12120819818'  // High Waist Trousers
];

// "You might also like" items on product page (by product IDs)
const YOU_MIGHT_LIKE = ['s2', 't1', 'a1', 'p2'];

/* Simplified image path helper
   - If given a full URL, absolute path, return as-is.
   - Otherwise treat value as a filename and return it directly (images are in root).
*/
function simpleImagePath(src){
  if(!src) return PLACEHOLDER_IMG;
  const s = String(src).trim();
  if(/^https?:\/\//i.test(s) || s.startsWith('/')) return s;
  return s;
}

/* ---------------------------
   Cart helpers
   --------------------------- */
const CART_KEY = 'Break Of Dawn_cart_v1';

function readCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){
    console.error('Failed to read cart', e);
    return [];
  }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateNavCounts();
}
function addToCart(productId, qty = 1){
  // Support size selection
  let size = arguments.length > 2 ? arguments[2] : null;
  const cart = readCart();
  // Use ID plus size code for unique grouping
  let sizeCode = size === 'S' ? '1' : size === 'M' ? '2' : size === 'L' ? '3' : '';
  let cartId = productId + sizeCode;
  const existing = cart.find(i=>i.cartId === cartId);
  if(existing){
    existing.qty += qty;
  } else {
    const p = PRODUCTS.find(x=>x.id===productId);
    if(!p) return;
    cart.push({ cartId: cartId, id: p.id, title: p.title, price: p.price, img: p.img, qty: qty, size: size });
  }
  saveCart(cart);
  showToast('Added to cart');
}
function removeFromCart(productId){
  let cart = readCart();
  const idx = cart.findIndex(i => i.cartId === productId);
  if (idx > -1) {
    if (cart[idx].qty > 1) {
      cart[idx].qty -= 1;
    } else {
      cart.splice(idx, 1);
    }
  }
  saveCart(cart);
}
function updateQty(productId, qty){
  const cart = readCart();
  const it = cart.find(i=>i.cartId === productId);
  if(!it) return;
  it.qty = Math.max(1, Number(qty) || 1);
  saveCart(cart);
}
function clearCart(){
  saveCart([]);
}
function cartTotal(){
  const cart = readCart();
  return cart.reduce((s,i)=> s + i.price * i.qty, 0);
}
function cartCount(){
  const cart = readCart();
  return cart.reduce((s,i)=> s + i.qty, 0);
}

/* ---------------------------
   UI helpers
   --------------------------- */
function updateNavCounts(){
  const cnt = cartCount();
  // multiple nav count elements across pages have different IDs
  ['nav-cart-count','nav-cart-count-shop','nav-cart-count-product','nav-cart-count-cart','nav-cart-count-about','nav-cart-count-contact']
    .forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.textContent = cnt;
    });
}

/* Simple toast (small ephemeral message) */
function showToast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.position = 'fixed';
  el.style.right = '18px';
  el.style.bottom = '18px';
  el.style.padding = '10px 14px';
  el.style.background = 'rgba(17,17,17,0.9)';
  el.style.color = '#fff';
  el.style.borderRadius = '8px';
  el.style.boxShadow = '0 8px 22px rgba(10,10,10,0.2)';
  el.style.zIndex = 9999;
  document.body.appendChild(el);
  setTimeout(()=> el.style.opacity = '0', 1500);
  setTimeout(()=> el.remove(), 2100);
}

/* ---------------------------
   Render helpers for pages
   --------------------------- */
function makeProductCard(p){
  const wrap = document.createElement('article');
  wrap.className = 'product';
  const imgSrc = simpleImagePath(p.img);
  wrap.innerHTML = `
    <div class="product-img">
      <span class="img-bg" aria-hidden="true" style="background-image:url('${imgSrc.replace(/'/g,"\\'")}')"></span>
      <img class="prod-img" src="${imgSrc}" alt="${escapeHTML(p.title)}" loading="lazy"
           onerror="this.onerror=null;console.warn('Image load failed:', this.src);this.src='${PLACEHOLDER_IMG}';" />
    </div>
    <div class="p-body">
      <div class="title">${escapeHTML(p.title)}</div>
      <div class="price">R${p.price}</div>
      <div style="margin-top:auto;display:flex;gap:10px">
        <a class="btn btn-outline" href="product.html?id=${encodeURIComponent(p.id)}">View</a>
        <button class="btn btn-primary add-btn" data-id="${p.id}">Add to cart</button>
      </div>
    </div>
  `;
  return wrap;
}

/* Render featured on index page */
function renderFeatured(){
  const container = document.getElementById('featured-grid');
  if(!container) return;
  // Use configured featured items
  const featured = FEATURED_ITEMS.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  container.innerHTML = '';
  featured.forEach(p=>{
    container.appendChild(makeProductCard(p));
  });
  // Note: listeners handled by delegated event in initCommon, no need to attach here
}

// normalize category helper (case-insensitive, trims whitespace)
function normalizeCat(s){ return String(s || '').trim().toLowerCase(); }

function renderProducts(category){
  const container = document.getElementById('products-grid');
  if(!container) return;
  const normFilter = category ? normalizeCat(category) : null;

  // filter using normalized categories (robust to casing/whitespace)
  const items = normFilter
    ? PRODUCTS.filter(p => normalizeCat(p.category) === normFilter)
    : PRODUCTS;

  container.innerHTML = '';
  if(items.length === 0){
    container.innerHTML = '<div class="muted">No items found.</div>';
    return;
  }
  items.forEach(p=>{
    container.appendChild(makeProductCard(p));
  });
  // Note: listeners handled by delegated event in initCommon, no need to attach here
}

/* Render single product page based on ?id= */
function renderProductDetail(){
  const area = document.getElementById('product-area');
  if(!area) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id){
    area.innerHTML = '<div class="muted">No product specified.</div>';
    return;
  }
  const product = PRODUCTS.find(p=>p.id === id);
  if(!product){
    area.innerHTML = '<div class="muted">Product not found.</div>';
    return;
  }
  const imgSrc = simpleImagePath(product.img);
  area.innerHTML = `
    <div class="product-area">
      <div class="product-img" style="max-width:560px;margin-right:28px">
        <span class="img-bg" aria-hidden="true" style="background-image:url('${imgSrc.replace(/'/g,"\\'")}')"></span>
        <img src="${imgSrc}" alt="${escapeHTML(product.title)}"
             onerror="this.onerror=null;console.warn('Image load failed:', this.src);this.src='${PLACEHOLDER_IMG}';" />
      </div>
      <div>
        <h1 style="font-family: 'Times New Roman', Georgia, serif;">${escapeHTML(product.title)}</h1>
        <div class="price" style="color:var(--accent);font-weight:700;margin-top:6px">R${product.price}</div>
        <p class="muted" style="margin-top:12px">${escapeHTML(product.desc)}</p>
        <form id="size-form" style="margin-top:18px;display:flex;gap:12px;align-items:center;">
          <label for="size-select" style="font-weight:600;">Size:</label>
          <select id="size-select" name="size" style="padding:6px 14px; border-radius:8px; border:1px solid #ccc;">
            <option value="">Select</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
          <button type="submit" class="btn btn-outline" id="add-cart">Add to cart</button>
        </form>
      </div>
    </div>
  `;
  document.getElementById('size-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const size = document.getElementById('size-select').value;
    if (!size) {
      showToast('Please select a size');
      return;
    }
    addToCart(product.id, 1, size);
  });
  
  // Render "You might also like" section
  renderYouMightLike(id);
}

/* Render "You might also like" section on product page */
function renderYouMightLike(currentProductId){
  const container = document.getElementById('you-might-like-grid');
  if(!container) return;
  
  // Get configured items, excluding the current product
  const suggestions = YOU_MIGHT_LIKE
    .filter(id => id !== currentProductId)
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 4); // Show max 4 items
  
  if(suggestions.length === 0) {
    container.parentElement.style.display = 'none';
    return;
  }
  
  container.innerHTML = '';
  suggestions.forEach(p => {
    container.appendChild(makeProductCard(p));
  });
  // Note: listeners handled by delegated event in initCommon
}

/* Render cart page */
function renderCartPage(){
  const area = document.getElementById('cart-area');
  const sidebar = document.getElementById('cart-sidebar');
  if(!area || !sidebar) return;
  const cart = readCart();
  if(cart.length === 0){
      area.innerHTML = `<div class="muted">Your cart is empty. <a href="shop.html">Shop now</a></div>`;
      sidebar.innerHTML = '';
      return;
    }
    area.innerHTML = '';
  cart.forEach(item=>{
    const row = document.createElement('div');
    row.className = 'cart-row';
    const imgSrc = simpleImagePath(item.img);
    row.innerHTML = `
      <div class="cart-thumb" style="width:84px;margin-right:12px">
        <span class="img-bg" aria-hidden="true" style="background-image:url('${imgSrc.replace(/'/g,"\\'")}')"></span>
        <img src="${imgSrc}" alt="${escapeHTML(item.title)}"
             onerror="this.onerror=null;console.warn('Image load failed:', this.src);this.src='${PLACEHOLDER_IMG}';" />
      </div>
      <div style="flex:1">
        <div style="font-weight:600">${escapeHTML(item.title)}</div>
        <div class="muted">Size: ${item.size || 'N/A'}</div>
        <div class="muted">R${item.price}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <input class="qty-input" type="number" min="1" value="${item.qty}" data-cartid="${item.cartId}" />
        <button class="btn btn-outline remove-btn" data-cartid="${item.cartId}">Remove</button>
      </div>
    `;
    area.appendChild(row);
  });

  // sidebar summary with PayFast checkout form
  const total = cartTotal();
  sidebar.innerHTML = `
    <div class="card">
      <div style="font-weight:700">Order summary</div>
      <div style="margin-top:12px">Items: ${cart.reduce((s,i)=> s + i.qty,0)}</div>
      <div style="margin-top:6px;font-weight:700">Subtotal: R${total.toFixed(2)}</div>
      <form id="payfast-checkout" action="https://www.payfast.co.za/eng/process" method="POST" style="margin-top:14px">
        <input type="hidden" name="merchant_id" value="31332765">
        <input type="hidden" name="merchant_key" value="uhhomddzmcpwy">
        <input type="hidden" name="amount" value="${total.toFixed(2)}">
        <input type="hidden" name="item_name" value="Break Of Dawn Order">
        <input type="hidden" name="return_url" value="${window.location.origin}/success.html">
        <input type="hidden" name="cancel_url" value="${window.location.origin}/cart.html">
        <input type="hidden" name="notify_url" value="${window.location.origin}/payfast-notify.php">
        <div style="display:flex;gap:10px">
          <button type="submit" class="btn btn-primary" style="flex:1">Proceed to Checkout</button>
          <button type="button" id="clear-cart" class="btn btn-outline">Clear</button>
        </div>
      </form>
    </div>
  `;

  // listeners
    document.querySelectorAll('.qty-input').forEach(inp=>{
      function update() {
        const cartId = inp.dataset.cartid;
        let val = Math.max(1, Number(inp.value) || 1);
        updateQty(cartId, val);
        renderCartPage();
      }
      inp.addEventListener('change', update);
      inp.addEventListener('input', update);
      inp.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          setTimeout(update, 0);
        }
      });
    });
  document.querySelectorAll('.remove-btn').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const cartId = e.currentTarget.dataset.cartid;
      removeFromCart(cartId);
      renderCartPage();
    });
  });
  document.getElementById('clear-cart').addEventListener('click', ()=> {
    clearCart();
    renderCartPage();
  });
}

/* ---------------------------
   Utilities & init
   --------------------------- */
function escapeHTML(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* Newsletter (simple front-end demo) */
(function attachNewsletter(){
  const f = document.getElementById('newsletter-form');
  if(!f) return;
  f.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    if(!email) return showToast('Please enter an email');
    showToast('Thanks — you\'re subscribed (demo)');
    f.reset();
  });
})();

/* Contact form handler */
function submitContact(evt){
  evt.preventDefault();
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const msg = document.getElementById('contact-message').value.trim();
  if(!name || !email || !msg) return showToast('Please complete the form');
  showToast('Message sent (demo). We will contact you soon.');
  document.getElementById('contact-form').reset();
}

/* Initialize common elements on all pages */
function initCommon(){
  // set copyright years
  for(let i=1;i<=6;i++){
    const el = document.getElementById('year' + (i===1? ''+i : i));
    // old HTML used year, year2... but to avoid missing we also set multiple ids
  }
  // simpler: set all elements that are span with id starting year
  document.querySelectorAll('[id^=year]').forEach(e=>{
    e.textContent = new Date().getFullYear();
  });

  updateNavCounts();
  
  // Single delegated event listener for all "Add to cart" buttons
  // This prevents duplicate event listeners from being attached
  document.addEventListener('click', function(ev){
    const t = ev.target;
    if(t.matches && t.matches('.add-btn')){
      // If not on product page, prompt for size
      if (!document.getElementById('size-select')) {
        let size = prompt('Please enter size (S, M, L):');
        if (!size || !['S','M','L'].includes(size.toUpperCase())) {
          showToast('Please select a valid size: S, M, or L');
          return;
        }
        addToCart(t.dataset.id, 1, size.toUpperCase());
      }
      // If on product page, handled by form
    }
  });
}

// mark active nav link
document.querySelectorAll('.main-nav a').forEach(a=>{
  try{
    if (new URL(a.href, location.origin).pathname === location.pathname) {
      a.setAttribute('aria-current','page');
      a.classList.add('active-nav');
    }
  }catch(e){}
});

// set year spans (ids like year, year2..)
document.querySelectorAll('[id^="year"]').forEach(el=>{
  el.textContent = new Date().getFullYear();
});

/* Entry point: detect which page and run appropriate renderers */
document.addEventListener('DOMContentLoaded', ()=>{
  initCommon();
  renderFeatured();
  updateNavCounts();

  // index.html -> render featured already
  if(document.getElementById('products-grid')){
    // shop page
    renderProducts();
  }
  if(document.getElementById('product-area')){
    renderProductDetail();
  }
  if(document.getElementById('cart-area')){
    renderCartPage();
  }
});
