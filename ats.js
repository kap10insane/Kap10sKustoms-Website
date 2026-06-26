const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

function formatPrice(cents, fallbackPrice) {
  if (typeof cents === "number") {
    return (cents / 100).toFixed(2);
  }

  if (fallbackPrice !== undefined && fallbackPrice !== null) {
    return String(fallbackPrice);
  }

  return "0.00";
}

function getProductImage(product) {
  return (
    product.image_url ||
    product.imageUrl ||
    product.thumbnail_url ||
    product.thumbnailUrl ||
    product.cover_image ||
    product.coverImage ||
    "images/kap10-logo-round.png"
  );
}

function getProductName(product) {
  return product.name || product.title || "Untitled Product";
}

function getProductDescription(product) {
  return product.description || "Kap10's Kustoms digital download.";
}

function getProductId(product) {
  return product.id || product.product_id || product.productId || "";
}

async function loadProducts() {
  const grid = document.getElementById("atsProductGrid");

  if (!grid) return;

  grid.innerHTML = "<p class='loading-text'>Loading ATS skins...</p>";

  try {
    const response = await fetch(`${API_BASE}/products`);

    if (!response.ok) {
      throw new Error("Could not load products from API.");
    }

    const products = await response.json();

    const atsProducts = Array.isArray(products)
      ? products.filter((product) => {
          const category = String(product.category || product.type || "").toLowerCase();
          return !category || category.includes("ats") || category.includes("skin");
        })
      : [];

    if (!atsProducts.length) {
      grid.innerHTML = "<p class='loading-text'>No ATS skins found yet.</p>";
      return;
    }

    grid.innerHTML = atsProducts
      .map((product) => {
        const productId = getProductId(product);
        const name = getProductName(product);
        const description = getProductDescription(product);
        const image = getProductImage(product);
        const price = formatPrice(product.price_cents, product.price);

        return `
          <article class="product-card">
            <img
              class="product-image"
              src="${image}"
              alt="${name}"
            >

            <div class="product-info">
              <h3>${name}</h3>

              <p>${description}</p>

              <div class="product-footer">
                <span class="price">$${price}</span>

                <a class="btn primary" href="skin.html?productId=${encodeURIComponent(productId)}">
                  View Skin
                </a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Product load failed:", err);
    grid.innerHTML = "<p class='loading-text'>Could not load ATS skins right now.</p>";
  }
}

loadProducts();