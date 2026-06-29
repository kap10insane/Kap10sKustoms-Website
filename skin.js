const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

function productImage(product) {
  return product.image || product.image_url || "images/kap10-logo-round.png";
}

function productPrice(product) {
  return Number(product.price || 0).toFixed(2);
}

async function getGalleryImages(product) {
  try {
    const response = await fetch(
      `${API_BASE}/products/${encodeURIComponent(product.id)}/images`
    );

    const data = await response.json();

    if (response.ok && data.ok && Array.isArray(data.images) && data.images.length) {
      const hero = data.images.find((image) => image.type === "hero");
      const gallery = data.images.filter((image) => image.type === "gallery");

      return [
        ...(hero?.url ? [hero.url] : []),
        ...gallery.map((image) => image.url).filter(Boolean)
      ];
    }
  } catch (err) {
    console.error("Product images failed to load:", err);
  }

  return [productImage(product)];
}

function renderList(items) {
  const fallbackItems = [
    "Skin file (.scs)",
    "Instant digital download",
    "Future updates when available",
    "Basic installation support"
  ];

  const list = String(items || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const finalItems = list.length ? list : fallbackItems;

  return finalItems
    .map((item) => `<li class="check-item">${item}</li>`)
    .join("");
}

async function getProductById(productId) {
  const response = await fetch(`${API_BASE}/products`);
  const products = await response.json();

  if (!Array.isArray(products)) {
    throw new Error("Invalid products response.");
  }

  return products.find(product => product.id === productId);
}

async function loadSkin() {
  const container = document.getElementById("skinDetail");
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("productId");

  if (!container) return;

  if (!productId) {
    container.innerHTML = "<h2>Product not found.</h2>";
    return;
  }

  try {
    const product = await getProductById(productId);

    if (!product) {
      container.innerHTML = "<h2>Product not found.</h2>";
      return;
    }

    const galleryImages = await getGalleryImages(product);
const image = galleryImages[0];

    container.innerHTML = `
      <div class="skin-page">
        <div class="skin-gallery">
  <img
    id="mainImage"
    class="hero-image"
    src="${image}"
    alt="${product.name}"
  >

  <div class="thumbnail-row">
    ${galleryImages.map((galleryImage) => `
      <img
        class="thumb"
        src="${galleryImage}"
        alt="${product.name} preview"
        onclick="document.getElementById('mainImage').src='${galleryImage}'"
      >
    `).join("")}
  </div>
</div>

        <div class="skin-info">
          <h1>${product.name}</h1>

          <p>${product.description || ""}</p>

          <hr>

          <div class="product-detail">
            <strong>Category</strong>
            <span>${product.category || "Digital Product"}</span>
          </div>

          <div class="product-detail">
            <strong>Version</strong>
            <span>${product.version || "Current"}</span>
          </div>

          <hr>

          <div class="info-block">
            <h3>Included</h3>
            <ul>
              ${renderList(product.included)}
            </ul>
          </div>

          <hr>

          <h2>$${productPrice(product)} USD</h2>

          <a
            class="btn primary buy-btn"
            href="#"
            id="buyNowButton"
            data-product-id="${product.id}"
          >
            Buy Now
          </a>

          <div class="trust-list">
  <div>✓ Secure Stripe Checkout</div>
  <div>✓ Instant Download After Purchase</div>
  <div>✓ Free Updates for This Product</div>
</div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = "<h2>Unable to load this product.</h2>";
  }
}

document.addEventListener("click", async (event) => {
  const buyNowButton = event.target.closest("#buyNowButton");
  if (!buyNowButton) return;

  event.preventDefault();

  const productId = buyNowButton.dataset.productId;

  buyNowButton.textContent = "Opening Checkout...";
  buyNowButton.style.pointerEvents = "none";

  try {
    const checkoutResponse = await fetch(`${API_BASE}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ productId })
    });

    const checkoutData = await checkoutResponse.json();

    if (!checkoutData.ok || !checkoutData.checkoutUrl) {
      throw new Error("Checkout URL missing.");
    }

    window.location.href = checkoutData.checkoutUrl;
  } catch (err) {
    console.error(err);
    alert("Checkout could not be started. Please try again.");
    buyNowButton.textContent = "Buy Now";
    buyNowButton.style.pointerEvents = "auto";
  }
});

loadSkin();