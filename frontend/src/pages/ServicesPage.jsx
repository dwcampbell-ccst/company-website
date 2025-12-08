import { usePageContent } from "../hooks/usePageContent";

export default function ServicesPage() {
  const { page, loading, error } = usePageContent("services");

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
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
          ) : (
            <article className="prose prose-slate max-w-none">
              {page?.content ? (
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              ) : (
                <ul>
                  <li>Product & requirements discovery</li>
                  <li>Systems engineering & integration</li>
                  <li>Delivery governance and PMO support</li>
                  <li>Cloud-native architecture reviews</li>
                </ul>
              )}
            </article>
          )}
        </div>

        <div className="glass-panel p-6 md:p-8 space-y-3 fade-in">
          <h2 className="text-xl font-semibold text-[#0f1a0f]">Engagement Snapshots</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="pill bg-[#e7efe1] px-3 py-2">
              Operating model audits with executive-ready reporting.
            </div>
            <div className="pill bg-[#e7efe1] px-3 py-2">
              Solution roadmaps with measurable KPIs and risk controls.
            </div>
            <div className="pill bg-[#e7efe1] px-3 py-2">
              Vendor selection, RFP support, and integration governance.
            </div>
            <div className="pill bg-[#e7efe1] px-3 py-2">
              Delivery leadership embedded with your teams.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
