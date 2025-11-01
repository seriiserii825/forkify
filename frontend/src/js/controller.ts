import type { TSingleRecipeResponse } from "../types/SingleRecipe";

export async function myController() {
  // https://forkify-api.jonas.io
  function minDelay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  const API_URL = import.meta.env.VITE_API_URL;

  const recipe_container = document.querySelector(".recipe") as HTMLElement;

  function renderSpinner(parentEl: HTMLElement) {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="src/img/icons.svg#icon-loader"></use>
        </svg>
      </div>
    `;
    parentEl.innerHTML = "";
    parentEl.insertAdjacentHTML("afterbegin", markup);
  }

  function renderError(parentEl: HTMLElement, message: string) {
    const markup = `
        <div class="error">
            <div>
              <svg>
                <use href="src/img/icons.svg#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>
    `;
    parentEl.innerHTML = "";
    parentEl.insertAdjacentHTML("afterbegin", markup);
  }

  async function showRecipe() {
    const recipe_id = window.location.hash.slice(1);
    renderSpinner(recipe_container);
    try {
      if (!recipe_id) throw new Error("No recipe id found in URL");
      // const url = `${API_URL}/v2/recipes/5ed6604591c37cdc054bc886?key=${MY_KEY}`;
      const url = `${API_URL}/recipes/${recipe_id}`;
      // Параллельно: запрос и минимальный показ спиннера
      const [res] = await Promise.all([
        fetch(url),
        minDelay(1200), // например, 800–1200 мс достаточно для UX
      ]);
      // const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Recipe not found (${data.message}) (${res.status})`);
      }
      let { recipe } = data.data as TSingleRecipeResponse["data"];

      const markup = `
        <figure class="recipe__fig">
          <img src="${recipe.image_url}" alt="${recipe.title}" class="recipe__img" />
          <h1 class="recipe__title">
            <span>${recipe.title}</span>
          </h1>
        </figure>

        <div class="recipe__details">
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="src/img/icons.svg#icon-clock"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">${recipe.cooking_time}</span>
            <span class="recipe__info-text">minutes</span>
          </div>
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="src/img/icons.svg#icon-users"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">${recipe.servings}</span>
            <span class="recipe__info-text">servings</span>

            <div class="recipe__info-buttons">
              <button class="btn--tiny btn--increase-servings">
                <svg>
                  <use href="src/img/icons.svg#icon-minus-circle"></use>
                </svg>
              </button>
              <button class="btn--tiny btn--increase-servings">
                <svg>
                  <use href="src/img/icons.svg#icon-plus-circle"></use>
                </svg>
              </button>
            </div>
          </div>

          <div class="recipe__user-generated">
            <svg>
              <use href="src/img/icons.svg#icon-user"></use>
            </svg>
          </div>
          <button class="btn--round">
            <svg class="">
              <use href="src/img/icons.svg#icon-bookmark-fill"></use>
            </svg>
          </button>
        </div>

        <div class="recipe__ingredients">
          <h2 class="heading--2">Recipe ingredients</h2>
          <ul class="recipe__ingredient-list">
          ${recipe.ingredients
            .map(
              (ingredient) =>
                `
            <li class="recipe__ingredient">
              <svg class="recipe__icon">
                <use href="src/img/icons.svg#icon-check"></use>
              </svg>
              <div class="recipe__quantity">${ingredient.quantity}</div>
              <div class="recipe__description">
                <span class="recipe__unit">${ingredient.unit}</span>
                ${ingredient.description}
              </div>
            </li>
                                   `
            )
            .join("")}
          </ul>
        </div>

        <div class="recipe__directions">
          <h2 class="heading--2">How to cook it</h2>
          <p class="recipe__directions-text">
            This recipe was carefully designed and tested by
            <span class="recipe__publisher">${recipe.publisher}</span>. Please check out
            directions at their website.
          </p>
          <a
            class="btn--small recipe__btn"
            href="${recipe.source_url}"
            target="_blank"
          >
            <span>Directions</span>
            <svg class="search__icon">
              <use href="src/img/icons.svg#icon-arrow-right"></use>
            </svg>
          </a>
        </div>
      `;
      recipe_container.innerHTML = "";
      recipe_container.insertAdjacentHTML("afterbegin", markup);
    } catch (err) {
      console.error(err);
      renderError(recipe_container, (err as Error).message);
    }
  }
  ["load", "hashchange"].forEach((ev) => window.addEventListener(ev, showRecipe));
}
