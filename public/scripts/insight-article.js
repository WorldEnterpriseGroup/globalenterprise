(() => {
  const initializeArticleExperience = () => {
    const root = document.querySelector("[data-article-experience]");
    if (!root || root.hasAttribute("data-bound")) return;
    root.setAttribute("data-bound", "true");
    const status = root.querySelector("[data-share-status]");
    root.querySelector("[data-share-copy]")?.addEventListener("click", async (event) => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (status) status.textContent = "Link copied.";
        event.currentTarget.textContent = "Copied";
      } catch {
        if (status) status.textContent = "Copy unavailable; use your browser address bar.";
      }
    });
    root.querySelector("[data-share-native]")?.addEventListener("click", async () => {
      if (navigator.share) await navigator.share({ title: document.title, url: window.location.href });
      else if (status) status.textContent = "Native sharing is unavailable on this device.";
    });
  };
  initializeArticleExperience();
  document.addEventListener("astro:page-load", initializeArticleExperience);
})();
