// Show 24 products on each page.
const ITEMS_PER_PAGE = 24;

// These are the two possible data file names.
// The project currently has perfumes.json, but this also supports perfume.json.
const DATA_FILES = ["./../data/perfumes.json", "./../data/perfume.json"];

// Get all the HTML elements we need.
const productGrid = document.querySelector("#productGrid");
const resultCount = document.querySelector("#resultCount");
const pageStatus = document.querySelector("#pageStatus");
const pagination = document.querySelector("#pagination");
const catalogSection = document.querySelector("#catalogSection");
const filterToggle = document.querySelector("#filterToggle");
const shopFilters = document.querySelector("#shopFilters");
const categoryFilter = document.querySelector("#categoryFilter");
const scentFamilyFilter = document.querySelector("#scentFamilyFilter");
const concentrationFilter = document.querySelector("#concentrationFilter");
const minPriceFilter = document.querySelector("#minPriceFilter");
const maxPriceFilter = document.querySelector("#maxPriceFilter");
const clearFilters = document.querySelector("#clearFilters");

// These variables store the products and the current page.
let allPerfumes = [];
let filteredPerfumes = [];
let currentPage = 1;

// Open or close the filter box.
function toggleFilters() {
  shopFilters.classList.toggle("show-filters");

  const filtersAreOpen = shopFilters.classList.contains("show-filters");
  filterToggle.setAttribute("aria-expanded", String(filtersAreOpen));
}

// Move the page back to where the catalog starts.
function scrollToCatalog() {
  catalogSection.scrollIntoView({ behavior: "smooth" });
}

// This protects the page from special characters in product text.
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Format product prices with commas.
function formatPrice(perfume) {
  return `${perfume.currency || "KES"} ${Number(perfume.price).toLocaleString()}`;
}

// Build a relative image path for the shop page.
function getImagePath(perfume) {
  return `./../${perfume.image}`;
}

// Create one option for a select input.
function createOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
}

// Fill a select input using unique values from the JSON data.
function fillSelect(selectElement, values) {
  values.forEach(function (value) {
    selectElement.appendChild(createOption(value));
  });
}

// Get unique values from the perfume data.
function getUniqueValues(fieldName) {
  return [...new Set(allPerfumes.map(function (perfume) {
    return perfume[fieldName];
  }))].sort();
}

// Add filter options after the products load.
function setupFilters() {
  fillSelect(categoryFilter, getUniqueValues("category"));
  fillSelect(scentFamilyFilter, getUniqueValues("scentFamily"));
  fillSelect(concentrationFilter, getUniqueValues("concentration"));

  const prices = allPerfumes.map(function (perfume) {
    return perfume.price;
  });

  minPriceFilter.placeholder = `Min ${Math.min(...prices).toLocaleString()}`;
  maxPriceFilter.placeholder = `Max ${Math.max(...prices).toLocaleString()}`;
}

// Return true when a product matches all selected filters.
function productMatchesFilters(perfume) {
  const minPrice = Number(minPriceFilter.value) || 0;
  const maxPrice = Number(maxPriceFilter.value) || Infinity;

  const matchesCategory =
    categoryFilter.value === "" || perfume.category === categoryFilter.value;
  const matchesScentFamily =
    scentFamilyFilter.value === "" ||
    perfume.scentFamily === scentFamilyFilter.value;
  const matchesConcentration =
    concentrationFilter.value === "" ||
    perfume.concentration === concentrationFilter.value;
  const matchesPrice = perfume.price >= minPrice && perfume.price <= maxPrice;

  return (
    matchesCategory &&
    matchesScentFamily &&
    matchesConcentration &&
    matchesPrice
  );
}

// Apply all filters and go back to page 1.
function applyFilters() {
  filteredPerfumes = allPerfumes.filter(productMatchesFilters);
  currentPage = 1;
  renderShop();
}

// Clear every filter input.
function resetFilters() {
  categoryFilter.value = "";
  scentFamilyFilter.value = "";
  concentrationFilter.value = "";
  minPriceFilter.value = "";
  maxPriceFilter.value = "";
  applyFilters();
}

