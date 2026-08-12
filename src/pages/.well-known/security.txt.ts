const securityContact = `Contact: mailto:info@globalenterprise.com
Canonical: https://globalenterprise.com/.well-known/security.txt
Expires: 2027-02-01T00:00:00Z
Policy: https://globalenterprise.com/trust/
Preferred-Languages: en
`;

export function GET() {
  return new Response(securityContact, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
