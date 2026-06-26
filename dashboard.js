const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

const form = document.getElementById("productForm");
const newBtn = document.getElementById("newProductBtn");
const cancelBtn = document.getElementById("cancelProductBtn");

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

if (form && newBtn && cancelBtn) {
  form.style.display = "none";

  newBtn.addEventListener("click", () => {
    form.style.display = "block";
    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.style.display = "none";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const product = {
      id: formData.get("id"),
      name: formData.get("name"),
      slug: formData.get("slug"),
      category: formData.get("category"),
      price: Number(formData.get("price") || 0),
      version: formData.get("version"),
      image: formData.get("image"),
      download_file: formData.get("download_file"),
      description: formData.get("description"),
      active: formData.get("active") === "on"
    };

    try {
      const response = await fetch(`${API_BASE}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      });

      const data = await response.json();

      if (!data.ok) {
        alert(data.error || "Product save failed.");
        return;
      }

      alert("Product saved.");

      form.reset();
      form.style.display = "none";

      loadDashboardProducts();
    } catch (err) {
      console.error(err);
      alert("Product save failed.");
    }
  });
}

loadDashboardProducts();