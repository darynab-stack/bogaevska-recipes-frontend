const form = document.getElementById("register-form");
const message = document.getElementById("message");

function showMessage(text) {
  message.textContent = text;
  message.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.hidden = true;

  try {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username.value.trim(),
        first_name: form.first_name.value.trim(),
        last_name: form.last_name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
        password_confirm: form.password_confirm.value,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      showFieldErrors(form, data.errors);
      showMessage(data.detail);
      return;
    }

    window.location.href = "login.html?registered=1";
  } catch (error) {
    showMessage("Не вдалося з'єднатися з сервером.");
  }
});

async function start() {
  try {
    const user = await loadCurrentUser();
    if (user) {
      window.location.href = "profile.html";
      return;
    }
  } catch (error) {
    showMessage("Не вдалося з'єднатися з сервером.");
  }
  renderHeader(null);
}

start();
