(() => {
  const motionWindow = window;
  const runtime = motionWindow.__globalEnterpriseMotion || (motionWindow.__globalEnterpriseMotion = {});
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const meaningfulChildren = (parent) => Array.from(parent.children).filter((child) => child instanceof HTMLElement && !["SCRIPT", "STYLE", "TEMPLATE"].includes(child.tagName));
  const sceneItems = (scene) => {
    const container = Array.from(scene.children).find((child) => child instanceof HTMLElement && child.classList.contains("container-site")) || scene.querySelector(":scope > .container-site");
    if (!container) return meaningfulChildren(scene);
    const direct = meaningfulChildren(container);
    if (direct.length !== 1) return direct;
    const only = direct[0];
    const nested = meaningfulChildren(only);
    const isEditorialSplit = only.classList.contains("grid") || only.classList.contains("flex");
    return isEditorialSplit && nested.length > 1 && nested.length <= 6 ? nested : direct;
  };
  const markStaggerGroups = (item) => {
    const groups = [item, ...item.querySelectorAll(".divide-y, [data-motion-list], ul.grid, ol.grid")];
    groups.forEach((group) => {
      const children = meaningfulChildren(group);
      if (children.length < 2 || children.length > 12) return;
      group.dataset.motionStagger = "";
      children.forEach((child, index) => child.style.setProperty("--motion-child", String(Math.min(index, 7))));
    });
  };
  const updateProgress = () => {
    runtime.progressFrame = undefined;
    const indicator = document.querySelector("[data-motion-progress] > span");
    if (!indicator) return;
    const maximum = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maximum > 0 ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0;
    indicator.style.transform = `scaleX(${progress})`;
  };
  const requestProgressUpdate = () => {
    if (runtime.progressFrame) return;
    runtime.progressFrame = window.requestAnimationFrame(updateProgress);
  };
  const initializeMotion = () => {
    const scenes = document.querySelectorAll("main > section, main > [data-motion-scene], .contextual-next, body > footer");
    scenes.forEach((scene, sceneIndex) => {
      scene.dataset.motionScene = String(sceneIndex + 1).padStart(2, "0");
      sceneItems(scene).forEach((item, itemIndex) => {
        if (item.dataset.motionSkip !== undefined) return;
        item.dataset.motionItem = item.matches("figure, picture") || item.querySelector("img, picture, svg") ? "media" : "content";
        item.dataset.motionState = "visible";
        item.style.setProperty("--motion-order", String(Math.min(itemIndex, 5)));
        item.querySelectorAll("figure, picture, .media-interlude-image-wrap, .architecture-map-canvas, .signal-chart-canvas, .solution-diagram").forEach((media) => { media.dataset.motionMedia = ""; });
        markStaggerGroups(item);
      });
    });
    document.documentElement.dataset.motionSystem = reduceMotion.matches ? "reduced" : "ready";
    updateProgress();
  };
  if (!document.documentElement.hasAttribute("data-motion-bound")) {
    document.documentElement.setAttribute("data-motion-bound", "");
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate, { passive: true });
    reduceMotion.addEventListener?.("change", initializeMotion);
    document.addEventListener("astro:page-load", initializeMotion);
  }
  initializeMotion();
})();
