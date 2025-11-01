import 'dotenv/config';
import { JsonDB } from './db.js';

const db = new JsonDB(process.env.DATA_FILE || './data/recipes.json');

const extra = [
  {
    id: '5ed6604591c37cdc054bc8aa1',
    title: 'Classic Pancakes',
    publisher: 'Home Chef',
    source_url: 'https://example.com/pancakes',
    image_url: 'https://picsum.photos/seed/pancake/600/400',
    servings: 2,
    cooking_time: 15,
    ingredients: [
      { quantity: 1, unit: 'cup', description: 'Flour' },
      { quantity: 1, unit: 'tbsp', description: 'Sugar' },
      { quantity: 1, unit: 'tsp', description: 'Baking powder' },
      { quantity: 1, unit: '', description: 'Egg' }
    ]
  }
];

await db.write(dbState => {
  const set = new Map((dbState.recipes || []).map(r => [r.id, r]));
  for (const r of extra) set.set(r.id, r);
  return { ...dbState, recipes: Array.from(set.values()) };
});

console.log('Seeded.');
