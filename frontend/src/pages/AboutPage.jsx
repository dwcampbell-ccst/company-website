import { usePageContent } from "../hooks/usePageContent";

export default function AboutPage() {
  const { page, loading, error } = usePageContent("about");

  return (
    <section className="max-w-5xl mx-auto px-4 py-10 md:py-14">
      <div className="glass-panel p-6 md:p-10 space-y-5 fade-in">
        <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-700">
          About
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f1a0f]">
          {page?.hero_title || "We align business strategy with reliable delivery"}
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl">
          {page?.hero_subtitle ||
            "Leaders in analysis, engineering, and program governance for organizations that need clarity and momentum."}
        </p>

        <article className="prose prose-slate max-w-none">
          <div className="space-y-4">
            <p>
              Campbell Consulting Services is a SDVOSB company that provides Business Analysis and
              Systems Engineering within the Government and Commercial sectors, for IT Strategy and
              Consulting. By focusing on Full Life Cycle Systems Thinking, Requirements Engineering,
              and Configuration Management Support, we aim to ensure that the clients needs are met
              and they are setup for success.
            </p>

            <div>
              <h3>Core Competencies</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>IT Strategy and Planning for Projects and Organizations</li>
                <li>Requirements Elicitation and Stakeholder Management</li>
                <li>IT Architecture and Design Development</li>
                <li>Process Analysis and Improvement</li>
                <li>Agile Development</li>
                <li>Full Systems Development Life Cycle Support</li>
              </ul>
            </div>

            <div>
              <h3>Differentiators</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Ensure execution of the value proposition through the expert application of full
                  life cycle systems thinking
                </li>
                <li>
                  Provide project direction through complete process definition, use case
                  development and delivery of thorough requirement sets
                </li>
                <li>
                  Minimize downtime through the application of Change Control via a consistent Change
                  Management Strategy
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
