const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";


const form = document.getElementById("productForm");
const newBtn = document.getElementById("newProductBtn");
const cancelBtn = document.getElementById("cancelProductBtn");
const logoutBtn = document.getElementById("logoutBtn");
let dashboardProductsCache = [];
let dashboardCategoriesCache = [];
let dashboardPlatformsCache = [];
let dashboardProductFilter = "active";
let editingProductId = null;
let editingCategoryId = null;
let editingPlatformId = null;

function updateProductTypeFields() {
  const productType = form?.product_type?.value || "digital";

  const digitalVersionField = document.getElementById("digitalVersionField");
  const digitalDownloadSection = document.getElementById("digitalDownloadSection");
  const physicalProductSection = document.getElementById("physicalProductSection");
  const productCategoryLabel = document.getElementById("productCategoryLabel");

  const showDigitalFields = productType === "digital";

  if (digitalVersionField) {
    digitalVersionField.style.display = showDigitalFields ? "" : "none";
  }

  if (physicalProductSection) {
  physicalProductSection.style.display =
    productType === "physical" ? "" : "none";
}

  if (digitalDownloadSection) {
    digitalDownloadSection.style.display = showDigitalFields ? "" : "none";
  }

  if (productCategoryLabel) {
    switch (productType) {
      case "physical":
        productCategoryLabel.textContent = "Category";
        break;

      case "custom":
        productCategoryLabel.textContent = "Service Category";
        break;

      default:
        productCategoryLabel.textContent = "Mod Maker";
        break;
    }
  }
}

if (form?.product_type) {
  form.product_type.addEventListener("change", updateProductTypeFields);
}

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

    dashboardCategoriesCache = data.categories;

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

  try {
    const response = await fetch(`${API_BASE}/admin/platforms`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error("Failed to load platforms.");
    }

    dashboardPlatformsCache = data.platforms || [];

    if (select) {
      select.innerHTML = dashboardPlatformsCache
        .filter(platform => platform.active)
        .map(platform => `
          <option value="${platform.name}">
            ${platform.name}
          </option>
        `)
        .join("");
    }

  } catch (err) {
    console.error(err);

    if (select) {
      select.innerHTML =
        `<option value="">Unable to load platforms</option>`;
    }
  }
}

