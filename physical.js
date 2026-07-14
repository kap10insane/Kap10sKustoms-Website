const API_BASE =
  "https://kap10skustoms-api.kap10skustoms.workers.dev";

function productImage(product) {
  return (
    product.image ||
    product.image_url ||
    "images/kap10-logo-round.png"
  );
}

function productPrice(product) {
  return Number(product.price || 0).toFixed(2);
}

function productStockLabel(product) {
  if (!product.track_inventory) {
    return product.stock_status === "out_of_stock"
      ? "Out of Stock"
      : "Available";
  }

  const quantity = Number(product.inventory_quantity || 0);

  if (quantity > 0) {
    return "In Stock";
  }

  if (product.allow_backorders) {
    return "Available on Backorder";
  }

  return "Out of Stock";
}

function productStockClass(product) {
  if (
    product.stock_status === "out_of_stock" &&
    !product.allow_backorders
  ) {
    return "out-of-stock";
  }

  if (
    product.track_inventory &&
    Number(product.inventory_quantity || 0) <= 0 &&
    !product.allow_backorders
  ) {
    return "out-of-stock";
  }

  return "in-stock";
}

function renderPhysicalProducts(grid, products) {
  grid.innerHTML = `
    <div class="ats-storefront-stack">
      <div class="product-grid">
        ${products
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

                  <p class="physical-stock-status ${productStockClass(product)}">
                    ${productStockLabel(product)}
                  </p>

                  <div class="product-footer">
                    <span class="price">
                      $${productPrice(product)}
                    </span>

                    <a
                      class="btn primary"
                      href="physical-product.html?productId=${encodeURIComponent(
                        product.id
                      )}"
                    >
                      View Product
                    </a>
                  </div>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

async function loadPhysicalProducts() {
  const grid = document.getElementById("physicalProductGrid");

  if (!grid) return;

  grid.innerHTML =
    "<p class='loading-text'>Loading physical products...</p>";

  try {
    const response = await fetch(
      `${API_BASE}/products?type=physical`
    );

    const products = await response.json();

    console.log("Physical products API response:", products);

    if (!response.ok || !Array.isArray(products)) {
      throw new Error(
        products?.error || "Invalid products response"
      );
    }

    if (!products.length) {
      grid.innerHTML = `
        <p class="loading-text">
          No physical products are available yet.
        </p>
      `;
      return;
    }

    renderPhysicalProducts(grid, products);
  } catch (err) {
    console.error("Physical product load failed:", err);

    grid.innerHTML = `
      <div class="loading-text">
        <p>Could not load physical products right now.</p>
        <p style="font-size: 12px; opacity: .75;">
          ${err && err.message ? err.message : String(err)}
        </p>
      </div>
    `;
  }
}

loadPhysicalProducts();