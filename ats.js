const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

function productImage(product) {
  return product.image || product.image_url || "images/kap10-logo-round.png";
}

function productPrice(product) {
  return Number(product.price || 0).toFixed(2);
}

function renderAtsProducts(grid, products, selectedMaker = "all") {
  const makers = [...new Set(
    products
      .map((product) => String(product.category || "").trim())
      .filter(Boolean)
  )].sort();

  const visibleProducts =
    selectedMaker === "all"
      ? products
      : products.filter((product) => String(product.category || "").trim() === selectedMaker);

  grid.innerHTML = `
    <div class="ats-storefront-stack">
      <div class="mod-maker-filter">
      <p class="filter-label">Browse by Mod Maker</p>

      <div class="mod-maker-buttons">
        <button
          type="button"
          class="mod-maker-btn ${selectedMaker === "all" ? "active" : ""}"
          data-maker="all"
        >
          All
        </button>

        ${makers.map((maker) => `
          <button
            type="button"
            class="mod-maker-btn ${selectedMaker === maker ? "active" : ""}"
            data-maker="${maker}"
          >
            ${maker}
          </button>
        `).join("")}
      </div>
    </div>

    <div class="product-grid">
      ${visibleProducts.map((product) => `
        <article class="product-card">
          <img
            class="product-image"
            src="${productImage(product)}"
            alt="${product.name}"
          >

          <div class="product-info">
            <h3>${product.name}</h3>

            <p>${product.description || ""}</p>

            <div class="product-footer">
              <span class="price">$${productPrice(product)}</span>

              <a class="btn primary" href="skin.html?productId=${encodeURIComponent(product.id)}">
                View Skin
              </a>
            </div>
          </div>
        </article>
      `).join("")}
        </div>
  </div>
  `;
}

async function loadProducts() {
  const grid = document.getElementById("atsProductGrid");

  if (!grid) return;

  grid.innerHTML = "<p class='loading-text'>Loading ATS skins...</p>";

  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();
    console.log("ATS products API response:", products);

    if (!Array.isArray(products)) {
      throw new Error("Invalid products response");
    }

    const atsProducts = products.filter((product) => {
  const platform = String(product.platform || "").toLowerCase();
  return platform === "ats";
});

    if (!atsProducts.length) {
      grid.innerHTML = "<p class='loading-text'>No ATS skins found yet.</p>";
      return;
    }

       atsProductsCache = atsProducts;
    renderAtsProducts(grid, atsProductsCache, "all");
  } catch (err) {
    console.error("Product load failed:", err);
    grid.innerHTML = "<p class='loading-text'>Could not load ATS skins right now.</p>";
  }
}

let atsProductsCache = [];

document.addEventListener("click", (event) => {
  const makerBtn = event.target.closest(".mod-maker-btn");
  if (!makerBtn) return;

  const grid = document.getElementById("atsProductGrid");
  if (!grid) return;

  renderAtsProducts(grid, atsProductsCache, makerBtn.dataset.maker || "all");
});

loadProducts();