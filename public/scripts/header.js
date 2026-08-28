(() => {
  const initializeHeader = () => {
    const header = document.querySelector("[data-site-header]");
    const menuToggle = header?.querySelector("[data-menu-toggle]");
    const navigation = header?.querySelector("[data-navigation]");
    const megaToggle = header?.querySelector("[data-mega-toggle]");
    const megaPanel = header?.querySelector("[data-mega-panel]");
    const mobileDirectory = header?.querySelector("[data-mobile-directory]");
    const megaChevron = header?.querySelector("[data-mega-chevron]");
    const industryToggle = header?.querySelector("[data-industry-toggle]");
    const industryPanel = header?.querySelector("[data-industry-panel]");
    const industryChevron = header?.querySelector("[data-industry-chevron]");
    const menuLabel = header?.querySelector("[data-menu-label]");

    if (!header || header.hasAttribute("data-header-bound")) return;
    header.setAttribute("data-header-bound", "true");

    const setMega = (open) => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      megaToggle?.setAttribute("aria-expanded", String(open));
      megaPanel?.setAttribute("aria-hidden", String(!open));
      megaPanel?.setAttribute("data-state", open ? "open" : "closed");
      megaPanel?.classList.toggle("is-open", open);
      mobileDirectory?.setAttribute("aria-hidden", String(!open || !isMobile));
      mobileDirectory?.setAttribute("data-state", open && isMobile ? "open" : "closed");
      mobileDirectory?.classList.toggle("hidden", !open || !isMobile);
      megaChevron?.classList.toggle("rotate-180", open);
    };

    const setIndustries = (open) => {
      industryToggle?.setAttribute("aria-expanded", String(open));
      industryPanel?.setAttribute("aria-hidden", String(!open));
      industryPanel?.setAttribute("data-state", open ? "open" : "closed");
      industryPanel?.classList.toggle("is-open", open);
      industryChevron?.classList.toggle("rotate-180", open);
    };

    menuToggle?.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      if (menuLabel) menuLabel.textContent = isOpen ? "Open navigation" : "Close navigation";
      navigation?.classList.toggle("hidden", isOpen);
      if (isOpen) { setMega(false); setIndustries(false); }
      if (!isOpen) navigation?.querySelector("a, button")?.focus();
    });

    megaToggle?.addEventListener("click", () => { setIndustries(false); setMega(megaPanel?.getAttribute("data-state") !== "open"); });
    industryToggle?.addEventListener("click", () => { setMega(false); setIndustries(industryPanel?.getAttribute("data-state") !== "open"); });
    document.addEventListener("click", (event) => {
      if (megaPanel?.getAttribute("data-state") === "open" && !(event.target instanceof Node && header.contains(event.target))) setMega(false);
      if (industryPanel?.getAttribute("data-state") === "open" && !(event.target instanceof Node && header.contains(event.target))) setIndustries(false);
    });
    header.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        setMega(false);
        setIndustries(false);
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "Open navigation");
        if (menuLabel) menuLabel.textContent = "Open navigation";
        navigation?.classList.add("hidden");
      }
    }));
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      setMega(false);
      setIndustries(false);
      if (menuToggle?.getAttribute("aria-expanded") === "true") {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        if (menuLabel) menuLabel.textContent = "Open navigation";
        navigation?.classList.add("hidden");
        menuToggle.focus();
      }
    });
  };
  initializeHeader();
  document.addEventListener("astro:page-load", initializeHeader);
})();
