const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";


const form = document.getElementById("productForm");
const newBtn = document.getElementById("newProductBtn");
const cancelBtn = document.getElementById("cancelProductBtn");
const logoutBtn = document.getElementById("logoutBtn");
let dashboardProductsCache = [];
let dashboardProductFilter = "active";
let editingProductId = null;

async function loadCategories() {
  const select = document.getElementById("productCategorySelect");

  if (!select) return;

  try {
    const response = await fetch(`${API_BASE}/admin/categories`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error("Failed to load categories.");
    }

    select.innerHTML = data.categories
      .filter(category => category.active)
      .map(category => `
        <option value="${category.name}">
          ${category.name}
        </option>
      `)
      .join("");

  } catch (err) {
    console.error(err);

    select.innerHTML = `
      <option value="">
        Unable to load categories
      </option>
    `;
  }
}

async function loadPlatforms() {
  const select = document.getElementById("productPlatformSelect");

  if (!select) return;

  try {
    const response = await fetch(`${API_BASE}/admin/platforms`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error("Failed to load platforms.");
    }

    select.innerHTML = data.platforms
      .filter(platform => platform.active)
      .map(platform => `
        <option value="${platform.name}">
          ${platform.name}
        </option>
      `)
      .join("");

  } catch (err) {
    console.error(err);

    select.innerHTML =
      `<option value="">Unable to load platforms</option>`;
  }
}

async function loadPurchaseTypes() {
  const select = document.getElementById("productPurchaseTypeSelect");

  if (!select) return;

  try {
    const response = await fetch(`${API_BASE}/admin/purchase-types`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error("Failed to load purchase types.");
    }

    select.innerHTML = data.purchaseTypes
      .filter(type => type.active)
      .map(type => `
        <option value="${type.name}">
          ${type.name}
        </option>
      `)
      .join("");

  } catch (err) {
    console.error(err);

    select.innerHTML =
      `<option value="">Unable to load purchase types</option>`;
  }
}

async function loadCategoryList() {
  const el = document.getElementById("categoryList");
  if (!el) return;

  el.textContent = "Loading categories...";

  try {
    const response = await fetch(`${API_BASE}/admin/categories`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error("Failed to load category list.");
    }

    el.innerHTML = data.categories.map((category) => {
      const actionButton = category.active
        ? `
          <button
            class="dashboard-button danger"
            onclick="archiveCategory('${category.id}')">
            Archive
          </button>
        `
        : `
          <button
            class="dashboard-button"
            onclick="restoreCategory('${category.id}')">
            Restore
          </button>
        `;

      return `
        <article class="dashboard-product-row">
          <div>
            <h3>${category.name}</h3>
            <p>${category.slug}</p>
          </div>

          <div>
            <strong>Order ${category.sort_order}</strong>
          </div>

          <div>
            <span class="status-pill ${category.active ? "active" : "inactive"}">
              ${category.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div class="dashboard-actions">
            <button
              class="dashboard-button secondary"
              onclick="editCategory('${category.id}')">
              Edit
            </button>

            ${actionButton}
          </div>
        </article>
      `;
    }).join("");
  } catch (err) {
    console.error(err);
    el.innerHTML = "<p>Could not load categories.</p>";
  }
}

