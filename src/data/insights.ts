export const topicSlug = (value: string) => value.toLowerCase().trim().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const topicHref = (category: string) => `/insights/topics/${topicSlug(category)}/`;
