import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Seo from "./components/Seo";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import RegentPage from "./pages/RegentPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import { PAGES, POSTS, SITE_CONTENT } from "./generated/content";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Campbell Consulting Services of Tallahassee (CCST)",
  url: "https://www.consultcampbell.com",
  logo: "https://www.consultcampbell.com/logo.png",
  description: "SDVOSB consultancy building AI governance infrastructure and systems solutions.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tallahassee",
    addressRegion: "FL",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.linkedin.com/company/campbell-consulting-services-of-tallahassee",
    "https://thesystemsthinkerdwc.substack.com",
  ],
};

const getRegentStructuredData = () => {
  const content = SITE_CONTENT.regent || {};
  return [
    organizationSchema,
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Regent",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Windows",
      description:
        "Runtime AI governance: policy enforcement on every AI turn and a tamper-evident audit chain of agent activity.",
      publisher: {
        "@type": "Organization",
        name: "Campbell Consulting Services of Tallahassee (CCST)",
      },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/PreOrder",
        description: "Alpha pilot program",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [1, 2, 3, 4].map((item) => ({
        "@type": "Question",
        name: content[`faq.${item}.question`],
        acceptedAnswer: {
          "@type": "Answer",
          text: content[`faq.${item}.answer`],
        },
      })),
    },
  ];
};

function PageRoute({ slug, children }) {
  const page = PAGES[slug];
  return (
    <>
      <Seo
        title={page.seoTitle}
        description={page.seoDescription}
        path={page.canonicalPath}
        image={page.ogImage}
        structuredData={slug === "regent" ? getRegentStructuredData() : organizationSchema}
      />
      {children}
    </>
  );
}

export function getStaticRoutes() {
  return [
    "/",
    "/services",
    "/regent",
    "/articles",
    ...POSTS.map((post) => `/articles/${post.slug}`),
    "/about",
    "/contact",
    "/404",
  ];
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PageRoute slug="home"><HomePage /></PageRoute>} />
        <Route path="/services" element={<PageRoute slug="services"><ServicesPage /></PageRoute>} />
        <Route path="/regent" element={<PageRoute slug="regent"><RegentPage /></PageRoute>} />
        <Route path="/articles" element={<PageRoute slug="articles"><ArticlesPage /></PageRoute>} />
        <Route path="/articles/:slug" element={<ArticleDetailPage />} />
        <Route path="/about" element={<PageRoute slug="about"><AboutPage /></PageRoute>} />
        <Route path="/contact" element={<PageRoute slug="contact"><ContactPage /></PageRoute>} />
        <Route
          path="*"
          element={
            <>
              <Seo
                title="Page Not Found | Campbell Consulting"
                description="The requested page could not be found."
                path="/404"
                noindex
              />
              <NotFoundPage />
            </>
          }
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
