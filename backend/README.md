## пример полного цикла

```ts
const BASE = "http://localhost:3333/api/v2";
```

## 1. Список рецептов

```ts
let res = await fetch(`${BASE}/recipes?search=pizza`);
console.log(await res.json());
```

## 2. Создать новый рецепт

```ts
res = await fetch(`${BASE}/recipes`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Chocolate Cake",
    publisher: "Serii",
    source_url: "https://example.com/cake",
    image_url: "https://picsum.photos/seed/cake/600/400",
    servings: 8,
    cooking_time: 60,
    ingredients: [
      { quantity: 2, unit: "cup", description: "Flour" },
      { quantity: 1, unit: "cup", description: "Sugar" },
      { quantity: 3, unit: "", description: "Eggs" },
    ],
  }),
});
const created = await res.json();
console.log(created);

const id = created.data.recipe.id;
```

## 3. Получить его обратно

```ts
res = await fetch(`${BASE}/recipes/${id}`);
console.log(await res.json());
```

## 4. Обновить

```ts
res = await fetch(`${BASE}/recipes/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ servings: 10 }),
});
console.log(await res.json());
```

## 5. Удалить

```ts
res = await fetch(`${BASE}/recipes/${id}`, { method: "DELETE" });
console.log(await res.json());
```
