import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.consultcampbell.com";

export default function Seo({
  title,
  description,
  path = "/",
  image = "/og-consultcampbell.jpg",
  type = "website",
  noindex = false,
  structuredData = [],
}) {
  const canonicalUrl = new URL(path, SITE_URL).toString();
  const imageUrl = new URL(image || "/og-consultcampbell.jpg", SITE_URL).toString();
  const graph = Array.isArray(structuredData) ? structuredData : [structuredData];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {noindex ? <meta name="robots" content="noindex,nofollow,noarchive" /> : null}
      {graph.filter(Boolean).map((item, index) => (
        <script type="application/ld+json" key={index}>
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
