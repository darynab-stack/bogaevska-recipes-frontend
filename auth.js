const API_URL = "http://127.0.0.1:8000/api";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const ALLOWED_NEXT_PAGES = ["index.html", "profile.html"];

function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

function saveTokens(access, refresh) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
  }
}

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function isLoggedIn() {
  return getRefreshToken() !== null;
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    return false;
  }

  const response = await fetch(`${API_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refresh }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = await response.json();
  saveTokens(data.access);
  return true;
}

async function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const access = getAccessToken();
  if (access) {
    headers.Authorization = `Bearer ${access}`;
  }

  let response = await fetch(url, { ...options, headers: headers });

  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${getAccessToken()}`;
      response = await fetch(url, { ...options, headers: headers });
    }
  }

  return response;
}

async function loadCurrentUser() {
  if (!isLoggedIn()) {
    return null;
  }

  const response = await authFetch(`${API_URL}/users/me/`);
  if (!response.ok) {
    clearTokens();
    return null;
  }
  return response.json();
}

function logout() {
  clearTokens();
  window.location.href = "index.html";
}

function currentPage() {
  const page = window.location.pathname.split("/").pop();
  return page || "index.html";
}

function redirectToLogin() {
  const next = encodeURIComponent(currentPage());
  window.location.href = `login.html?next=${next}`;
}

function getNextPage() {
  const next = new URLSearchParams(window.location.search).get("next");
  if (ALLOWED_NEXT_PAGES.includes(next)) {
    return next;
  }
  return "profile.html";
}

function createLink(text, href, className) {
  const link = document.createElement("a");
  link.textContent = text;
  link.href = href;
  link.className = className;
  return link;
}

function renderHeader(user) {
  const nav = document.getElementById("auth-nav");
  nav.innerHTML = "";

  if (user) {
    const name = document.createElement("span");
    name.className = "user-name";
    name.textContent = user.first_name || user.username;

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "button";
    logoutButton.textContent = "Вийти";
    logoutButton.addEventListener("click", logout);

    nav.append(
      createLink("Мій профіль", "profile.html", "nav-link"),
      name,
      logoutButton,
    );
  } else {
    nav.append(
      createLink("Реєстрація", "register.html", "nav-link"),
      createLink("Увійти", `login.html?next=${currentPage()}`, "button"),
    );
  }
}

function showFieldErrors(form, errors) {
  for (const element of form.querySelectorAll(".field-error")) {
    element.textContent = "";
  }
  for (const [field, messages] of Object.entries(errors || {})) {
    const element = form.querySelector(`#${field}-error`);
    if (element) {
      element.textContent = messages.join(" ");
    }
  }
}
