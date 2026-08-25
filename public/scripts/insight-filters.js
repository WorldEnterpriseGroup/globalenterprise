(() => {
  const initializeInsightFilters = () => {
    const root = document.querySelector("[data-insight-filters]")?.closest(".container-site");
    const list = root?.querySelector("[data-insight-list]");
    if (!root || !list || root.hasAttribute("data-filter-bound")) return;
    root.setAttribute("data-filter-bound", "true");
    const search = root.querySelector("[data-insight-search]");
    const topic = root.querySelector("[data-insight-topic]");
    const count = root.querySelector("[data-insight-count]");
    const empty = root.querySelector("[data-insight-empty]");
    const cards = [...list.querySelectorAll("[data-insight-card]")];
    const update = () => {
      const query = search?.value.trim().toLowerCase() || "";
      const selectedTopic = topic?.value || "all";
      let visible = 0;
      cards.forEach((card) => {
        const show = (!query || (card.dataset.search || "").includes(query)) && (selectedTopic === "all" || card.dataset.category === selectedTopic);
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (count) count.textContent = `${visible} ${visible === 1 ? "perspective" : "perspectives"}`;
      if (empty) empty.classList.toggle("hidden", visible !== 0);
    };
    search?.addEventListener("input", update);
    topic?.addEventListener("change", update);
  };
  initializeInsightFilters();
  document.addEventListener("astro:page-load", initializeInsightFilters);
})();
