import { Link } from "react-router-dom";
import { useSiteContent } from "../hooks/useSiteContent";

export default function AboutPage() {
  const { t, tLines, tParagraphs, loading, error } = useSiteContent("about");

  const overview = tParagraphs("page.overview");

  return (
    <section className="max-w-5xl mx-auto px-4 py-10 md:py-14 space-y-6">
      <div className="glass-panel p-6 md:p-8 space-y-5 fade-in">
        <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-700">
          {t("page.eyebrow")}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f1a0f]">{t("page.heroTitle")}</h1>
        <div className="space-y-4 text-gray-800">
          {overview.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
        {loading && <p className="text-sm text-gray-600">Loading...</p>}
        {error && <p className="text-sm text-red-700">Failed to load content: {error}</p>}
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
        <p className="text-gray-800">
          <span className="text-lg md:text-xl font-bold text-[#0f1a0f]">{t("mission.heading")}</span>{" "}
          <span>{t("mission.text")}</span>
        </p>
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
        <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{t("differentiators.heading")}</h2>
        <p className="text-gray-700">{t("differentiators.intro")}</p>
        <ul className="list-disc pl-5 space-y-2 text-gray-800">
          {tLines("differentiators.list").map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-gray-700">{t("differentiators.outro")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
          <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{t("leadership.heading")}</h2>
          <p className="font-semibold text-[#0f1a0f]">
            {t("leadership.name")} - {t("leadership.title")}
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-800">
            {tLines("leadership.summary").map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
          <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{t("nextStep.heading")}</h2>
          <p className="text-gray-700">{t("nextStep.text")}</p>
          <Link
            to="/services"
            className="inline-flex w-fit items-center rounded-full bg-[#2fb3d5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2295b2] transition"
          >
            {t("nextStep.ctaLabel")}
          </Link>
        </div>
      </div>
    </section>
  );
}
