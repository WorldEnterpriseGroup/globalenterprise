(() => {
  const directory = document.querySelector("#directory");
  const main = document.querySelector("#main");
  const summary = document.querySelector("#summary");
  const previewName = document.querySelector("#preview-name");
  const previewFrame = document.querySelector("#preview-frame");
  if (!directory || !main || !summary || !previewName || !previewFrame) return;

  const textNode = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const slugForId = (url) => `page-${url.replaceAll("/", "-") || "home"}`;
  const select = (entry, card) => {
    document.querySelectorAll(".card.is-selected").forEach((item) => item.classList.remove("is-selected"));
    card?.classList.add("is-selected");
    previewName.replaceChildren();
    const link = document.createElement("a");
    link.href = entry.href;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = entry.href;
    previewName.append(link);
    previewFrame.src = entry.href;
  };

  fetch("compact-pages.json", { credentials: "same-origin" })
    .then((response) => {
      if (!response.ok) throw new Error(`Sitemap data request failed: ${response.status}`);
      return response.json();
    })
    .then((pages) => {
      if (!Array.isArray(pages) || pages.length === 0) throw new Error("Sitemap data is empty");
      const groups = [...new Set(pages.map((page) => page.group))];
      summary.replaceChildren(
        textNode("span", "", `${pages.length} pages`),
        textNode("span", "", `${groups.length} architecture groups`),
        textNode("span", "", "all routes live"),
      );
      groups.forEach((group) => {
        const groupPages = pages.filter((page) => page.group === group);
        const section = document.createElement("section");
        const heading = textNode("h2", "group-title");
        heading.append(textNode("strong", "", group), textNode("span", "", `${groupPages.length} pages`));
        section.append(heading);
        const grid = textNode("div", "grid");
        groupPages.forEach((entry) => {
          const card = document.createElement("article");
          card.className = "card";
          card.id = slugForId(entry.href);
          card.tabIndex = 0;
          card.setAttribute("aria-label", entry.href);
          const preview = textNode("div", "card-preview");
          preview.append(textNode("span", "card-name", entry.label));
          const caption = textNode("div", "caption");
          caption.append(textNode("div", "filename", entry.href), textNode("div", "title", entry.kind));
          card.append(preview, caption);
          card.addEventListener("click", () => select(entry, card));
          card.addEventListener("focus", () => select(entry, card));
          grid.append(card);
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.href = `#${card.id}`;
          link.textContent = entry.href;
          item.append(link);
          directory.append(item);
        });
        section.append(grid);
        main.append(section);
      });
      const first = main.querySelector(".card");
      if (first) select(pages[0], first);
    })
    .catch((error) => {
      summary.replaceChildren(textNode("span", "", "Sitemap data unavailable"));
      main.append(textNode("p", "load-error", error instanceof Error ? error.message : "Unable to load sitemap data."));
    });

  const splitter = document.querySelector(".splitter");
  let isResizing = false;
  const setRightWidth = (right) => {
    const total = document.body.getBoundingClientRect().width;
    const bounded = Math.max(260, Math.min(total * 0.5, right));
    document.documentElement.style.setProperty("--left-width", `${(total - bounded - 6) / total * 100}%`);
    document.documentElement.style.setProperty("--right-width", `${bounded / total * 100}%`);
  };
  splitter?.addEventListener("mousedown", () => {
    isResizing = true;
    splitter.classList.add("active");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });
  document.addEventListener("mousemove", (event) => {
    if (isResizing) setRightWidth(document.body.getBoundingClientRect().width - event.clientX);
  });
  document.addEventListener("mouseup", () => {
    isResizing = false;
    splitter?.classList.remove("active");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  });
  splitter?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--right-width")) || 35;
    setRightWidth(document.body.getBoundingClientRect().width * (current + (event.key === "ArrowRight" ? 2 : -2)) / 100);
  });
})();
