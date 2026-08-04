import { Link } from "react-router-dom";
import { useSiteContent } from "../hooks/useSiteContent";

export default function HomePage() {
  const { t, tLines } = useSiteContent("home");

  const cards = [
    { id: "strategic", href: "/services#strategic" },
    { id: "sled", href: "/services#sled" },
    { id: "software", href: "/services#software" },
  ];

  const credibilityBullets = tLines("whyChoose.bullets");

  const howWeWorkSteps = [1, 2, 3, 4].map((step) => ({
    title: t(`howWeWork.steps.${step}.title`),
    text: t(`howWeWork.steps.${step}.text`),
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-8">
      <section className="glass-panel p-6 md:p-8 fade-in space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/50 shadow-sm min-h-[420px]">
          <img
            src="/homePage.webp"
            alt={t("hero.imageAlt")}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
        </div>

        <div className="glass-panel bg-white/90 p-6 md:p-8 w-full space-y-4">
          <p className="pill inline-flex bg-[#e7efe1] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#0f1a0f]">
            {t("hero.pill")}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-snug text-[#0f1a0f]">{t("hero.tagline")}</h1>
          <p className="text-gray-700 text-base md:text-lg">{t("hero.description")}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to="/services"
              className="inline-flex items-center rounded-full bg-[#2fb3d5] px-5 py-2.5 text-sm md:text-base font-semibold text-white shadow-sm hover:bg-[#2295b2] transition"
            >
              {t("hero.primaryCtaLabel")}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full border border-[#0f1a0f] bg-white/50 px-5 py-2.5 text-sm md:text-base font-semibold text-[#0f1a0f] hover:bg-[#0f1a0f] hover:text-white transition"
            >
              {t("hero.secondaryCtaLabel")}
            </Link>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6 md:p-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-center fade-in">
        <div className="space-y-2">
          <p className="pill inline-flex bg-[#e7efe1] text-[#0f1a0f]">{t("regent.eyebrow")}</p>
          <h2 className="text-2xl font-bold text-[#0f1a0f]">{t("regent.heading")}</h2>
          <p className="text-gray-700 max-w-3xl">{t("regent.description")}</p>
        </div>
        <Link
          to="/regent"
          className="inline-flex w-fit items-center rounded-full bg-[#0f1a0f] px-5 py-2.5 font-semibold text-white hover:bg-black transition"
        >
          {t("regent.ctaLabel")}
        </Link>
      </section>

      <section className="glass-panel p-6 md:p-8 space-y-6 fade-in">
        <div className="flex flex-col gap-2">
          <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            {t("whatWeDo.eyebrow")}
          </p>
          <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{t("whatWeDo.heading")}</h2>
          <p className="text-gray-700 max-w-3xl">{t("whatWeDo.description")}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => {
            const base = `whatWeDo.cards.${card.id}`;
            return (
              <div key={card.id} className="glass-panel border border-gray-100 shadow-sm p-5 space-y-3">
                <h3 className="text-xl font-semibold text-[#0f1a0f]">{t(`${base}.title`)}</h3>
                {t(`${base}.hook`) ? (
                  <p className="text-sm font-semibold text-gray-800">{t(`${base}.hook`)}</p>
                ) : null}
                <p className="text-gray-700 text-sm leading-relaxed">{t(`${base}.description`)}</p>
                <Link to={card.href} className="text-[#2fb3d5] font-semibold text-sm hover:text-[#0f1a0f]">
                  {t("whatWeDo.learnMoreLabel")}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-panel p-6 md:p-8 grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-start fade-in">
        <div className="space-y-4">
          <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            {t("whyChoose.eyebrow")}
          </p>
          <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{t("whyChoose.heading")}</h2>
          <p className="text-gray-700">{t("whyChoose.description")}</p>
          <p className="text-sm font-semibold text-[#0f1a0f]">{t("whyChoose.preface")}</p>
          <ul className="space-y-2 text-sm text-gray-800">
            {credibilityBullets.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#2fb3d5]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel bg-white/90 border border-gray-100 shadow-sm p-5 space-y-3">
          <h3 className="text-xl font-semibold text-[#0f1a0f]">{t("readyCta.title")}</h3>
          <p className="text-gray-700">{t("readyCta.description")}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full bg-[#2fb3d5] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2295b2] transition"
            >
              {t("readyCta.primaryCtaLabel")}
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center rounded-full border border-[#0f1a0f] px-4 py-2 text-sm font-semibold text-[#0f1a0f] hover:bg-[#0f1a0f] hover:text-white transition"
            >
              {t("readyCta.secondaryCtaLabel")}
            </Link>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6 md:p-8 space-y-5 fade-in">
        <div className="flex flex-col gap-2">
          <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            {t("howWeWork.eyebrow")}
          </p>
          <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{t("howWeWork.heading")}</h2>
          <p className="text-gray-700 max-w-3xl">{t("howWeWork.intro")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {howWeWorkSteps.map((step, index) => (
            <div key={step.title} className="glass-panel border border-gray-100 shadow-sm p-4 space-y-2">
              <div className="text-sm font-semibold text-[#2fb3d5]">
                {t("howWeWork.stepLabel", "Step")} {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-[#0f1a0f]">{step.title}</h3>
              <p className="text-sm text-gray-700">{step.text}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/contact#form"
            className="inline-flex items-center rounded-full bg-[#0f1a0f] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition"
          >
            {t("howWeWork.bottomPrimaryCtaLabel")}
          </Link>
          <Link
            to="/articles"
            className="inline-flex items-center rounded-full border border-[#0f1a0f] px-4 py-2 text-sm font-semibold text-[#0f1a0f] hover:bg-[#0f1a0f] hover:text-white transition"
          >
            {t("howWeWork.bottomSecondaryCtaLabel")}
          </Link>
        </div>
      </section>
    </div>
  );
}
