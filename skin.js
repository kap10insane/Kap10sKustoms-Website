async function loadSkin() {
  const container = document.getElementById("skinDetail");
  const params = new URLSearchParams(window.location.search);
  const productPath = params.get("product");

  if (!productPath) {
    container.innerHTML = "<h2>Product not found.</h2>";
    return;
  }

  try {
    const response = await fetch(`images/ats/${productPath}/product.json`);

    if (!response.ok) {
      throw new Error("Product JSON could not be loaded.");
    }

    const product = await response.json();

    container.innerHTML = `
      <div class="skin-page">
        <div class="skin-gallery">
          <img
            id="mainImage"
            class="hero-image"
            src="images/ats/${productPath}/${product.images[0]}"
            alt="${product.name}"
          >

          <div class="thumbnail-row">
            ${product.images.map(image => `
              <img
                class="thumb"
                src="images/ats/${productPath}/${image}"
                alt="${product.name} preview"
                onclick="document.getElementById('mainImage').src='images/ats/${productPath}/${image}'"
              >
            `).join("")}
          </div>
        </div>

        <div class="skin-info">
          <h1>${product.name}</h1>

          <p>${product.description}</p>

          <hr>

          <div class="product-detail">
            <strong>Truck</strong>
            <span>${product.truck}</span>
          </div>

          <div class="product-detail">
            <strong>Game</strong>
            <span>${product.game}</span>
          </div>

          <div class="product-detail">
  <strong>Category</strong>
  <span>${product.category}</span>
</div>


          <hr>

          <div class="info-block">
  <h3>Compatible</h3>
  <ul>
    ${product.compatibility.map(item => `<li class="check-item">${item}</li>`).join("")}
  </ul>
</div>

<div class="info-block">
  <h3>Included</h3>
  <ul>
    ${product.includes.map(item => `<li class="check-item">${item}</li>`).join("")}
  </ul>
</div>

<div class="info-block">
  <h3>Requirements</h3>
  <ul>
    ${product.requirements.map(item => `<li class="check-item">${item}</li>`).join("")}
  </ul>
</div>

          <hr>

          <h2>$${product.price.toFixed(2)} USD</h2>

<a class="btn primary buy-btn" href="${product.checkoutLink || "#"}">
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

loadSkin();