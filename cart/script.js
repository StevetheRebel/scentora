const cartItemsContainer = document.querySelector("#cartItems");
const summaryItems = document.querySelector("#summaryItems");
const summaryTotal = document.querySelector("#summaryTotal");
const clearCartButton = document.querySelector("#clearCart");
const checkoutButton = document.querySelector(".checkout-btn");

// Protect the page from special characters in product text.
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Format money with commas.
function formatMoney(currency, amount) {
  return `${currency || "KES"} ${Number(amount).toLocaleString()}`;
}

// Get the correct image path for the cart page.
function getCartImagePath(item) {
  return `./../${item.image}`;
}

// Count all item quantities.
function getTotalQuantity(cartItems) {
  return cartItems.reduce(function (total, item) {
    return total + item.quantity;
  }, 0);
}

// Add all item prices into one cart total.
function getTotalText(cartItems) {
  const total = cartItems.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);

  return formatMoney("KES", total);
}

// Save cart changes and refresh the page.
function saveAndRender(cartItems) {
  window.scentoraCart.saveItems(cartItems);
  renderCart();
}

// Create one cart item.
function createCartItem(item) {
  return `
    <article class="cart-item">
      <div class="cart-item-img">
        <img src="${getCartImagePath(item)}" alt="${escapeHtml(item.name)} perfume bottle" />
      </div>

      <div class="cart-item-info">
        <h2>${escapeHtml(item.name)}</h2>
        <p>${escapeHtml(item.category)} • ${escapeHtml(item.concentration)}</p>
        <p class="cart-item-price">${formatMoney(item.currency, item.price)}</p>
      </div>

      <div class="cart-item-actions">
        <div class="quantity-controls" aria-label="${escapeHtml(item.name)} quantity controls">
          <button type="button" data-cart-action="decrease" data-cart-id="${escapeHtml(item.id)}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-cart-action="increase" data-cart-id="${escapeHtml(item.id)}">+</button>
        </div>

        <button type="button" class="remove-item-btn" data-cart-action="remove" data-cart-id="${escapeHtml(item.id)}">
          Remove
        </button>
      </div>
    </article>
  `;
}

// Show an empty cart message.
function renderEmptyCart() {
  cartItemsContainer.innerHTML = `
    <div class="empty-cart">
      <h2>Your cart is empty</h2>
      <p>Explore the Scentora collection and add a perfume you love.</p>
      <a href="/shop/">Shop Perfumes</a>
    </div>
  `;
}

// Render all cart items and summary totals.
function renderCart() {
  const cartItems = window.scentoraCart.getItems();

  if (cartItems.length === 0) {
    renderEmptyCart();
  } else {
    cartItemsContainer.innerHTML = cartItems.map(createCartItem).join("");
  }

  summaryItems.textContent = getTotalQuantity(cartItems);
  summaryTotal.textContent = getTotalText(cartItems);
  clearCartButton.disabled = cartItems.length === 0;
  checkoutButton.disabled = cartItems.length === 0;
}

// Handle quantity and remove buttons.
cartItemsContainer.addEventListener("click", function (event) {
  const button = event.target.closest("[data-cart-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.cartAction;
  const productId = button.dataset.cartId;
  let cartItems = window.scentoraCart.getItems();
  const cartItem = cartItems.find(function (item) {
    return item.id === productId;
  });

  if (!cartItem) {
    return;
  }

  if (action === "increase") {
    cartItem.quantity += 1;
  }

  if (action === "decrease") {
    cartItem.quantity -= 1;
  }

  if (action === "remove" || cartItem.quantity <= 0) {
    cartItems = cartItems.filter(function (item) {
      return item.id !== productId;
    });
  }

  saveAndRender(cartItems);
});

// Clear the whole cart.
clearCartButton.addEventListener("click", function () {
  saveAndRender([]);
});

renderCart();
