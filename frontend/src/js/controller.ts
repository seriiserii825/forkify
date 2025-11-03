import type { TRecipe } from "../types/SingleRecipe";
import { state, loadRecipe } from "./model";
import { RecipeView } from "./views/recipeView";

export async function recipesController() {
  async function showRecipe() {
    const recipe_id = window.location.hash.slice(1);
    const recipe_view = new RecipeView();
    recipe_view.renderSpinner();
    try {
      await loadRecipe(recipe_id);
      recipe_view.render(state.recipe as TRecipe);
    } catch (error) {
      recipe_view.renderError((error as Error).message);
    }
  }
  ["load", "hashchange"].forEach((ev) => window.addEventListener(ev, showRecipe));
}
