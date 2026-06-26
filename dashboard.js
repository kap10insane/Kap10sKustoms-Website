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

<form id="productForm" class="dashboard-form hidden">

  <h2>New Product</h2>

  <div class="form-row">
    <label>
      Product ID
      <input name="id" type="text" required>
    </label>

    <label>
      Name
      <input name="name" type="text" required>
    </label>
  </div>

  <div class="form-row">
    <label>
      Slug
      <input name="slug" type="text" required>
    </label>

    <label>
      Category
      <input name="category" type="text" required>
    </label>
  </div>

  <div class="form-row">
    <label>
      Price
      <input name="price" type="number" step="0.01">
    </label>

    <label>
      Version
      <input name="version" type="text">
    </label>
  </div>

  <div class="form-row">
    <label>
      Image Path
      <input name="image" type="text">
    </label>

    <label>
      Download File
      <input name="download_file" type="text">
    </label>
  </div>

  <label>
    Description
    <textarea name="description" rows="6"></textarea>
  </label>

  <label>
    <input name="active" type="checkbox" checked>
    Active / Published
  </label>

  <div class="dashboard-form-actions">
    <button class="btn primary" type="submit">
      Save Product
    </button>

    <button class="btn secondary" type="button" id="cancelProductBtn">
      Cancel
    </button>
  </div>

</form>