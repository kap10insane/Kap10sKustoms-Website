const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

function productImage(product) {
  return product.image || product.image_url || "images/kap10-logo-round.png";
}

function productPrice(product) {
  const price = Number(product.price || 0);

  return price === 0
    ? "FREE"
    : `$${price.toFixed(2)}`;
}

function digitalCategory(product) {
  const platform = String(product.platform || "").trim().toLowerCase();

  if (platform === "stl") {
    return "stl";
  }

  if (platform === "laser") {
    return "laser";
  }

  return "other";
}

function renderDigitalProducts(grid, products, selectedCategory = "all") {
  const visibleProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (product) => digitalCategory(product) === selectedCategory
        );

  grid.innerHTML = `
    <div class="ats-storefront-stack">
      <div class="mod-maker-filter">
        <p class="filter-label">Browse Digital Files</p>

        <div class="mod-maker-buttons">
          <button
            type="button"
            class="mod-maker-btn ${selectedCategory === "all" ? "active" : ""}"
            data-digital-category="all"
          >
            All
          </button>

          <button
            type="button"
            class="mod-maker-btn ${selectedCategory === "stl" ? "active" : ""}"
            data-digital-category="stl"
          >
            3D Print Files
          </button>

          <button
            type="button"
            class="mod-maker-btn ${selectedCategory === "laser" ? "active" : ""}"
            data-digital-category="laser"
          >
            Laser Files
          </button>

          <button
            type="button"
            class="mod-maker-btn ${selectedCategory === "other" ? "active" : ""}"
            data-digital-category="other"
          >
            Other
          </button>
        </div>
      </div>

      <div class="product-grid">
        ${
          visibleProducts.length
            ? visibleProducts
                .map(
                  (product) => `
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
                <span class="price">${productPrice(product)}</span>

                <a
                  class="btn primary"
                  href="digital-product.html?productId=${encodeURIComponent(product.id)}"
                >
                  View File
                </a>
              </div>
            </div>
          </article>
        `
                )
                .join("")
            : `<p class="loading-text">No files found in this category yet.</p>`
        }
      </div>
    </div>
  `;
}

async function loadProducts() {
  const grid = document.getElementById("digitalProductGrid");

  if (!grid) return;

  grid.innerHTML =
    "<p class='loading-text'>Loading digital files...</p>";

  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();

    console.log("Digital products API response:", products);

    if (!Array.isArray(products)) {
      throw new Error("Invalid products response");
    }

    const digitalProducts = products.filter((product) => {
      const productType = String(
        product.product_type || ""
      )
        .trim()
        .toLowerCase();

      const platform = String(
        product.platform || ""
      )
        .trim()
        .toLowerCase();

      return (
        productType === "digital" &&
        ["stl", "laser", "universal"].includes(platform)
      );
    });

    if (!digitalProducts.length) {
      grid.innerHTML =
        "<p class='loading-text'>No digital files found yet.</p>";
      return;
    }

    digitalProductsCache = digitalProducts;

    renderDigitalProducts(
      grid,
      digitalProductsCache,
      "all"
    );
  } catch (err) {
    console.error("Digital product load failed:", err);

    grid.innerHTML = `
      <div class="loading-text">
        <p>Could not load digital files right now.</p>
        <p style="font-size: 12px; opacity: .75;">
          ${err && err.message ? err.message : String(err)}
        </p>
      </div>
    `;
  }
}

let digitalProductsCache = [];

document.addEventListener("click", (event) => {
  const categoryBtn = event.target.closest(
    "[data-digital-category]"
  );

  if (!categoryBtn) return;

  const grid = document.getElementById(
    "digitalProductGrid"
  );

  if (!grid) return;

  renderDigitalProducts(
    grid,
    digitalProductsCache,
    categoryBtn.dataset.digitalCategory || "all"
  );
});

loadProducts();