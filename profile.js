const form = document.getElementById("cuisine-form");
const message = document.getElementById("message");

function showMessage(text, isSuccess = false) {
  message.textContent = text;
  message.className = isSuccess ? "message success" : "message";
  message.hidden = false;
}

function renderProfile(user) {
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  document.getElementById("profile-username").textContent = user.username;
  document.getElementById("profile-name").textContent = fullName || "не вказано";
  document.getElementById("profile-email").textContent = user.email;
  document.getElementById("profile-role").textContent = user.is_staff
    ? "адміністратор"
    : "користувач";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.hidden = true;

  try {
    const response = await authFetch(`${API_URL}/cuisines/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.value.trim(),
        description: form.description.value.trim(),
      }),
    });

    if (response.status === 401) {
      redirectToLogin();
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      showFieldErrors(form, data.errors);
      showMessage(data.detail);
      return;
    }

    showFieldErrors(form, {});
    form.reset();
    showMessage(`Кухню «${data.name}» додано.`, true);
  } catch (error) {
    showMessage("Не вдалося з'єднатися з сервером.");
  }
});

async function start() {
  try {
    const user = await loadCurrentUser();
    if (!user) {
      redirectToLogin();
      return;
    }
    renderHeader(user);
    renderProfile(user);
  } catch (error) {
    renderHeader(null);
    showMessage("Не вдалося з'єднатися з сервером.");
  }
}

start();
