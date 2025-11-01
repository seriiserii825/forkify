document.addEventListener("DOMContentLoaded", function () {
  const game_number = document.querySelector(".game__number") as HTMLElement;
  const message = document.querySelector(".game__message") as HTMLElement;
  const score = document.querySelector(".game__score") as HTMLElement;
  const input = document.querySelector(".game__input") as HTMLInputElement;
  const btn_check = document.querySelector(".game__btn--check") as HTMLButtonElement;
  const game_high_score = document.querySelector(".game__highscore") as HTMLElement;
  let random_number = Math.trunc(Math.random() * 20) + 1;
  const again = document.querySelector(".game__btn--again") as HTMLButtonElement;
  let current_score = Number(score.textContent);

  let high_score = 0;

  btn_check.addEventListener("click", function () {
    const guessed_number = Number(input.value);
    console.log(guessed_number, "guessed_number");
    if (!guessed_number) {
      displayMessage("⛔ No number!");
    } else if (guessed_number === random_number) {
      displayMessage("🎉 Correct Number!");
      score.textContent = "20";
      game_number.textContent = String(random_number);
      document.querySelector("body")!.style.backgroundColor = "#60b347";

      if (current_score > high_score) {
        high_score = current_score;
        game_high_score.textContent = String(high_score);
      }
    } else {
      if (current_score > 1) {
        current_score--;
        displayMessage(guessed_number > random_number ? "📈 Too high!" : "📉 Too low!");
        score.textContent = String(current_score);
      } else {
        displayMessage("💥 You lost the game!");
        score.textContent = "0";
      }
    }
  });
  again.addEventListener("click", function () {
    random_number = Math.trunc(Math.random() * 20) + 1;
    current_score = 20;
    score.textContent = String(current_score);
    displayMessage("Start guessing...");
    game_number.textContent = "?";
    input.value = "";
    document.querySelector("body")!.style.backgroundColor = "#222";
  });

  function displayMessage(msg: string) {
    message.textContent = msg;
  }
});
