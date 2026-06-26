const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

async function loadDashboardProducts() {
  const el = document.getElementById("dashboardProducts");

  if (!el) return;

  el.textContent = "Loading products...";

  try {
    const response = await fetch(`${API_BASE}/admin/products`);
    const data = await response.json();

    if (!data.ok || !Array.isArray(data.products)) {
      throw new Error("Invalid product response");
    }

    if (!data.products.length) {
      el.innerHTML = "<p>No products found.</p>";
      return;
    }

    el.innerHTML = data.products.map((product) => `
      <article class="dashboard-product-row">
        <div>
          <h3>${product.name}</h3>
          <p>${product.id}</p>
        </div>

        <div>
          <strong>$${Number(product.price || 0).toFixed(2)}</strong>
          <span>${product.category || "Uncategorized"}</span>
        </div>

        <div>
          <span class="status-pill ${product.active ? "active" : "inactive"}">
            ${product.active ? "Active" : "Inactive"}
          </span>
        </div>

        <div class="dashboard-row-actions">
          <button type="button" class="btn secondary">Edit</button>
        </div>
      </article>
    `).join("");
  } catch (err) {
    console.error(err);
    el.innerHTML = "<p>Could not load products.</p>";
  }
}

loadDashboardProducts();