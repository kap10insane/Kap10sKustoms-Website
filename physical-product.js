const API_BASE =
  "https://kap10skustoms-api.kap10skustoms.workers.dev";

function productImage(product) {
  return (
    product.image ||
    product.image_url ||
    "images/kap10-logo-round.png"
  );
}

function productPrice(product) {
  return Number(product.price || 0).toFixed(2);
}

function stockDetails(product) {
  const quantity = Number(product.inventory_quantity || 0);
  const tracksInventory = !!product.track_inventory;
  const allowsBackorders = !!product.allow_backorders;

  if (product.stock_status === "out_of_stock" && !allowsBackorders) {
    return {
      label: "Out of Stock",
      className: "out-of-stock",
      purchasable: false
    };
  }

  if (tracksInventory && quantity <= 0) {
    if (allowsBackorders) {
      return {
        label: "Available on Backorder",
        className: "backorder",
        purchasable: true
      };
    }

    return {
      label: "Out of Stock",
      className: "out-of-stock",
      purchasable: false
    };
  }

  return {
    label: "In Stock",
    className: "in-stock",
    purchasable: true
  };
}

function productDimensions(product) {
  const length = product.length;
  const width = product.width;
  const height = product.height;

  if (
    length === null ||
    length === undefined ||
    width === null ||
    width === undefined ||
    height === null ||
    height === undefined
  ) {
    return "";
  }

  return `${length} × ${width} × ${height} in`;
}

async function getGalleryImages(product) {
  try {
    const response = await fetch(
      `${API_BASE}/products/${encodeURIComponent(product.id)}/images`
    );

    const data = await response.json();

    if (
      response.ok &&
      data.ok &&
      Array.isArray(data.images) &&
      data.images.length
    ) {
      const hero = data.images.find(
        (image) => image.type === "hero"
      );

      const gallery = data.images.filter(
        (image) => image.type === "gallery"
      );

      return [
        ...(hero?.url ? [hero.url] : []),
        ...gallery
          .map((image) => image.url)
          .filter(Boolean)
      ];
    }
  } catch (err) {
    console.error("Product images failed to load:", err);
  }

  return [productImage(product)];
}

function renderIncluded(items) {
  const list = String(items || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!list.length) {
    return "";
  }

  return `
    <div class="info-block">
      <h3>Product Details</h3>

      <ul>
        ${list
          .map(
            (item) =>
              `<li class="check-item">${item}</li>`
          )
          .join("")}
      </ul>
    </div>

    <hr>
  `;
}

async function getProductById(productId) {
  const response = await fetch(
    `${API_BASE}/products?type=physical`
  );

  const products = await response.json();

  if (!response.ok || !Array.isArray(products)) {
    throw new Error(
      products?.error || "Invalid products response."
    );
  }

  return products.find(
    (product) => product.id === productId
  );
}

async function loadPhysicalProduct() {
  const container = document.getElementById(
    "physicalProductDetail"
  );

  const params = new URLSearchParams(
    window.location.search
  );

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

    document.title =
      `${product.name} | Kap10's Kustoms`;

    const galleryImages = await getGalleryImages(product);
    const image = galleryImages[0];

    const stock = stockDetails(product);
    const dimensions = productDimensions(product);

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
            ${galleryImages
              .map(
                (galleryImage) => `
                  <img
                    class="thumb"
                    src="${galleryImage}"
                    alt="${product.name} preview"
                    data-gallery-image="${galleryImage}"
                  >
                `
              )
              .join("")}
          </div>
        </div>

        <div class="skin-info">
          <h1>${product.name}</h1>

          <p>${product.description || ""}</p>

          <p class="physical-stock-status ${stock.className}">
            ${stock.label}
          </p>

          <hr>

          <div class="product-detail">
            <strong>Category</strong>
            <span>${product.category || "Physical Product"}</span>
          </div>

          ${
            product.sku
              ? `
                <div class="product-detail">
                  <strong>SKU</strong>
                  <span>${product.sku}</span>
                </div>
              `
              : ""
          }

          ${
            product.weight !== null &&
            product.weight !== undefined
              ? `
                <div class="product-detail">
                  <strong>Weight</strong>
                  <span>${product.weight} lb</span>
                </div>
              `
              : ""
          }

          ${
            dimensions
              ? `
                <div class="product-detail">
                  <strong>Dimensions</strong>
                  <span>${dimensions}</span>
                </div>
              `
              : ""
          }

          ${
            product.shipping_class
              ? `
                <div class="product-detail">
                  <strong>Shipping</strong>
                  <span>${product.shipping_class}</span>
                </div>
              `
              : ""
          }

          <hr>

          ${renderIncluded(product.included)}

          <h2>$${productPrice(product)} USD</h2>

          <button
            class="btn primary buy-btn"
            type="button"
            id="buyNowButton"
            data-product-id="${product.id}"
            ${stock.purchasable ? "" : "disabled"}
          >
            ${stock.purchasable ? "Buy Now" : "Out of Stock"}
          </button>

          <div class="trust-list">
            <div>✓ Secure Stripe Checkout</div>
            <div>✓ Shipping Address Collected at Checkout</div>
            <div>✓ Order Confirmation by Email</div>
          </div>
        </div>

      </div>
    `;
  } catch (err) {
    console.error(err);

    container.innerHTML =
      "<h2>Unable to load this product.</h2>";
  }
}

document.addEventListener("click", (event) => {
  const thumbnail = event.target.closest(
    "[data-gallery-image]"
  );

  if (thumbnail) {
    const mainImage = document.getElementById("mainImage");

    if (mainImage) {
      mainImage.src = thumbnail.dataset.galleryImage;
    }

    return;
  }

  const buyNowButton = event.target.closest(
    "#buyNowButton"
  );

  if (!buyNowButton || buyNowButton.disabled) return;

  alert(
    "Physical-product checkout is being connected next."
  );
});

loadPhysicalProduct();