async function loadPlatformList() {
  const el = document.getElementById("platformList");
  if (!el) return;

  el.textContent = "Loading platforms...";

  try {
    const response = await fetch(`${API_BASE}/admin/platforms`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error("Failed to load platform list.");
    }

    dashboardPlatformsCache = data.platforms;

    el.innerHTML = data.platforms.map((platform) => {
      const actionButton = platform.active
        ? `
          <button
            class="dashboard-button danger"
            onclick="archivePlatform('${platform.id}')">
            Archive
          </button>
        `
        : `
          <button
            class="dashboard-button"
            onclick="restorePlatform('${platform.id}')">
            Restore
          </button>
        `;

      return `
        <article class="dashboard-product-row">
          <div>
            <h3>${platform.name}</h3>
            <p>${platform.slug}</p>
          </div>

          <div>
            <strong>Order ${platform.sort_order}</strong>
          </div>

          <div>
            <span class="status-pill ${platform.active ? "active" : "inactive"}">
              ${platform.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div class="dashboard-actions">
            <button
              class="dashboard-button secondary"
              onclick="editPlatform('${platform.id}')">
              Edit
            </button>

            ${actionButton}
          </div>
        </article>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    el.innerHTML = "<p>Could not load platforms.</p>";
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
  const searchInput = document.getElementById("productSearchInput");

  if (!el) return;

  el.textContent = "Loading products...";

  try {
    const response = await fetch(`${API_BASE}/admin/products`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok || !data.ok || !Array.isArray(data.products)) {
      throw new Error(data.error || "Invalid product response");
    }

    let visibleProducts = data.products.filter((product) => {
      if (dashboardProductFilter === "active") return product.active;
      if (dashboardProductFilter === "archived") return !product.active;
      return true;
    });

    const searchTerm = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    if (searchTerm) {
      visibleProducts = visibleProducts.filter((product) => {
        return [
          product.name,
          product.id,
          product.slug,
          product.category,
          product.platform
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm);
      });
    }

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
  <div
    class="product-list-item"
    data-product-id="${product.id}"
  >
    <button
      type="button"
      class="product-list-open"
      data-product-id="${product.id}"
    >
      <div class="product-list-thumb">
        ${
          product.image && product.image.startsWith("http")
            ? `<img src="${product.image}" alt="">`
            : "📦"
        }
      </div>

      <div class="product-list-main">
        <strong>${product.name}</strong>
        <span>${product.category || "Uncategorized"}</span>
        <small>${product.platform || "No platform"}</small>
      </div>

      <div class="product-list-meta">
        <strong>$${Number(product.price || 0).toFixed(2)}</strong>
        <span class="${product.active ? "status-active" : "status-archived"}">
          ${product.active ? "Active" : "Archived"}
        </span>
      </div>
    </button>

    <button
      type="button"
      class="product-delete-btn"
      data-product-id="${product.id}"
      data-product-name="${product.name}"
    >
      Delete
    </button>
  </div>
`).join("");

  } catch (err) {
    console.error(err);
    el.innerHTML = "<p>Could not load products.</p>";
  }
}

function renderProductEditor(product) {
  const panel = document.getElementById("productEditorPanel");
  if (!panel || !form) return;

  editingProductId = product ? product.id : null;

  resetUploadPreviews();

  panel.innerHTML = "";

  panel.appendChild(form);

  form.classList.remove("hidden");
  form.style.display = "block";

  if (product) {
    form.querySelector("h2").textContent = product.name || "Product Details";

    form.id.value = product.id || "";
    form.name.value = product.name || "";
    form.slug.value = product.slug || "";
    form.category.value = product.category || "";
    form.product_type.value = product.product_type || "digital";
    form.platform.value = product.platform || "";
    form.price.value = product.price || 0;
    form.version.value = product.version || "";
    form.truck_folder.value = product.truck_folder || "";
    form.image_folder.value = product.image_folder || "";
    form.download_file.value = product.download_file || "";
        form.description.value = product.description || "";
form.included.value = product.included || "";

// Physical Product Fields
form.sku.value = product.sku || "";
form.inventory_quantity.value = product.inventory_quantity ?? 0;
form.track_inventory.checked = !!product.track_inventory;
form.allow_backorders.checked = !!product.allow_backorders;

form.weight.value = product.weight ?? "";
form.length.value = product.length ?? "";
form.width.value = product.width ?? "";
form.height.value = product.height ?? "";

form.shipping_class.value = product.shipping_class || "";
form.stock_status.value = product.stock_status || "in_stock";

form.active.checked = !!product.active;

    loadProductImages(product.id)
      .then(renderLoadedProductImages)
      .catch((err) => {
        console.error(err);
      });
          loadProductDownload(product.id)
      .then(renderLoadedProductDownload)
      .catch((err) => {
        console.error(err);
      });
    } else {
    form.querySelector("h2").textContent = "New Product";
    form.reset();

form.product_type.value = "digital";

form.sku.value = "";
form.inventory_quantity.value = 0;
form.track_inventory.checked = false;
form.allow_backorders.checked = false;

form.weight.value = "";
form.length.value = "";
form.width.value = "";
form.height.value = "";

form.shipping_class.value = "";
form.stock_status.value = "in_stock";

form.active.checked = true;
  }

  updateProductTypeFields();
}

if (form && newBtn && cancelBtn) {
  form.style.display = "none";

  newBtn.addEventListener("click", () => {
  document.querySelectorAll(".product-list-item").forEach((row) => {
    row.classList.remove("selected");
  });

  renderProductEditor(null);
});

  cancelBtn.addEventListener("click", () => {
  editingProductId = null;
  form.reset();
  form.style.display = "none";

  const panel = document.getElementById("productEditorPanel");
  if (panel) {
    panel.innerHTML = `
      <div class="product-editor-empty">
        <h2>Select a product</h2>
        <p>Choose a product from the list on the left or create a new one.</p>
      </div>
    `;
  }

  document.querySelectorAll(".product-list-item").forEach((row) => {
    row.classList.remove("selected");
  });
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
  product_type: formData.get("product_type") || "digital",
  platform: formData.get("platform"),
  purchase_type: "",
  price: Number(formData.get("price") || 0),
  version: formData.get("version"),
  image: imagePath,
  truck_folder: truckFolder,
  image_folder: imageFolder,
  gallery: JSON.stringify(["hero.jpg", "rear.jpg", "drv.jpg", "pass.jpg"]),
  download_file: "",
    description: formData.get("description"),
  included: formData.get("included"),

sku: String(formData.get("sku") || "").trim(),
inventory_quantity: Number(formData.get("inventory_quantity") || 0),
track_inventory: formData.get("track_inventory") === "on",
allow_backorders: formData.get("allow_backorders") === "on",

weight: formData.get("weight")
  ? Number(formData.get("weight"))
  : null,

length: formData.get("length")
  ? Number(formData.get("length"))
  : null,

width: formData.get("width")
  ? Number(formData.get("width"))
  : null,

height: formData.get("height")
  ? Number(formData.get("height"))
  : null,

shipping_class: String(formData.get("shipping_class") || "").trim(),
stock_status: String(formData.get("stock_status") || "in_stock").trim(),

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

document.addEventListener("click", async (event) => {
  const galleryDeleteBtn = event.target.closest(".gallery-delete-btn");
  if (!galleryDeleteBtn) return;

  const thumb = galleryDeleteBtn.closest(".gallery-preview-thumb");
  const imageId = thumb?.dataset.imageId;

  if (!editingProductId || !imageId) return;

  const confirmed = confirm("Delete this gallery image?");
  if (!confirmed) return;

  try {
    await deleteProductImage(editingProductId, imageId);

    if (thumb) {
      thumb.remove();
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

document.addEventListener("click", (event) => {
  const openBtn = event.target.closest(".product-list-open");
  if (!openBtn) return;

  const item = openBtn.closest(".product-list-item");
  if (!item) return;

  const product = dashboardProductsCache.find(
    (p) => p.id === item.dataset.productId
  );

  if (!product) return;

  document.querySelectorAll(".product-list-item").forEach((row) => {
    row.classList.toggle("selected", row === item);
  });

  renderProductEditor(product);
});

document.addEventListener("click", async (event) => {
  const deleteBtn = event.target.closest(".product-delete-btn");
  if (!deleteBtn) return;

  event.preventDefault();
  event.stopPropagation();

  const productId = deleteBtn.dataset.productId;
  const productName = deleteBtn.dataset.productName || productId;

  const confirmed = confirm(
    `Permanently delete "${productName}"?\n\nThis cannot be undone.`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_BASE}/admin/products/${encodeURIComponent(productId)}/permanent`,
      {
        method: "DELETE",
        credentials: "include"
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Permanent delete failed.");
    }

    if (editingProductId === productId) {
      editingProductId = null;
      form.reset();
      form.style.display = "none";

      const panel = document.getElementById("productEditorPanel");

      if (panel) {
        panel.innerHTML = `
          <div class="product-editor-empty">
            <h2>Select a product</h2>
            <p>Choose a product from the list on the left or create a new one.</p>
          </div>
        `;
      }
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
const platformModal = document.getElementById("platformModal");
const newPlatformBtn = document.getElementById("newPlatformBtn");
const cancelPlatformBtn = document.getElementById("cancelPlatformBtn");
const closePlatformModalBtn = document.getElementById("closePlatformModalBtn");
const savePlatformBtn = document.getElementById("savePlatformBtn");
const platformNameInput = document.getElementById("platformName");
const platformSlugInput = document.getElementById("platformSlug");
const platformSortOrderInput = document.getElementById("platformSortOrder");

function openCategoryModal(category = null) {
  if (!categoryModal) return;

  const title = document.getElementById("categoryModalTitle");

  if (category) {
    editingCategoryId = category.id;
    if (title) title.textContent = "Edit Category";

    categoryNameInput.value = category.name || "";
    categorySlugInput.value = category.slug || "";
    categorySortOrderInput.value = category.sort_order || 0;
  } else {
    editingCategoryId = null;
    if (title) title.textContent = "New Category";

    categoryNameInput.value = "";
    categorySlugInput.value = "";
    categorySortOrderInput.value = "0";
  }

  categoryModal.classList.remove("hidden");
}

function closeCategoryModal() {
  if (!categoryModal) return;
  categoryModal.classList.add("hidden");
}

function openPlatformModal(platform = null) {
  if (!platformModal) return;

  const title = document.getElementById("platformModalTitle");

  if (platform) {
    editingPlatformId = platform.id;
    if (title) title.textContent = "Edit Platform";

    platformNameInput.value = platform.name || "";
    platformSlugInput.value = platform.slug || "";
    platformSortOrderInput.value = platform.sort_order || 0;
  } else {
    editingPlatformId = null;
    if (title) title.textContent = "New Platform";

    platformNameInput.value = "";
    platformSlugInput.value = "";
    platformSortOrderInput.value = "0";
  }

  platformModal.classList.remove("hidden");
}

function closePlatformModal() {
  if (!platformModal) return;
  platformModal.classList.add("hidden");
}

async function savePlatform() {
  const payload = {
    name: platformNameInput.value.trim(),
    slug: platformSlugInput.value.trim(),
    sort_order: Number(platformSortOrderInput.value || 0),
    active: true
  };

  try {
    const response = await fetch(
      editingPlatformId
        ? `${API_BASE}/admin/platforms/${encodeURIComponent(editingPlatformId)}`
        : `${API_BASE}/admin/platforms`,
      {
        method: editingPlatformId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Unable to save platform.");
    }

    closePlatformModal();

    await loadPlatforms();
    await loadPlatformList();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
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

  const url = editingCategoryId
  ? `${API_BASE}/admin/categories/${encodeURIComponent(editingCategoryId)}`
  : `${API_BASE}/admin/categories`;

const method = editingCategoryId ? "PUT" : "POST";

const response = await fetch(url, {
  method,
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

if (newPlatformBtn) {
  newPlatformBtn.addEventListener("click", () => {
    openPlatformModal();
  });
}

if (cancelPlatformBtn) {
  cancelPlatformBtn.addEventListener("click", closePlatformModal);
}

if (closePlatformModalBtn) {
  closePlatformModalBtn.addEventListener("click", closePlatformModal);
}

if (platformModal) {
  platformModal.addEventListener("click", (event) => {
    if (event.target === platformModal) {
      closePlatformModal();
    }
  });
}

if (savePlatformBtn) {
  savePlatformBtn.addEventListener("click", savePlatform);
}

function editCategory(categoryId) {
  const category = dashboardCategoriesCache.find(
    c => c.id === categoryId
  );

  if (!category) {
    alert("Category not found.");
    return;
  }

  openCategoryModal(category);
}

const productSearchInput = document.getElementById("productSearchInput");

if (productSearchInput) {
  productSearchInput.addEventListener("input", () => {
    loadDashboardProducts();
  });
}

function resetUploadPreviews() {
  const heroBox = document.getElementById("heroImageUpload")?.closest(".upload-box");
  const galleryPreviewList = document.getElementById("galleryPreviewList");
  const downloadBox = document.getElementById("downloadFileUpload")?.closest(".upload-box");

  if (heroBox) {
    heroBox.classList.remove("uploaded");
    heroBox.style.backgroundImage = "";
    heroBox.style.backgroundSize = "";
    heroBox.style.backgroundPosition = "";

    const span = heroBox.querySelector("span");
    if (span) {
      span.textContent = "Upload hero image";
    }
  }

  if (galleryPreviewList) {
    galleryPreviewList.innerHTML = "";
  }

  if (downloadBox) {
    downloadBox.classList.remove("uploaded");

    const span = downloadBox.querySelector("span");
    if (span) {
      span.textContent = "Upload .scs or .zip file";
    }
  }
}

function renderLoadedProductImages(images = []) {
  const heroBox = document.getElementById("heroImageUpload")?.closest(".upload-box");
  const galleryPreviewList = document.getElementById("galleryPreviewList");

  if (galleryPreviewList) {
    galleryPreviewList.innerHTML = "";
  }

  const heroImage = images.find((image) => image.type === "hero");
  const galleryImages = images.filter((image) => image.type === "gallery");

  if (heroBox && heroImage?.url) {
    heroBox.classList.add("uploaded");
    heroBox.style.backgroundImage = `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.65)), url("${heroImage.url}")`;
    heroBox.style.backgroundSize = "cover";
    heroBox.style.backgroundPosition = "center";

    const span = heroBox.querySelector("span");
    if (span) {
      span.textContent = `Uploaded: ${heroImage.filename}`;
    }
  }

  if (galleryPreviewList) {
    galleryImages.forEach((image) => {
  if (!image.url) return;

  const thumb = document.createElement("div");
  thumb.className = "gallery-preview-thumb";
  thumb.style.backgroundImage = `url("${image.url}")`;
  thumb.dataset.imageId = image.id;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "gallery-delete-btn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "×";

  thumb.appendChild(deleteBtn);

  galleryPreviewList.appendChild(thumb);
});
  }
}

function renderLoadedProductDownload(download) {
  const downloadBox = document.getElementById("downloadFileUpload")?.closest(".upload-box");

  if (!downloadBox || !download) return;

  downloadBox.classList.add("uploaded");

  const span = downloadBox.querySelector("span");
  if (span) {
    span.textContent = `Uploaded: ${download.filename}`;
  }
}

async function deleteProductImage(productId, imageId) {
  const response = await fetch(
    `${API_BASE}/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
    {
      method: "DELETE",
      credentials: "include"
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Image delete failed.");
  }

  return data;
}

async function loadProductImages(productId) {
  const response = await fetch(
    `${API_BASE}/admin/products/${encodeURIComponent(productId)}/images`,
    {
      credentials: "include"
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Failed to load product images.");
  }

  return data.images || [];
}

async function loadProductDownload(productId) {
  const response = await fetch(
    `${API_BASE}/admin/products/${encodeURIComponent(productId)}/downloads`,
    {
      credentials: "include"
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Failed to load product download.");
  }

  return data.download || null;
}

async function uploadProductDownload(productId, file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE}/admin/products/${encodeURIComponent(productId)}/downloads`,
    {
      method: "POST",
      credentials: "include",
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Download upload failed.");
  }

  return data;
}

async function uploadProductImage(productId, file, type = "hero") {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("type", type);

  const response = await fetch(
    `${API_BASE}/admin/products/${encodeURIComponent(productId)}/images`,
    {
      method: "POST",
      credentials: "include",
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Image upload failed.");
  }

  return data;
}

const downloadFileUpload = document.getElementById("downloadFileUpload");

if (downloadFileUpload) {
  downloadFileUpload.addEventListener("change", async (event) => {

    if (!editingProductId) {
      alert("Please select a product first.");
      return;
    }

    const file = event.target.files[0];

    if (!file) return;

    try {

      const result = await uploadProductDownload(editingProductId, file);

      const box = event.target.closest(".upload-box");

      if (box) {
        box.classList.add("uploaded");

        const span = box.querySelector("span");
        if (span) {
          span.textContent = `Uploaded: ${result.filename}`;
        }
      }

      console.log(result);

    } catch (err) {

      console.error(err);

      alert(err.message);

    }

    event.target.value = "";

  });
}

const heroUpload = document.getElementById("heroImageUpload");

if (heroUpload) {
  heroUpload.addEventListener("change", async (event) => {

    if (!editingProductId) {
      alert("Please select a product first.");
      return;
    }

    const file = event.target.files[0];

    if (!file) return;

    try {

      const result = await uploadProductImage(
        editingProductId,
        file,
        "hero"
      );

      const box = event.target.closest(".upload-box");

if (box && result.url) {
  box.classList.add("uploaded");
  box.style.backgroundImage = `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.65)), url("${result.url}")`;
  box.style.backgroundSize = "cover";
  box.style.backgroundPosition = "center";

  const span = box.querySelector("span");
  if (span) {
    span.textContent = `Uploaded: ${result.filename}`;
  }
}

console.log(result);

    } catch (err) {

      console.error(err);

      alert(err.message);

    }

    });
}

const galleryUpload = document.getElementById("galleryImageUpload");
const galleryPreviewList = document.getElementById("galleryPreviewList");

if (galleryUpload) {
  galleryUpload.addEventListener("change", async (event) => {

    if (!editingProductId) {
      alert("Please select a product first.");
      return;
    }

    const files = Array.from(event.target.files || []);

if (!files.length) return;

if (galleryPreviewList) {
  galleryPreviewList.innerHTML = "";
}

for (const file of files) {
      try {

        const result = await uploadProductImage(
          editingProductId,
          file,
          "gallery"
        );

        if (galleryPreviewList && result.url) {
          const thumb = document.createElement("div");
          thumb.className = "gallery-preview-thumb";
          thumb.style.backgroundImage = `url("${result.url}")`;
          galleryPreviewList.appendChild(thumb);
        }

        console.log(result);

      } catch (err) {

        console.error(err);

        alert(err.message);

      }
    }

    event.target.value = "";

  });
}

loadCategories();
loadPlatforms();
loadCategoryList();
loadPlatformList();
loadDashboardProducts();