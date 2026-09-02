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




// =========================================================
// FEATURED WORK
// =========================================================

async function loadFeaturedWorkGallery() {
  const gallery = document.getElementById("featuredWorkGallery");

  if (!gallery) return;

  try {
    const response = await fetch(
      "https://kap10skustoms-api.kap10skustoms.workers.dev/featured-work"
    );

    const data = await response.json();

    if (!response.ok || !data.ok || !Array.isArray(data.featuredWork)) {
      throw new Error(data.error || "Failed to load Featured Work.");
    }

    if (!data.featuredWork.length) {
      gallery.innerHTML = "<p>Featured projects coming soon.</p>";
      return;
    }

    gallery.innerHTML = data.featuredWork
      .map((item) => `
        <article class="featured-work-card">
          ${
            item.image
              ? `
                <img
                  src="${item.image}"
                  alt="${escapeFeaturedWorkHtml(item.title)}"
                  class="featured-work-image"
                >
              `
              : ""
          }

          <div class="featured-work-card-content">
            <h3>${escapeFeaturedWorkHtml(item.title)}</h3>
            ${
              item.description
                ? `<p>${escapeFeaturedWorkHtml(item.description)}</p>`
                : ""
            }
          </div>
        </article>
      `)
      .join("");
  } catch (err) {
    console.error("Failed to load Featured Work:", err);
    gallery.innerHTML = "<p>Featured projects coming soon.</p>";
  }
}

function escapeFeaturedWorkHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadFeaturedWorkGallery();


// =========================================================
// EMAIL SIGNUP
// =========================================================

const emailSignupForm = document.getElementById("emailSignupForm");
const emailSignupInput = document.getElementById("emailSignupInput");
const emailSignupMessage = document.getElementById("emailSignupMessage");

emailSignupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = String(emailSignupInput?.value || "").trim();

  if (!email) return;

  const submitButton = emailSignupForm.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Signing Up...";
  }

  if (emailSignupMessage) {
    emailSignupMessage.textContent = "";
  }

  try {
    const response = await fetch(
      "https://kap10skustoms-api.kap10skustoms.workers.dev/email-signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Unable to sign up.");
    }

    if (emailSignupMessage) {
      emailSignupMessage.textContent = data.alreadySubscribed
        ? "You're already signed up."
        : "You're signed up. Thanks!";
    }

    emailSignupForm.reset();
  } catch (err) {
    console.error("Email signup failed:", err);

    if (emailSignupMessage) {
      emailSignupMessage.textContent =
        err.message || "Unable to sign up right now.";
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Sign Up";
    }
  }
});