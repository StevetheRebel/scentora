// Get the header, menu button, and all navigation links.
const header = document.querySelector("header");
const menuButton = document.querySelector(".menu");
const navLinks = document.querySelectorAll(".nav-items a");
const featuredPerfumes = document.querySelector("#featuredPerfumes");
const cartCount = document.querySelector(".cart-count");
const CART_STORAGE_KEY = "scentoraCart";

// Get cart items from localStorage.
function getCartItems() {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!savedCart) {
    return [];
  }

  try {
    return JSON.parse(savedCart);
  } catch (error) {
    return [];
  }
}

// Save cart items in localStorage.
function saveCartItems(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  updateCartCount();
}

// Count all quantities in the cart.
function getCartTotalQuantity() {
  const cartItems = getCartItems();

  return cartItems.reduce(function (total, item) {
    return total + item.quantity;
  }, 0);
}

// Show or hide the small cart number in the navigation.
function updateCartCount() {
  if (!cartCount) {
    return;
  }

  const totalQuantity = getCartTotalQuantity();
  cartCount.textContent = totalQuantity;
  cartCount.classList.toggle("show-count", totalQuantity > 0);
}

// Show a small notification after adding a product.
function showCartMessage(productName) {
  const oldMessage = document.querySelector(".cart-message");

  if (oldMessage) {
    oldMessage.remove();
  }

  const message = document.createElement("p");
  message.className = "cart-message";
  message.textContent = `${productName} added to cart`;
  document.body.appendChild(message);

  setTimeout(function () {
    message.remove();
  }, 1800);
}

// Add one product to the cart.
function addItemToCart(product) {
  const cartItems = getCartItems();
  const existingItem = cartItems.find(function (item) {
    return item.id === product.id;
  });

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
      category: product.category,
      concentration: product.concentration,
      quantity: 1,
    });
  }

  saveCartItems(cartItems);
  showCartMessage(product.name);
}

// Make the cart helpers available to other page scripts.
window.scentoraCart = {
  addItem: addItemToCart,
  getItems: getCartItems,
  saveItems: saveCartItems,
  updateCount: updateCartCount,
};

// Listen for any add-to-cart button on the page.
document.addEventListener("click", function (event) {
  const addButton = event.target.closest("[data-cart-id][data-cart-name]");

  if (!addButton) {
    return;
  }

  addItemToCart({
    id: addButton.dataset.cartId,
    name: addButton.dataset.cartName,
    price: Number(addButton.dataset.cartPrice),
    currency: addButton.dataset.cartCurrency,
    image: addButton.dataset.cartImage,
    category: addButton.dataset.cartCategory,
    concentration: addButton.dataset.cartConcentration,
  });
});

updateCartCount();

// This function closes the mobile menu.
function closeMenu() {
  header.classList.remove("nav-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");
}

// Only run the menu code if the page has a menu button.
if (header && menuButton) {
  // Open or close the menu when the menu button is clicked.
  menuButton.addEventListener("click", function () {
    header.classList.toggle("nav-open");

    // Tell the browser if the menu is open or closed.
    const menuIsOpen = header.classList.contains("nav-open");
    menuButton.setAttribute("aria-expanded", String(menuIsOpen));
    menuButton.setAttribute(
      "aria-label",
      menuIsOpen ? "Close navigation menu" : "Open navigation menu",
    );
  });

  // Close the menu after clicking any navigation link.
  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // Close the mobile menu if the screen becomes desktop size.
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

// Only run this product code on the home page.
if (featuredPerfumes) {
  // The project currently has perfumes.json, but this also supports perfume.json.
  const dataFiles = "data/perfumes.json";

  // This protects the page from special characters in product text.
  const escapeHtml = function (text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  // Format product prices with commas.
  const formatPrice = function (perfume) {
    return `${perfume.currency || "KES"} ${Number(perfume.price).toLocaleString()}`;
  };

  // Load the perfume JSON file.
  const loadPerfumeData = async function () {
    try {
      const response = await fetch(dataFiles);

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error loading perfume data:", error);
    }

    throw new Error("Perfume data could not be loaded.");
  };

  // Create one featured perfume card.
  const createFeaturedCard = function (perfume) {
    return `
      <div class="featured-card">
        <img src="/${perfume.image}" alt="${escapeHtml(perfume.name)} perfume bottle" />

        <div class="item-detail">
          <div>
            <p class="prod-title">${escapeHtml(perfume.name)}</p>
            <div class="item-deco">
              <div class="line"></div>
              <i class="bx bx-heart"></i>
              <div class="line"></div>
            </div>
          </div>

          <p class="item-desc">${escapeHtml(perfume.description)}</p>
          <p class="item-meta">${escapeHtml(perfume.category)} • ${escapeHtml(perfume.concentration)}</p>
          <p class="item-price">${formatPrice(perfume)}</p>
          <button
            type="button"
            class="primary-btn"
            data-cart-id="${escapeHtml(perfume.id)}"
            data-cart-name="${escapeHtml(perfume.name)}"
            data-cart-price="${perfume.price}"
            data-cart-currency="${escapeHtml(perfume.currency)}"
            data-cart-image="${escapeHtml(perfume.image)}"
            data-cart-category="${escapeHtml(perfume.category)}"
            data-cart-concentration="${escapeHtml(perfume.concentration)}"
          >
            <i class="bx bx-shopping-bag-alt"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  };

  // Show featured perfumes on the home page.
  const renderFeaturedPerfumes = async function () {
    try {
      const data = await loadPerfumeData();
      const perfumes = data.perfumes || [];
      const featuredItems = perfumes.filter(function (perfume) {
        return perfume.featured === true;
      });

      featuredPerfumes.innerHTML = featuredItems
        .map(createFeaturedCard)
        .join("");
    } catch (error) {
      featuredPerfumes.innerHTML = `
        <div class="featured-error">
          <p>Featured perfumes could not be loaded.</p>
        </div>
      `;
    }
  };

  renderFeaturedPerfumes();
}
