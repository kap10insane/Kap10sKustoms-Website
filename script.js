document.addEventListener("DOMContentLoaded", async () => {
  await updateHeaderAccountLink();
});

document.addEventListener("click", (event) => {
  const card = event.target.closest("[data-card-href]");
  if (!card) return;

  const href = card.dataset.cardHref;
  if (!href) return;

  window.location.href = href;
});