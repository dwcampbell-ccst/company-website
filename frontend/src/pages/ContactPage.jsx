import { useState } from "react";
import { usePageContent } from "../hooks/usePageContent";
import { contactContent } from "../content/siteContent";

const DOWNLOAD_FILE_PATH = "/downloads/ccst-brief.pdf";
const HUBSPOT_MEETING_URL = (import.meta.env.VITE_HUBSPOT_MEETING_URL || "").trim();
const HUBSPOT_MEETING_EMBED =
  HUBSPOT_MEETING_URL &&
  `${HUBSPOT_MEETING_URL}${HUBSPOT_MEETING_URL.includes("?") ? "&" : "?"}embed=true`;

const topicToFilename = (topic) => {
  const safe = (topic || "General Inquiry")
    .trim()
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "Download";
  return `${safe}.pdf`;
};

export default function ContactPage() {
  const { page, loading, error } = usePageContent("contact");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    topics: new Set(["General Inquiry"]),
    message: "",
  });
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const toggleTopic = (topic) => {
    setForm((prev) => {
      const next = new Set(prev.topics);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      if (next.size === 0) {
        next.add("General Inquiry");
      }
      return { ...prev, topics: next };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus("");

    const selectedTopics = Array.from(form.topics);
    const primaryTopic = selectedTopics[0] || "General Inquiry";
    const topicLine = selectedTopics.join(", ");
    const subject = `Contact: ${topicLine}`;

    const apiBase = (import.meta.env.VITE_CONTACT_API_URL || "").replace(/\/$/, "");
    const endpoint = `${apiBase}/api/contact`;

    const downloadFilename = topicToFilename(primaryTopic);
    const downloadPath = `/downloads/${downloadFilename}`;

    const triggerDownload = () => {
      const link = document.createElement("a");
      link.href = downloadPath;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          phone: form.phone,
          topics: selectedTopics,
          subject,
          message: form.message.trim(),
          downloadPath,
          downloadFilename,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const result = await res.json().catch(() => ({}));
      setStatus(
        result?.emailSent === false
          ? "Thank you! Your message was received, but email delivery is not set up yet."
          : "Thank you! We will get back to you soon."
      );
      triggerDownload();
      setForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        topics: new Set(["General Inquiry"]),
        message: "",
      });
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleScheduleClick = (event) => {
    // If a HubSpot meeting URL is configured, open the modal embed.
    if (HUBSPOT_MEETING_EMBED) {
      event.preventDefault();
      setShowMeetingModal(true);
      return;
    }

    // Otherwise fall back to scrolling to the calendar section.
    const fallbackLink = contactContent.contactInfo.scheduleHref || "#calendar";
    const targetId = fallbackLink.split("#")[1];
    if (targetId) {
      event.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-6" id="form">
      <div className="glass-panel p-6 md:p-8 grid gap-6 md:grid-cols-[1fr_1.1fr] items-start">
        <div className="space-y-4">
          <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700">
            Contact
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f1a0f]">
            {page?.hero_title || contactContent.introTitle}
          </h1>
          <p className="text-gray-700 text-lg">
            {page?.hero_subtitle || contactContent.introSubtitle}
          </p>

          {loading ? (
            <p className="text-sm text-gray-600">Loading contact details...</p>
          ) : error ? (
            <p className="text-sm text-red-700">Failed to load content: {error}</p>
          ) : page?.content ? (
            <article className="prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </article>
          ) : null}

          <div className="glass-panel bg-white/90 border border-gray-100 p-4 space-y-2">
            <h3 className="text-lg font-semibold text-[#0f1a0f]">Contact Information</h3>
            <ul className="space-y-1 text-sm text-gray-800">
              <li>Email: {contactContent.contactInfo.email}</li>
              <li>Phone: {contactContent.contactInfo.phone}</li>
              <li>Business: {contactContent.contactInfo.business}</li>
              <li>Location: {contactContent.contactInfo.location}</li>
            </ul>
            <a
              href={HUBSPOT_MEETING_URL || contactContent.contactInfo.scheduleHref || "#calendar"}
              onClick={handleScheduleClick}
              className="inline-flex items-center rounded-full bg-[#2fb3d5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2295b2] transition"
            >
              {contactContent.contactInfo.scheduleLabel}
            </a>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#0f1a0f]">Why organizations contact CCST</h3>
            <ul className="space-y-1 text-sm text-gray-800 list-disc pl-5">
              {contactContent.reasons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
          <h2 className="text-xl font-semibold text-[#0f1a0f]">Send us a message</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2fb3d5]"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2fb3d5]"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700" htmlFor="company">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2fb3d5]"
                  value={form.company}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700" htmlFor="phone">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2fb3d5]"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Topic / Service of Interest</p>
              <div className="grid grid-cols-2 gap-2">
                {contactContent.topics.map((topic) => (
                  <label key={topic} className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.topics.has(topic)}
                      onChange={() => toggleTopic(topic)}
                      className="h-4 w-4 rounded border-gray-300 text-[#2fb3d5] focus:ring-[#2fb3d5]"
                    />
                    {topic}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2fb3d5]"
                value={form.message}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#0f1a0f] text-white py-2 rounded-md font-semibold hover:bg-black transition disabled:opacity-70"
            >
              {sending ? "Sending..." : "Submit"}
            </button>
          </form>
          {status && <p className="text-sm text-gray-700">{status}</p>}
          <p className="text-xs text-gray-600">Your information is confidential and used only to respond.</p>
        </div>
      </div>

      {showMeetingModal && HUBSPOT_MEETING_EMBED && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
            <button
              type="button"
              aria-label="Close scheduler"
              onClick={() => setShowMeetingModal(false)}
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-100"
            >
              ✕
            </button>
            <div className="p-4 border-b border-gray-100" aria-hidden="true" />
            <div className="w-full" style={{ minHeight: "780px" }}>
              <iframe
                src={HUBSPOT_MEETING_EMBED}
                title="Book a Strategic Intro Call"
                style={{ width: "100%", minHeight: "780px", border: "none" }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
