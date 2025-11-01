import "./../sass/main.scss";
import { myController } from "./controller";
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Document is fully loaded and parsed.");
  await myController();
});
