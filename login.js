const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const status = document.getElementById("loginStatus");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  status.textContent = "Sending login email...";

  try {
    const response = await fetch(`${API_BASE}/auth/request-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: emailInput.value.trim()
      })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Unable to send login email.");
    }

    status.textContent =
      "✅ Check your email. Your secure login link has been sent.";

    form.reset();
  } catch (err) {
    console.error(err);

    status.textContent =
      "❌ " + err.message;
  }
});