(() => {
  const initializeSystemMap = () => {
    document.querySelectorAll("[data-system-map]").forEach((root) => {
      if (root.hasAttribute("data-bound")) return;
      root.setAttribute("data-bound", "true");
      const steps = {
        mandate: { marker: "Mandate", text: "Name the outcome, the promise, and the decision the organization has to make next.", href: "/about/", label: "See our approach" },
        workflow: { marker: "Workflow", text: "See how the work really moves, where it waits, and where judgment matters.", href: "/services/operating-model/", label: "Explore operating model design" },
        platform: { marker: "Platform", text: "Connect architecture, data, controls, and tools to the work they must support.", href: "/services/cloud-data/", label: "Explore cloud and data foundations" },
        capability: { marker: "Capability", text: "Give people the roles, skills, and decision rights required to carry the change.", href: "/services/leadership-talent/", label: "Explore leadership and talent" },
        evidence: { marker: "Evidence", text: "Make progress observable through measures, feedback, and a cadence that can adapt.", href: "/insights/", label: "Explore the signal" },
      };
      const tabs = Array.from(root.querySelectorAll("[data-system-map-tab]"));
      const panel = root.querySelector("[data-system-map-panel]");
      const text = root.querySelector("[data-system-map-text]");
      const eyebrow = panel?.querySelector(".eyebrow");
      const link = panel?.querySelector("a");
      const cards = root.querySelectorAll("[data-system-map-insight]");
      const activateTab = (tab) => {
        const step = steps[tab.dataset.systemMapTab || "mandate"];
        if (!step) return;
        tabs.forEach((candidate) => {
          const selected = candidate === tab;
          candidate.classList.toggle("is-active", selected);
          candidate.setAttribute("aria-selected", String(selected));
          candidate.tabIndex = selected ? 0 : -1;
        });
        cards.forEach((card) => card.classList.toggle("is-active", card.dataset.systemMapInsight === tab.dataset.systemMapTab));
        if (panel && text && eyebrow && link) {
          panel.setAttribute("aria-labelledby", tab.id);
          eyebrow.textContent = step.marker;
          text.textContent = step.text;
          link.href = step.href;
          const arrow = link.querySelector("span");
          link.textContent = step.label;
          if (arrow) link.append(arrow);
        }
      };
      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activateTab(tab));
        tab.addEventListener("keydown", (event) => {
          let nextIndex = index;
          if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
          if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
          if (event.key === "Home") nextIndex = 0;
          if (event.key === "End") nextIndex = tabs.length - 1;
          if (nextIndex === index) return;
          event.preventDefault();
          const nextTab = tabs[nextIndex];
          activateTab(nextTab);
          nextTab.focus();
        });
      });
      const selectedTab = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
      if (selectedTab) activateTab(selectedTab);
    });
  };
  initializeSystemMap();
  document.addEventListener("astro:page-load", initializeSystemMap);
})();
