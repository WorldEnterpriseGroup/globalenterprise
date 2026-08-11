const base = (process.env.LIVE_SITE_URL ?? "https://globalenterprise.com").replace(/\/$/, "");
const routes = ["/", "/services/", "/global/", "/proof/", "/trust/", "/case-studies/", "/insights/", "/resources/", "/contact/", "/sitemap-index.xml", "/.well-known/security.txt"];
const failures = [];

for (const route of routes) {
  const url = `${base}${route}`;
  try {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) failures.push(`${route}: ${response.status} ${response.statusText}`);
    else console.log(`✓ ${route} ${response.status}`);
  } catch (error) {
    failures.push(`${route}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `✗ ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`✓ audited ${routes.length} live routes at ${base}`);
