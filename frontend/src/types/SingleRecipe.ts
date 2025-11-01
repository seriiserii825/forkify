export type TSingleRecipeResponse = {
    status: string;
    data:   TSingleRecipeResponseData;
}

export type TSingleRecipeResponseData  = {
    recipe: TRecipe;
}
export type TRecipe  = {
    publisher:    string;
    ingredients:  TIngredient[];
    source_url:   string;
    image_url:    string;
    title:        string;
    servings:     number;
    cooking_time: number;
    id:           string;
}
export type TIngredient  = {
    quantity:    number | null;
    unit:        string;
    description: string;
}