// Create the HTML for one product card.
function createProductCard(perfume) {
  const topNotes = perfume.notes.top.join(", ");

  return `
    <article class="product-card">
      <div class="product-img">
        <img src="${getImagePath(perfume)}" alt="${escapeHtml(perfume.name)} perfume bottle" />
      </div>

      <div class="product-info">
        <div class="product-meta">
          <span class="product-pill">${escapeHtml(perfume.category)}</span>
          <span class="product-pill">${escapeHtml(perfume.concentration)}</span>
        </div>

        <h3>${escapeHtml(perfume.name)}</h3>
        <p class="product-desc">${escapeHtml(perfume.description)}</p>
        <p class="product-notes">Top notes: ${escapeHtml(topNotes)}</p>

        <div class="product-bottom">
          <p class="product-price">${formatPrice(perfume)}</p>
          <button
            type="button"
            data-cart-id="${escapeHtml(perfume.id)}"
            data-cart-name="${escapeHtml(perfume.name)}"
            data-cart-price="${perfume.price}"
            data-cart-currency="${escapeHtml(perfume.currency)}"
            data-cart-image="${escapeHtml(perfume.image)}"
            data-cart-category="${escapeHtml(perfume.category)}"
            data-cart-concentration="${escapeHtml(perfume.concentration)}"
          >
            <i class="bx bx-shopping-bag-alt"></i>
            Add
          </button>
        </div>
      </div>
    </article>
  `;
}

// Show the products for the current page.
function renderProducts() {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const productsForPage = filteredPerfumes.slice(startIndex, endIndex);

  if (productsForPage.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-state">
        <h3>No perfumes found</h3>
        <p>Try changing your filters to see more products.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = productsForPage.map(createProductCard).join("");
}

// Show result count and current page information.
function renderStatus() {
  const totalPages = Math.max(1, Math.ceil(filteredPerfumes.length / ITEMS_PER_PAGE));
  const startItem = filteredPerfumes.length === 0
    ? 0
    : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredPerfumes.length);

  resultCount.textContent = `Showing ${startItem}-${endItem} of ${filteredPerfumes.length} perfumes`;
  pageStatus.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Create the pagination buttons.
function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(filteredPerfumes.length / ITEMS_PER_PAGE));
  let buttons = `
    <button type="button" data-page="prev" ${currentPage === 1 ? "disabled" : ""}>
      Prev
    </button>
  `;

  for (let page = 1; page <= totalPages; page += 1) {
    buttons += `
      <button
        type="button"
        data-page="${page}"
        class="${page === currentPage ? "active-page" : ""}"
      >
        ${page}
      </button>
    `;
  }

  buttons += `
    <button type="button" data-page="next" ${currentPage === totalPages ? "disabled" : ""}>
      Next
    </button>
  `;

  pagination.innerHTML = buttons;
}

// Render products, status text, and pagination together.
function renderShop() {
  renderProducts();
  renderStatus();
  renderPagination();
}

// Load the perfume JSON file.
async function loadPerfumeData() {
  for (const file of DATA_FILES) {
    try {
      const response = await fetch(file);

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Try the next file name if this one fails.
    }
  }

  throw new Error("Perfume data could not be loaded.");
}

// Start the shop page.
async function startShop() {
  try {
    const data = await loadPerfumeData();
    allPerfumes = data.perfumes || [];
    filteredPerfumes = allPerfumes;

    setupFilters();
    renderShop();
  } catch (error) {
    resultCount.textContent = "Perfumes could not be loaded.";
    pageStatus.textContent = "";
    productGrid.innerHTML = `
      <div class="empty-state">
        <h3>Unable to load products</h3>
        <p>Please check that the perfume JSON file is inside the data folder.</p>
      </div>
    `;
  }
}

// Listen for changes on all filters.
filterToggle.addEventListener("click", toggleFilters);
categoryFilter.addEventListener("change", applyFilters);
scentFamilyFilter.addEventListener("change", applyFilters);
concentrationFilter.addEventListener("change", applyFilters);
minPriceFilter.addEventListener("input", applyFilters);
maxPriceFilter.addEventListener("input", applyFilters);
clearFilters.addEventListener("click", resetFilters);

// Listen for clicks on pagination buttons.
pagination.addEventListener("click", function (event) {
  if (event.target.tagName !== "BUTTON") {
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filteredPerfumes.length / ITEMS_PER_PAGE));
  const page = event.target.dataset.page;

  if (page === "prev" && currentPage > 1) {
    currentPage -= 1;
  } else if (page === "next" && currentPage < totalPages) {
    currentPage += 1;
  } else if (!Number.isNaN(Number(page))) {
    currentPage = Number(page);
  }

  renderShop();
  scrollToCatalog();
});

startShop();
