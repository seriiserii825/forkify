import type {TRecipe} from "../types/SingleRecipe";
import { state, loadRecipe } from "./model";
import {RecipeView} from "./views/recipeView";

export async function recipesController() {
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
      await loadRecipe(recipe_id);
      new RecipeView(state.recipe as TRecipe).render();
    } catch (error) {
      renderError(recipe_container, (error as Error).message);
    }
  }
  ["load", "hashchange"].forEach((ev) => window.addEventListener(ev, showRecipe));
}
