(() => {
  const initializeSiteAnalytics = () => {
    if (document.documentElement.hasAttribute("data-analytics-bound")) return;
    document.documentElement.setAttribute("data-analytics-bound", "true");
    const analyticsWindow = window;
    analyticsWindow.plausible = analyticsWindow.plausible || function (...args) {
      (analyticsWindow.plausible.q = analyticsWindow.plausible.q || []).push(args);
    };
    const track = (eventName, props = {}) => {
      analyticsWindow.plausible?.(eventName, { props });
      analyticsWindow.gtag?.("event", eventName, props);
      window.dispatchEvent(new CustomEvent("site:analytics", { detail: { eventName, props } }));
    };
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target.closest("a, button") : null;
      if (!target) return;
      const href = target.getAttribute("href") ?? "";
      const explicit = target.dataset.track;
      const eventName = explicit ?? (href.startsWith("/contact/") ? "cta_click" : href.startsWith("/insights/") ? "insight_open" : href.startsWith("/solutions/") ? "solution_open" : "");
      if (!eventName) return;
      track(eventName, { label: target.dataset.trackLabel ?? target.textContent?.replace(/\s+/g, " ").trim().slice(0, 80) ?? "", href });
    });
    document.addEventListener("focusin", (event) => {
      const target = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement ? event.target : null;
      const form = target?.closest("form[data-lead-form]");
      if (!form || form.hasAttribute("data-form-started")) return;
      form.setAttribute("data-form-started", "true");
      track("form_start", { form: form.dataset.formKind ?? "lead" });
    });
    document.addEventListener("submit", (event) => {
      const form = event.target instanceof HTMLFormElement && event.target.matches("[data-lead-form]") ? event.target : null;
      if (form) track("form_submit", { form: form.dataset.formKind ?? "lead" });
    });
  };
  initializeSiteAnalytics();
  document.addEventListener("astro:page-load", initializeSiteAnalytics);
})();
