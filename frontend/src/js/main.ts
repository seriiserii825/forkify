import "./../sass/main.scss";
import {recipesController} from "./controller";
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Document is fully loaded and parsed.");
  await recipesController();
});
