import { Link } from "react-router-dom";
import { useSiteContent } from "../hooks/useSiteContent";

const capabilities = ["policy", "audit", "memory"];
const faqItems = [1, 2, 3, 4];

export default function RegentPage() {
  const { t } = useSiteContent("regent");

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-8">
      <section className="glass-panel p-6 md:p-10 space-y-5 fade-in">
        <p className="pill inline-flex bg-[#e7efe1] text-[#0f1a0f]">{t("eyebrow")}</p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-[#0f1a0f]">{t("title")}</h1>
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl">{t("opening")}</p>
        <Link
          to="/contact#calendar"
          className="inline-flex items-center rounded-full bg-[#2fb3d5] px-5 py-3 font-semibold text-white shadow-sm hover:bg-[#2295b2] transition"
        >
          {t("cta.button")}
        </Link>
      </section>

      <section className="glass-panel p-6 md:p-8 space-y-3">
        <h2 className="text-2xl font-bold text-[#0f1a0f]">{t("problem.heading")}</h2>
        <p className="text-gray-700 leading-relaxed">{t("problem.text")}</p>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-bold text-white">{t("capabilities.heading")}</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {capabilities.map((id) => (
            <article key={id} className="glass-panel p-6 space-y-3">
              <h3 className="text-xl font-bold text-[#0f1a0f]">{t(`capabilities.${id}.title`)}</h3>
              <p className="text-gray-700 leading-relaxed">{t(`capabilities.${id}.text`)}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass-panel p-6 md:p-8 space-y-3">
          <h2 className="text-2xl font-bold text-[#0f1a0f]">{t("audience.heading")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("audience.text")}</p>
        </section>
        <section className="glass-panel p-6 md:p-8 space-y-3">
          <h2 className="text-2xl font-bold text-[#0f1a0f]">{t("fit.heading")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("fit.text")}</p>
        </section>
      </div>

      <section className="glass-panel p-6 md:p-8 space-y-5">
        <h2 className="text-2xl font-bold text-[#0f1a0f]">{t("faq.heading")}</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item} className="rounded-xl border border-gray-200 bg-white/70 p-4" open={item === 1}>
              <summary className="cursor-pointer font-semibold text-[#0f1a0f]">
                {t(`faq.${item}.question`)}
              </summary>
              <p className="pt-3 text-gray-700 leading-relaxed">{t(`faq.${item}.answer`)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="glass-panel p-6 md:p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#0f1a0f]">{t("cta.heading")}</h2>
        <Link
          to="/contact#calendar"
          className="inline-flex items-center rounded-full bg-[#0f1a0f] px-5 py-3 font-semibold text-white hover:bg-black transition"
        >
          {t("cta.button")}
        </Link>
      </section>
    </div>
  );
}