async function archiveCategory(categoryId) {
  if (!confirm("Archive this category?")) return;

  const response = await fetch(
    `${API_BASE}/admin/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "DELETE",
      credentials: "include"
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    alert(data.error || "Unable to archive category.");
    return;
  }

  await loadCategoryList();
  await loadCategories();
}
  
async function restoreCategory(categoryId) {
  const response = await fetch(
    `${API_BASE}/admin/categories/${encodeURIComponent(categoryId)}/restore`,
    {
      method: "POST",
      credentials: "include"
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    alert(data.error || "Unable to restore category.");
    return;
  }

  await loadCategoryList();
  await loadCategories();
}

async function loadDashboardProducts() {
  const el = document.getElementById("dashboardProducts");

  if (!el) return;

  el.textContent = "Loading products...";

  try {
    const response = await fetch(`${API_BASE}/admin/products`, {
  credentials: "include"
});
    const data = await response.json();

    if (!data.ok || !Array.isArray(data.products)) {
      throw new Error("Invalid product response");
    }

    const visibleProducts = data.products.filter((product) => {
  if (dashboardProductFilter === "active") return product.active;
  if (dashboardProductFilter === "archived") return !product.active;
  return true;
});

dashboardProductsCache = visibleProducts;

document.querySelectorAll(".product-filter-btn").forEach((btn) => {
  btn.classList.toggle(
    "active",
    btn.dataset.filter === dashboardProductFilter
  );
});

if (!visibleProducts.length) {
      el.innerHTML = "<p>No products found.</p>";
      return;
    }

    el.innerHTML = visibleProducts.map((product) => `
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
  <button
    type="button"
    class="btn secondary edit-product-btn"
    data-product-id="${product.id}"
  >
    Edit
  </button>

  <button
    type="button"
    class="btn danger delete-product-btn"
    data-product-id="${product.id}"
  >
    Delete
  </button>
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

    const truckFolder = String(formData.get("truck_folder") || "").trim();
const imageFolder = String(formData.get("image_folder") || "").trim();

const imagePath =
  truckFolder && imageFolder
    ? `images/ats/${truckFolder}/${imageFolder}/hero.jpg`
    : "";

const product = {
  id: formData.get("id"),
  name: formData.get("name"),
  slug: formData.get("slug"),
  category: formData.get("category"),
platform: formData.get("platform"),
purchase_type: formData.get("purchase_type"),
price: Number(formData.get("price") || 0),
  version: formData.get("version"),
  image: imagePath,
  truck_folder: truckFolder,
  image_folder: imageFolder,
  gallery: JSON.stringify(["hero.jpg", "rear.jpg", "drv.jpg", "pass.jpg"]),
  download_file: formData.get("download_file"),
  description: formData.get("description"),
  active: formData.get("active") === "on"
};

    try {
      const url = editingProductId
  ? `${API_BASE}/admin/products/${encodeURIComponent(editingProductId)}`
  : `${API_BASE}/admin/products`;

const method = editingProductId ? "PUT" : "POST";

console.log("Saving product", {
  editingProductId,
  method,
  url,
  product
});

const response = await fetch(url, {
  method,
  credentials: "include",
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

      editingProductId = null;

      form.reset();
      form.style.display = "none";

      loadDashboardProducts();
    } catch (err) {
      console.error(err);
      alert("Product save failed.");
    }
  });
}

document.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-product-btn");
  if (!editButton) return;

  const product = dashboardProductsCache.find(
    p => p.id === editButton.dataset.productId
  );

  if (!product) return;

  editingProductId = product.id;

form.id.value = product.id;
form.name.value = product.name || "";
form.slug.value = product.slug || "";
form.category.value = product.category || "";
form.platform.value = product.platform || "";
form.purchase_type.value = product.purchase_type || "";
form.price.value = product.price || 0;
form.version.value = product.version || "";
form.truck_folder.value = product.truck_folder || "";
form.image_folder.value = product.image_folder || "";
form.download_file.value = product.download_file || "";
form.description.value = product.description || "";
form.active.checked = !!product.active;

  form.style.display = "block";

  form.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

document.addEventListener("click", async (event) => {
  const deleteBtn = event.target.closest(".delete-product-btn");
  if (!deleteBtn) return;

  const productId = deleteBtn.dataset.productId;

  const confirmed = confirm(
    `Hide "${productId}" from the store?\n\nThis can be restored later.`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_BASE}/admin/products/${encodeURIComponent(productId)}`,
      {
  method: "DELETE",
  credentials: "include"
}
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Delete failed.");
    }

    
    await loadDashboardProducts();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

document.addEventListener("click", (event) => {
  const filterBtn = event.target.closest(".product-filter-btn");
  if (!filterBtn) return;

  dashboardProductFilter = filterBtn.dataset.filter;

document.querySelectorAll(".product-filter-btn").forEach((btn) => {
  btn.classList.toggle("active", btn.dataset.filter === dashboardProductFilter);
});

loadDashboardProducts();
});

document.querySelectorAll(".product-filter-btn").forEach((btn) => {
  btn.classList.toggle(
    "active",
    btn.dataset.filter === dashboardProductFilter
  );
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }

    window.location.href = "https://kap10skustoms.com/";
  });
}

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-dashboard-tab]");
  if (!tab) return;

  const target = tab.dataset.dashboardTab;

  document.querySelectorAll("[data-dashboard-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn === tab);
  });

  document.querySelectorAll("[data-dashboard-panel]").forEach((panel) => {
    panel.classList.toggle(
      "active",
      panel.dataset.dashboardPanel === target
    );
  });
});

const categoryModal = document.getElementById("categoryModal");
const newCategoryBtn = document.getElementById("newCategoryBtn");
const cancelCategoryBtn = document.getElementById("cancelCategoryBtn");
const closeCategoryModalBtn = document.getElementById("closeCategoryModalBtn");
const saveCategoryBtn = document.getElementById("saveCategoryBtn");
const categoryNameInput = document.getElementById("categoryName");
const categorySlugInput = document.getElementById("categorySlug");
const categorySortOrderInput = document.getElementById("categorySortOrder");

function openCategoryModal() {
  

  if (!categoryModal) return;
  categoryModal.classList.remove("hidden");
}

function closeCategoryModal() {
  if (!categoryModal) return;
  categoryModal.classList.add("hidden");
}

async function saveCategory() {
  const category = {
    name: categoryNameInput.value.trim(),
    slug: categorySlugInput.value.trim(),
    sort_order: Number(categorySortOrderInput.value || 0)
  };

  if (!category.name || !category.slug) {
    alert("Category name and slug are required.");
    return;
  }

  const response = await fetch(`${API_BASE}/admin/categories`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(category)
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    alert(data.error || "Unable to save category.");
    return;
  }

  categoryNameInput.value = "";
  categorySlugInput.value = "";
  categorySortOrderInput.value = "0";

  closeCategoryModal();

  await loadCategoryList();
  await loadCategories();
}

if (newCategoryBtn) {
  newCategoryBtn.addEventListener("click", openCategoryModal);
}

if (cancelCategoryBtn) {
  cancelCategoryBtn.addEventListener("click", closeCategoryModal);
}

if (closeCategoryModalBtn) {
  closeCategoryModalBtn.addEventListener("click", closeCategoryModal);
}

if (saveCategoryBtn) {
  saveCategoryBtn.addEventListener("click", saveCategory);
}

loadCategories();
loadPlatforms();
loadPurchaseTypes();
loadCategoryList();
loadDashboardProducts();