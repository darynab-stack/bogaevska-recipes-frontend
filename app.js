const API_URL = "http://127.0.0.1:8000/api";

const MEAL_TYPES = {
  breakfast: "сніданок",
  soup: "суп",
  main: "основна страва",
  salad: "салат",
  dessert: "десерт",
  drink: "напій",
};

const DIFFICULTIES = {
  easy: "легко",
  medium: "середньо",
  hard: "складно",
};

const recipesBlock = document.getElementById("recipes");
const message = document.getElementById("message");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

let cuisineNames = {};

function showMessage(text) {
  message.textContent = text;
  message.hidden = false;
}

function hideMessage() {
  message.hidden = true;
}

async function loadCuisines() {
  const response = await fetch(`${API_URL}/cuisines/`);
  const cuisines = await response.json();
  for (const cuisine of cuisines) {
    cuisineNames[cuisine.id] = cuisine.name;
  }
}

function createCard(recipe) {
  const card = document.createElement("article");
  card.className = "card";

  const title = document.createElement("h2");
  title.textContent = recipe.title;

  const cuisine = document.createElement("p");
  cuisine.textContent = `Кухня: ${cuisineNames[recipe.cuisine] || "невідомо"}`;

  const mealType = document.createElement("p");
  mealType.textContent = `Тип страви: ${MEAL_TYPES[recipe.meal_type]}`;

  const difficulty = document.createElement("p");
  difficulty.textContent = `Складність: ${DIFFICULTIES[recipe.difficulty]}`;

  const time = document.createElement("p");
  time.textContent = `Час: ${recipe.cooking_time} хв`;

  card.append(title, cuisine, mealType, difficulty, time);
  return card;
}

async function loadRecipes(search = "") {
  hideMessage();
  recipesBlock.innerHTML = "";

  let url = `${API_URL}/recipes/`;
  if (search) {
    url += `?search=${encodeURIComponent(search)}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    showMessage(data.detail);
    return;
  }

  if (data.length === 0) {
    showMessage("Рецептів не знайдено.");
    return;
  }

  for (const recipe of data) {
    recipesBlock.append(createCard(recipe));
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadRecipes(searchInput.value.trim());
});

async function start() {
  try {
    await loadCuisines();
    await loadRecipes();
  } catch (error) {
    showMessage(
      "Не вдалося з'єднатися з сервером. Перевірте, що бекенд запущений на " +
        "http://127.0.0.1:8000",
    );
  }
}

start();