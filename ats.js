const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

function productImage(product) {
  return product.image || product.image_url || "images/kap10-logo-round.png";
}

function productPrice(product) {
  return Number(product.price || 0).toFixed(2);
}

async function loadProducts() {
  const grid = document.getElementById("atsProductGrid");

  if (!grid) return;

  grid.innerHTML = "<p class='loading-text'>Loading ATS skins...</p>";

  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();

    if (!Array.isArray(products)) {
      throw new Error("Invalid products response");
    }

    const atsProducts = products.filter((product) => {
      const category = String(product.category || "").toLowerCase();
      return category.includes("truck skin") || category.includes("ats");
    });

    if (!atsProducts.length) {
      grid.innerHTML = "<p class='loading-text'>No ATS skins found yet.</p>";
      return;
    }

    grid.innerHTML = `
      <div class="product-grid">
        ${atsProducts.map((product) => `
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
    `;
  } catch (err) {
    console.error("Product load failed:", err);
    grid.innerHTML = "<p class='loading-text'>Could not load ATS skins right now.</p>";
  }
}

loadProducts();