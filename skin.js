const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

function productImage(product) {
  return product.image || product.image_url || "images/kap10-logo-round.png";
}

function productPrice(product) {
  return Number(product.price || 0).toFixed(2);
}

function getGalleryImages(product) {
  let filenames = [];

  try {
    filenames = product.gallery ? JSON.parse(product.gallery) : [];
  } catch (err) {
    filenames = [];
  }

  if (!Array.isArray(filenames) || !filenames.length) {
    filenames = ["hero.jpg"];
  }

  const truckFolder = product.truck_folder || "";
  const imageFolder = product.image_folder || "";

  if (!truckFolder || !imageFolder) {
    return [productImage(product)];
  }

  return filenames.map((filename) =>
    `images/ats/${truckFolder}/${imageFolder}/${filename}`
  );
}

function renderList(items) {
  if (!Array.isArray(items) || !items.length) {
    return "<li class='check-item'>Included with download</li>";
  }

  return items.map(item => `<li class="check-item">${item}</li>`).join("");
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

    const galleryImages = getGalleryImages(product);
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
              ${renderList(product.includes)}
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
            <div>✓ Instant Digital Download</div>
            <div>✓ Secure Checkout</div>
            <div>✓ Support Available</div>
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