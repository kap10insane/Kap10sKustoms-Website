document.addEventListener("DOMContentLoaded", async () => {
  await updateHeaderAccountLink();

  const copySupportEmail = document.getElementById("copySupportEmail");

  if (copySupportEmail) {
    copySupportEmail.addEventListener("click", async (event) => {
      event.preventDefault();

      const email = copySupportEmail.dataset.email || "support@kap10skustoms.com";

      try {
        await navigator.clipboard.writeText(email);
        copySupportEmail.textContent = "Email copied!";

        setTimeout(() => {
          copySupportEmail.textContent = email;
        }, 1500);
      } catch (error) {
        console.error("Email copy failed:", error);
        alert(email);
      }
    });
  }
});

document.addEventListener("click", (event) => {
  const card = event.target.closest("[data-card-href]");
  if (!card) return;

  const href = card.dataset.cardHref;
  if (!href) return;

  window.location.href = href;
});

