// Shared cart logic for all pages: size selection, cart count, and persistence
// Connects Product, Cart, Shop, and Checkout pages

document.addEventListener('DOMContentLoaded', function() {
  // Update cart count in nav on all pages
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
  }
  updateCartCount();

  // Product page: handle size selection and add to cart
  const addBtn = document.getElementById('add-to-cart-btn');
  const sizeSelect = document.getElementById('size-select');
  if (addBtn && sizeSelect) {
    addBtn.onclick = function(e) {
      e.preventDefault();
      const size = sizeSelect.value;
      if (!size) {
        alert('Please select a size.');
        return;
      }
      // Example: get product info from data attributes or JS object
      const product = {
        id: document.body.dataset.productId || 'product-001',
        name: document.body.dataset.productName || document.title.replace('Product — ', ''),
        price: parseFloat(document.body.dataset.productPrice) || 499.00,
        image: document.body.dataset.productImage || ''
      };
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const key = product.id + '-' + size;
      let found = false;
      cart = cart.map(item => {
        if (item.key === key) {
          item.qty += 1;
          found = true;
        }
        return item;
      });
      if (!found) {
        cart.push({
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          size,
          qty: 1,
          image: product.image
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      alert('Added to cart: ' + product.name + ' (Size: ' + size + ')');
    };
  }

  // Cart page: render cart items with size
  const cartArea = document.getElementById('cart-items');
  if (cartArea) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      cartArea.innerHTML = '<p>Your cart is empty.</p>';
    } else {
      cartArea.innerHTML = cart.map(item => `
        <div class="cart-row">
          <div class="cart-thumb">${item.image ? `<img src="${item.image}" alt="">` : ''}</div>
          <div class="cart-info">
            <div class="cart-title">${item.name}</div>
            <div class="cart-size">Size: <strong>${item.size}</strong></div>
            <div class="cart-qty">Qty: ${item.qty}</div>
            <div class="cart-price">R${(item.price * item.qty).toFixed(2)}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // Checkout page: include size in summary (reuse cart logic above as needed)
});
