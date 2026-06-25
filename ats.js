async function loadProducts() {
  const grid = document.getElementById("atsProductGrid");

  if (!grid) return;

  grid.innerHTML = "<p class='loading-text'>Loading ATS skins...</p>";

  let html = "";

  for (const truck of atsCatalog) {
    html += `
      <section class="truck-section">
        <h2 class="truck-title">${truck.truckName}</h2>
        <div class="product-grid">
    `;

    for (const folder of truck.products) {
      const path = `${truck.truckFolder}/${folder}`;

      try {
        const response = await fetch(`images/ats/${path}/product.json`);

        if (!response.ok) {
          throw new Error(`Could not load product.json for ${path}`);
        }

        const product = await response.json();

        html += `
          <article class="product-card">
            <img
              class="product-image"
              src="images/ats/${path}/${product.images[0]}"
              alt="${product.name}"
            >

            <div class="product-info">
              <h3>${product.name}</h3>

              <p>${product.description}</p>

              <div class="product-footer">
                <span class="price">$${product.price}</span>

                <a class="btn primary" href="skin.html?product=${encodeURIComponent(path)}">
                  View Skin
                </a>
              </div>
            </div>
          </article>
        `;
      } catch (err) {
        console.error("Product load failed:", path, err);
      }
    }

    html += `
        </div>
      </section>
    `;
  }

  grid.innerHTML = html || "<p class='loading-text'>No ATS skins found yet.</p>";
}

loadProducts();