import { Link } from "react-router-dom";
import { usePageContent } from "../hooks/usePageContent";
import { servicesSections } from "../content/siteContent";

export default function ServicesPage() {
  const { page, loading, error } = usePageContent("services");

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-8">
      <section className="glass-panel p-6 md:p-8 space-y-4 fade-in">
        <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700">
          Services
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
        {servicesSections.map((service) => (
          <section
            key={service.id}
            id={service.id}
            className="glass-panel p-6 md:p-8 space-y-4 border border-gray-100 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="pill inline-flex bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-700">
                {service.title}
              </p>
              <span className="text-xs text-gray-600">#{service.id}</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{service.hook}</h2>
            <p className="text-gray-700 text-base">{service.description}</p>

            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] items-start">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#0f1a0f]">What is included</h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  {service.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#2fb3d5]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4 glass-panel bg-white/90 border border-gray-100 p-5">
                <h4 className="text-base font-semibold text-[#0f1a0f]">Ideal for</h4>
                <p className="text-sm text-gray-700">{service.idealFor}</p>
                {service.pastPerformance ? (
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-[#0f1a0f]">Representative past performance</h4>
                    <ul className="space-y-1 text-sm text-gray-700 list-disc pl-5">
                      {service.pastPerformance.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={service.cta.to}
                className="inline-flex items-center rounded-full bg-[#0f1a0f] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition"
              >
                {service.cta.label}
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-full border border-[#0f1a0f] px-4 py-2 text-sm font-semibold text-[#0f1a0f] hover:bg-[#0f1a0f] hover:text-white transition"
              >
                Talk to an expert
              </Link>
            </div>
          </section>
        ))}
      </div>

      <section className="glass-panel p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[#0f1a0f]">Need to move from idea to execution?</h3>
          <p className="text-gray-700 text-sm md:text-base">
            Start with a consultation and leave with a clear, actionable plan.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/contact#form"
            className="inline-flex items-center rounded-full bg-[#2fb3d5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2295b2] transition"
          >
            Schedule a Consultation
          </Link>
          <Link
            to="/articles"
            className="inline-flex items-center rounded-full border border-[#0f1a0f] px-4 py-2 text-sm font-semibold text-[#0f1a0f] hover:bg-[#0f1a0f] hover:text-white transition"
          >
            View Insights
          </Link>
        </div>
      </section>
    </div>
  );
}
