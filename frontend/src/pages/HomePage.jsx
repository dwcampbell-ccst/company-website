import { Link } from "react-router-dom";
import { usePageContent } from "../hooks/usePageContent";

export default function HomePage() {
  const { page, loading, error } = usePageContent("home");

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <div className="glass-panel p-6 md:p-10 space-y-8 fade-in">
        <div className="relative overflow-hidden rounded-2xl border border-white/50 shadow-sm">
          <img
            src="/homePage.webp"
            alt="Campbell Consulting team collaborating in the office"
            className="w-full h-72 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end md:justify-center px-6 py-6 md:px-10 space-y-3 max-w-3xl text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/80">Welcome To</p>
            <h1 className="text-2xl md:text-4xl font-bold leading-snug">
              Campbell Consulting Services of Tallahassee LLC
            </h1>
            <p className="text-xs md:text-sm font-semibold tracking-[0.14em] text-white/85">
              UEI: XPD2XYN36QC1&nbsp;&nbsp; CAGE: 8AZP4
            </p>
            <p className="text-sm md:text-base text-white/90">
              CCST LLC is a Florida-based, SDVOSB-certified firm delivering expert consulting
              services in IT strategy, data governance, and cybersecurity. Our team ensures
              mission success by aligning modern technology solutions with federal objectives
              through a collaborative and agile approach.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-gray-800">
          <p>
            At Campbell Consulting Services of Tallahassee we are all about doing things right the
            first time. Let us help you with all of your IT needs, whether its Business Process
            Analysis or Full Life-Cycle Systems Engineering we are here to make a difference.
          </p>
          <p>
            There are three things which make an IT project successful. These are Defining the
            Scope, Identifying the Requirements, and complete Documentation of all phases of the
            project. By doing these things well, we believe that we can help anyone successfully
            complete any IT project on time and within budget while still maintaining the
            performance desired.
          </p>
          <p>
            <strong>Defining the Scope:</strong> The scope of a project is identifying the goals
            that are to be achieved by the project. Our ability to assist you in defining these
            goals through full systems thinking can ensure that the important pieces are not
            overlooked.
          </p>
          <p>
            <strong>Identifying the Requirements:</strong> Each project has its own unique set of
            requirements. Requirements are the definitive list of needs which must happen to meet
            the goals of the project set up in the scope. The elicitation process is done in
            conjunction with all project stakeholders to ensure a comprehensive list is identified.
            After that the list is managed through the life of the project to ensure that it is kept
            up to date as circumstances change.
          </p>
          <p>
            <strong>Complete Documentation:</strong> Each phase of the Systems Development Life
            Cycle contains its own documentation which explains and identifies the results. Even
            Agile project have documentation which is needed to keep things moving forward smoothly.
            By producing the relevant documentation at the appropriate time throughout the life
            cycle, the project can stay on time and budget.
          </p>
          <p className="font-semibold">Why should you work with us?</p>
          <p>
            With over a decade of experience, we have seen our fair share of projects go wrong. With
            the best of intentions, the scope of a project begins to grow. Budgets get tightened and
            the schedule slips further and further to the right. These situations can be fatal for
            any project. By working with Campbell Consulting Services, customers can protect the
            integrity of the project by making sure that each new need that is identified, remains
            within the scope of the project. By working with stakeholders to produce a complete
            scope definition and the execution of effective requirements elicitation a complete
            picture of the project is formed. This provides the blueprint to build the project,
            ensuring that only those things which will produce the desired results get done, saving
            time and money.
          </p>
          <p>
            Take a look and see what we have to offer{" "}
            <Link to="/services" className="text-[#2fb3d5] font-semibold hover:text-[#0f1a0f]">
              here
            </Link>
            .
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Loading page content...</p>
        ) : error ? (
          <p className="text-sm text-red-700">Failed to load content: {error}</p>
        ) : page?.content ? (
          <article className="prose prose-slate max-w-none">
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </article>
        ) : null}
      </div>
    </section>
  );
}
