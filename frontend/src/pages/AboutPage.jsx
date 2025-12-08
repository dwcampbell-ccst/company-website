import { usePageContent } from "../hooks/usePageContent";
import { aboutContent } from "../content/siteContent";

export default function AboutPage() {
  const { page, loading, error } = usePageContent("about");

  return (
    <section className="max-w-5xl mx-auto px-4 py-10 md:py-14 space-y-8">
      <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
        <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-700">
          About
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f1a0f]">
          {page?.hero_title || aboutContent.heroTitle}
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl">
          {page?.hero_subtitle || aboutContent.heroSubtitle}
        </p>

        <div className="space-y-4 text-gray-800">
          {(page?.content && (
            <article className="prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </article>
          )) || (
            <>
              {aboutContent.overview.map((para) => (
                <p key={para}>{para}</p>
              ))}

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#0f1a0f]">Mission</h3>
                <p className="text-gray-800">{aboutContent.mission}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#0f1a0f]">Differentiators</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {aboutContent.differentiators.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#0f1a0f]">Leadership</h3>
                <p className="font-semibold text-[#0f1a0f]">
                  {aboutContent.leadership.name} - {aboutContent.leadership.title}
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {aboutContent.leadership.summary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {loading && <p className="text-sm text-gray-600">Loading page content...</p>}
          {error && <p className="text-sm text-red-700">Failed to load content: {error}</p>}
        </div>
      </div>
    </section>
  );
}
