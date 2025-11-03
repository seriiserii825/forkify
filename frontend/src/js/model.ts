import type { TSingleRecipeResponse } from "../types/SingleRecipe";

export const state = {
  recipe: {} as TSingleRecipeResponse["data"]["recipe"],
};

// https://forkify-api.jonas.io
function minDelay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function loadRecipe(recipe_id: string) {
  const API_URL = import.meta.env.VITE_API_URL;

  // const url = `${API_URL}/v2/recipes/5ed6604591c37cdc054bc886?key=${MY_KEY}`;
  const url = `${API_URL}/recipes/${recipe_id}`;

  try {
    if (!recipe_id) throw new Error("No recipe id found in URL");
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
    state.recipe = recipe;
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
}
