import { sitemapPages } from "@/data/sitemap";

export function GET() {
  return new Response(JSON.stringify(sitemapPages), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
