// vite.config.js
import { resolve } from 'path';
import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, "partials"),
    }),
  ],
});
