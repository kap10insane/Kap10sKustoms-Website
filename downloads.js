const API_URL = "https://kap10skustoms-api.kap10skustoms.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  loadDownloads();
});

async function loadDownloads() {
  const el = document.getElementById("myDownloads");

  if (!el) return;

  el.innerHTML = "<p>Loading downloads...</p>";

  try {
    const res = await fetch(`${API_URL}/account/downloads`, {
      method: "GET",
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      el.innerHTML = "<p>Please log in to view your downloads.</p>";
      return;
    }

    if (!data.downloads.length) {
      el.innerHTML = "<p>You do not own any downloads yet.</p>";
      return;
    }

    el.innerHTML = data.downloads.map(renderDownloadCard).join("");
  } catch (err) {
    console.error("Failed to load downloads:", err);
    el.innerHTML = "<p>Could not load downloads right now.</p>";
  }
}

function renderDownloadCard(product) {
  return `
    <article class="download-card">
      ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">` : ""}
      <div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.category || "Digital Product")}</p>
        <p>Version: ${escapeHtml(product.version || "1.0")}</p>
        ${product.hasUpdate ? `<p class="update-badge">Update Available</p>` : ""}
        <button type="button" disabled>
          Download
        </button>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}