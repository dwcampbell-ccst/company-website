import { useState } from "react";
import { usePageContent } from "../hooks/usePageContent";

export default function ContactPage() {
  const { page, loading, error } = usePageContent("contact");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setStatus("Thank you! We will get back to you.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14 grid gap-6 md:grid-cols-[1fr_1fr] items-start">
      <div className="glass-panel p-6 md:pt-8 space-y-4 fade-in">
        <p className="pill inline-flex bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700">
          Contact
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f1a0f]">
          {page?.hero_title || "Ready to talk about your next delivery milestone?"}
        </h1>
        <p className="text-gray-700 text-lg">
          {page?.hero_subtitle ||
            "Send us a note and we will respond quickly with next steps."}
        </p>

        {loading ? (
          <p className="text-sm text-gray-600">Loading contact details...</p>
        ) : error ? (
          <p className="text-sm text-red-700">Failed to load content: {error}</p>
        ) : (
          <article className="prose prose-slate max-w-none">
            {page?.content ? (
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <p>Add contact details in Supabase under slug <strong>contact</strong>.</p>
            )}
          </article>
        )}
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-4 fade-in">
        <h2 className="text-xl font-semibold text-[#0f1a0f]">Send a message</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2fb3d5]"
              value={form.subject}
              onChange={handleChange}
            />
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
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
        {status && <p className="text-sm text-gray-700">{status}</p>}
      </div>
    </section>
  );
}
