const API_BASE = "https://kap10skustoms-api.kap10skustoms.workers.dev";

const customWorkForm = document.getElementById("customWorkForm");
const customFormMessage = document.getElementById("customFormMessage");

if (customWorkForm) {
  customWorkForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = customWorkForm.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    customFormMessage.textContent = "";

    try {
      const formData = new FormData(customWorkForm);

      const response = await fetch(`${API_BASE}/custom-request`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to submit custom request.");
      }

      customWorkForm.reset();

      customFormMessage.textContent =
        "Your custom request has been submitted. We'll review it and get back to you by email.";
    } catch (error) {
      console.error("Custom request submission failed:", error);

      customFormMessage.textContent =
        error.message || "Unable to submit your request. Please try again.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Custom Request";
      }
    }
  });
}