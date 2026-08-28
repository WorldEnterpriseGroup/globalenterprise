import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const externalMarkdownLinks = () => (tree) => {
  const visit = (node) => {
    if (node.type === "link" && typeof node.url === "string") {
      try {
        const url = new URL(node.url, "https://globalenterprise.com");
        const isExternal = ["http:", "https:"].includes(url.protocol) && !["globalenterprise.com", "www.globalenterprise.com"].includes(url.hostname);
        if (isExternal) {
          node.data ??= {};
          node.data.hProperties = { ...node.data.hProperties, target: "_blank", rel: "noopener noreferrer" };
        }
      } catch {
        // Leave malformed or non-web links to the Markdown renderer unchanged.
      }
    }
    node.children?.forEach(visit);
  };
  visit(tree);
};

export default defineConfig({
  site: "https://globalenterprise.com",
  output: "static",
  trailingSlash: "always",
  redirects: {
    "/global/": "/operations/",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  markdown: {
    processor: unified({ remarkPlugins: [externalMarkdownLinks] }),
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !["/privacy/", "/terms/", "/404/", "/visual-sitemap/", "/audiences/", "/contact/thanks/", "/insights/thanks/", "/resources/thanks/", "/trust/vendor-pack/"].includes(new URL(page).pathname),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
