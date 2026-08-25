import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

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
