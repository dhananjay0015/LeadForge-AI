const successCard = document.getElementById("successCard");
// Replace with your actual production n8n webhook URL
const WEBHOOK_URL = "http://localhost:5678/webhook-test/new-lead";

const form = document.getElementById("leadForm");
const website = document.getElementById("companyWebsite");
const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");

// Automatically add https:// if missing
website.addEventListener("blur", () => {
  if (
    website.value &&
    !website.value.startsWith("http://") &&
    !website.value.startsWith("https://")
  ) {
    website.value = "https://" + website.value;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Clear previous messages
  statusMsg.innerHTML = "";

  // Disable button
  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-50", "cursor-not-allowed");
  submitBtn.innerHTML = "⏳ Initializing Revenue Engine...";

  // Collect form data
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  // Get all selected challenges
  payload.challenges = formData
    .getAll("challenges")
    .join(", ");

  try {
    // Timeout after 15 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Submission failed");
    }

    // Reset form
    form.reset();

    // Hide form
    form.style.display = "none";

    // Show enterprise success card
    successCard.classList.remove("hidden");

    // Scroll to success card
    successCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

  } catch (error) {
    let message = "❌ Unable to submit your inquiry. Please try again.";

    if (error.name === "AbortError") {
      message = "⌛ Request timed out. Please check your internet connection and try again.";
    }

    statusMsg.innerHTML = `
      <div class="bg-red-500/10 border border-red-500 rounded-2xl p-6 mt-6">
        <h3 class="text-red-400 text-xl font-bold mb-2">Submission Failed</h3>
        <p class="text-slate-300">${message}</p>
      </div>
    `;

    statusMsg.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  if (form.style.display !== "none") {
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    submitBtn.innerHTML = "Submit & Initialize Analysis →";
  }
});