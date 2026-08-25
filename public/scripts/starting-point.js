(() => {
  const initializeStartingPoint = () => {
    document.querySelectorAll("[data-starting-point]").forEach((root) => {
      if (root.hasAttribute("data-bound")) return;
      root.setAttribute("data-bound", "true");
      const options = root.querySelectorAll("[data-starting-point-option]");
      const answers = root.querySelectorAll("[data-starting-point-answer]");
      options.forEach((option) => option.addEventListener("click", () => {
        const id = option.dataset.startingPointOption;
        options.forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === option)));
        answers.forEach((answer) => {
          const active = answer.dataset.startingPointAnswer === id;
          answer.hidden = !active;
          answer.classList.toggle("is-active", active);
        });
      }));
    });
  };
  initializeStartingPoint();
  document.addEventListener("astro:page-load", initializeStartingPoint);
})();
