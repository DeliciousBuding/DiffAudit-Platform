import Script from "next/script";

/**
 * JSON-LD structured data for the DiffAudit Platform homepage.
 * Uses SoftwareApplication schema for research tool discoverability.
 */
export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DiffAudit Platform",
    applicationCategory: "ResearchApplication",
    operatingSystem: "Web",
    description:
      "Open-source privacy-risk audit workspace for diffusion models. Inspect training-data membership signals with evidence-gated metrics and reproducible benchmarks.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <Script
      id="json-ld-software-app"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
