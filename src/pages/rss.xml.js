import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { site } from "../data/site";

export async function GET(context) {
  const insights = (await getCollection("insights")).filter((entry) => !entry.data.draft).sort((a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0));
  return rss({
    title: `${site.name} insights`,
    description: site.description,
    site: context.site ?? site.url,
    items: insights.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/insights/${entry.id}/`,
    })),
  });
}
