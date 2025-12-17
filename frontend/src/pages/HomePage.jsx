import { Link } from "react-router-dom";
import {
  homeHero,
  whatWeDoCards,
  credibilityBullets,
  whyChooseContent,
  readyCta,
  howWeWorkIntro,
  howWeWorkSteps,
} from "../content/siteContent";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-8">
      <section className="glass-panel p-6 md:p-8 fade-in space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/50 shadow-sm min-h-[420px]">
          <img
            src="/homePage.webp"
            alt="Campbell Consulting homepage hero"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
        </div>

        <div className="glass-panel bg-white/90 p-6 md:p-8 w-full space-y-4">
          <p className="pill inline-flex bg-[#e7efe1] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#0f1a0f]">
            {homeHero.title}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-snug text-[#0f1a0f]">{homeHero.tagline}</h1>
          <p className="text-gray-700 text-base md:text-lg">{homeHero.description}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to={homeHero.primaryCta.to}
              className="inline-flex items-center rounded-full bg-[#2fb3d5] px-5 py-2.5 text-sm md:text-base font-semibold text-white shadow-sm hover:bg-[#2295b2] transition"
            >
              {homeHero.primaryCta.label}
            </Link>
            <Link
              to={homeHero.secondaryCta.to}
              className="inline-flex items-center rounded-full border border-[#0f1a0f] bg-white/50 px-5 py-2.5 text-sm md:text-base font-semibold text-[#0f1a0f] hover:bg-[#0f1a0f] hover:text-white transition"
            >
              {homeHero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6 md:p-8 space-y-6 fade-in">
        <div className="flex flex-col gap-2">
          <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            What We Do
          </p>
          <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">Three service lines</h2>
          <p className="text-gray-700 max-w-3xl">
            Strategic clarity, contracting delivery, and practical software to turn ideas into measurable outcomes.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {whatWeDoCards.map((card) => (
            <div key={card.id} className="glass-panel border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-xl font-semibold text-[#0f1a0f]">{card.title}</h3>
              {card.hook ? <p className="text-sm font-semibold text-gray-800">{card.hook}</p> : null}
              <p className="text-gray-700 text-sm leading-relaxed">{card.description}</p>
              <Link to={card.href} className="text-[#2fb3d5] font-semibold text-sm hover:text-[#0f1a0f]">
                Learn more
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel p-6 md:p-8 grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-start fade-in">
        <div className="space-y-4">
          <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            Why Organizations Choose CCST
          </p>
          <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">{whyChooseContent.heading}</h2>
          <p className="text-gray-700">{whyChooseContent.description}</p>
          <p className="text-sm font-semibold text-[#0f1a0f]">{whyChooseContent.preface}</p>
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
          <h3 className="text-xl font-semibold text-[#0f1a0f]">{readyCta.title}</h3>
          <p className="text-gray-700">{readyCta.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={readyCta.primaryCta.to}
              className="inline-flex items-center rounded-full bg-[#2fb3d5] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2295b2] transition"
            >
              {readyCta.primaryCta.label}
            </Link>
            <Link
              to={readyCta.secondaryCta.to}
              className="inline-flex items-center rounded-full border border-[#0f1a0f] px-4 py-2 text-sm font-semibold text-[#0f1a0f] hover:bg-[#0f1a0f] hover:text-white transition"
            >
              {readyCta.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6 md:p-8 space-y-5 fade-in">
        <div className="flex flex-col gap-2">
          <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            How We Work
          </p>
          <h2 className="text-lg md:text-xl font-bold text-[#0f1a0f]">Simple 4-step process</h2>
          <p className="text-gray-700 max-w-3xl">{howWeWorkIntro}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {howWeWorkSteps.map((step, index) => (
            <div key={step.title} className="glass-panel border border-gray-100 shadow-sm p-4 space-y-2">
              <div className="text-sm font-semibold text-[#2fb3d5]">Step {index + 1}</div>
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
            Schedule a Consultation
          </Link>
          <Link
            to="/articles"
            className="inline-flex items-center rounded-full border border-[#0f1a0f] px-4 py-2 text-sm font-semibold text-[#0f1a0f] hover:bg-[#0f1a0f] hover:text-white transition"
          >
            View All Insights
          </Link>
        </div>
      </section>
    </div>
  );
}
