const form = document.getElementById("login-form");
const message = document.getElementById("message");

function showMessage(text, isSuccess = false) {
  message.textContent = text;
  message.className = isSuccess ? "message success" : "message";
  message.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.hidden = true;

  try {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username.value.trim(),
        password: form.password.value,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      showFieldErrors(form, data.errors);
      showMessage(data.detail);
      return;
    }

    saveTokens(data.access, data.refresh);
    window.location.href = getNextPage();
  } catch (error) {
    showMessage("Не вдалося з'єднатися з сервером.");
  }
});

async function start() {
  try {
    const user = await loadCurrentUser();
    if (user) {
      window.location.href = getNextPage();
      return;
    }
  } catch (error) {
    showMessage("Не вдалося з'єднатися з сервером.");
  }

  renderHeader(null);
  if (new URLSearchParams(window.location.search).has("registered")) {
    showMessage("Реєстрація пройшла успішно. Тепер увійдіть.", true);
  }
}

start();
