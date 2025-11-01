import type {TSingleRecipeResponse} from "../types/SingleRecipe";

export async function myController() {
  // https://forkify-api.jonas.io

  const MY_KEY = import.meta.env.VITE_API_KEY;
  const API_URL = import.meta.env.VITE_API_URL;

  async function showRecipe() {
    try {
      // const url = `${API_URL}/v2/recipes/5ed6604591c37cdc054bc886?key=${MY_KEY}`;
      const url = `${API_URL}/v2/recipes/5ed6604591c37cdc054bc886?key=${MY_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      let { recipe } = data.data as TSingleRecipeResponse['data'];
      recipe = {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        source_url: recipe.source_url,
        image_url: recipe.image_url,
        servings: recipe.servings,
        cooking_time: recipe.cooking_time,
        ingredients: recipe.ingredients,
      };
      console.log(recipe, "recipe");
      if (!res.ok) {
        throw new Error(`Recipe not found (${data.message}) (${res.status})`);
      }
    } catch (err) {
      console.error(err);
    }
  }
  showRecipe();
}
