import { usePageContent } from "../hooks/usePageContent";
import { aboutContent } from "../content/siteContent";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const { page, loading, error } = usePageContent("about");

  const heroTitle = page?.hero_title || aboutContent.heroTitle;
  const eyebrow = aboutContent.eyebrow;

  return (
    <section className="max-w-5xl mx-auto px-4 py-10 md:py-14 space-y-6">
      <div className="glass-panel p-6 md:p-8 space-y-5 fade-in">
        <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-700">
          {eyebrow}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f1a0f]">{heroTitle}</h1>
        <div className="space-y-4 text-gray-800">
          {aboutContent.overview.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
        {loading && <p className="text-sm text-gray-600">Loading page content...</p>}
        {error && <p className="text-sm text-red-700">Failed to load content: {error}</p>}
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
        <p className="text-gray-800">
          <span className="text-lg md:text-xl font-bold text-[#0f1a0f]">{aboutContent.missionHeading}</span>{" "}
          <span>{aboutContent.mission}</span>
        </p>
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
        <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{aboutContent.differentiatorsHeading}</h2>
        <p className="text-gray-700">{aboutContent.differentiatorsIntro}</p>
        <ul className="list-disc pl-5 space-y-2 text-gray-800">
          {aboutContent.differentiators.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-gray-700">{aboutContent.differentiatorsOutro}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
          <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{aboutContent.leadershipHeading}</h2>
          <p className="font-semibold text-[#0f1a0f]">
            {aboutContent.leadership.name} — {aboutContent.leadership.title}
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-800">
            {aboutContent.leadership.summary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
          <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{aboutContent.nextStepHeading}</h2>
          <p className="text-gray-700">{aboutContent.nextStepText}</p>
          <Link
            to={aboutContent.nextStepCta.to}
            className="inline-flex w-fit items-center rounded-full bg-[#2fb3d5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2295b2] transition"
          >
            {aboutContent.nextStepCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
