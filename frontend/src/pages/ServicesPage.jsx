import { Link } from "react-router-dom";
import { usePageContent } from "../hooks/usePageContent";
import { useSiteContent } from "../hooks/useSiteContent";

export default function ServicesPage() {
  const { page, loading, error } = usePageContent("services");
  const { t, tLines } = useSiteContent("services");

  const services = [
    {
      id: "strategic",
      ctaTo: "/contact?topic=Strategic%20Decision%20Support",
    },
    {
      id: "sled",
      ctaTo: "/contact?topic=SLED%20Contracting",
    },
    {
      id: "software",
      ctaTo: "/contact?topic=Software%20and%20Automation",
    },
    {
      id: "regent",
      ctaTo: "/regent",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-8">
      <section className="glass-panel p-6 md:p-8 space-y-4 fade-in">
        <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700">
          {t("page.eyebrow", "Services")}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f1a0f]">
          {page?.hero_title || "Delivery that connects strategy to execution"}
        </h1>
        <p className="text-gray-700 text-lg">
          {page?.hero_subtitle ||
            "Structured consulting, architecture, and product execution to move from idea to launch."}
        </p>
        {loading ? (
          <p className="text-sm text-gray-600">Loading services...</p>
        ) : error ? (
          <p className="text-sm text-red-700">Failed to load content: {error}</p>
        ) : page?.content ? (
          <article className="prose prose-slate max-w-none">
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </article>
        ) : null}
      </section>

      <div className="space-y-8">
        {services.map((service) => {
          const base = `sections.${service.id}`;
          const bullets = tLines(`${base}.bullets`);
          const pastPerformance = tLines(`${base}.pastPerformance`, []);

          return (
            <section
              key={service.id}
              id={service.id}
              className="glass-panel p-6 md:p-8 space-y-4 border border-gray-100 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="pill inline-flex bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-700">
                  {t(`${base}.title`)}
                </p>
                <span className="text-xs text-gray-600">#{service.id}</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{t(`${base}.hook`)}</h2>
              <p className="text-gray-700 text-base">{t(`${base}.description`)}</p>

              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[#0f1a0f]">
                    {t("serviceCard.whatIncludedHeading")}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-800">
                    {bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#2fb3d5]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 glass-panel bg-white/90 border border-gray-100 p-5">
                  <h4 className="text-base font-semibold text-[#0f1a0f]">
                    {t("serviceCard.idealForHeading")}
                  </h4>
                  <p className="text-sm text-gray-700">{t(`${base}.idealFor`)}</p>
                  {pastPerformance.length ? (
                    <div className="space-y-2">
                      <h4 className="text-base font-semibold text-[#0f1a0f]">
                        {t("serviceCard.pastPerformanceHeading")}
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700 list-disc pl-5">
                        {pastPerformance.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={service.ctaTo}
                  className="inline-flex items-center rounded-full bg-[#0f1a0f] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition"
                >
                  {t(`${base}.ctaLabel`)}
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center rounded-full border border-[#0f1a0f] px-4 py-2 text-sm font-semibold text-[#0f1a0f] hover:bg-[#0f1a0f] hover:text-white transition"
                >
                  {t("serviceCard.secondaryCtaLabel")}
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      <section className="glass-panel p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[#0f1a0f]">{t("bottom.title")}</h3>
          <p className="text-gray-700 text-sm md:text-base">
            {t("bottom.description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/contact#form"
            className="inline-flex items-center rounded-full bg-[#2fb3d5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2295b2] transition"
          >
            {t("bottom.primaryCtaLabel")}
          </Link>
          <Link
            to="/articles"
            className="inline-flex items-center rounded-full border border-[#0f1a0f] px-4 py-2 text-sm font-semibold text-[#0f1a0f] hover:bg-[#0f1a0f] hover:text-white transition"
          >
            {t("bottom.secondaryCtaLabel")}
          </Link>
        </div>
      </section>
    </div>
  );
}
