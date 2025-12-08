import { useEffect, useState } from "react";
import { supabase, hasSupabaseEnv } from "../../lib/supabaseClient";
import AdminNav from "../../components/AdminNav";

const emptyPage = {
  id: null,
  slug: "",
  title: "",
  hero_title: "",
  hero_subtitle: "",
  content: "",
};

export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [editing, setEditing] = useState(emptyPage);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPages = async () => {
    if (!hasSupabaseEnv || !supabase) {
      setPages([]);
      return;
    }

    const { data } = await supabase
      .from("pages")
      .select("*")
      .order("slug", { ascending: true });
    setPages(data || []);
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleSelect = (page) => {
    setEditing({ ...page });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditing((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!hasSupabaseEnv || !supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editing.id) {
        await supabase
          .from("pages")
          .update({
            title: editing.title,
            slug: editing.slug,
            hero_title: editing.hero_title,
            hero_subtitle: editing.hero_subtitle,
            content: editing.content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id);
      } else {
        await supabase
          .from("pages")
          .insert({
            title: editing.title,
            slug: editing.slug,
            hero_title: editing.hero_title,
            hero_subtitle: editing.hero_subtitle,
            content: editing.content,
          });
      }
      await loadPages();
    } catch (err) {
      setError("Save failed. Please check the fields.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="pill bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            Admin
          </p>
          <h1 className="text-3xl font-bold text-[#0f1a0f]">Manage Pages</h1>
        </div>
        <AdminNav />
      </div>

      <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] items-start">
        <div className="space-y-3">
          {pages.map((page) => (
            <button
              key={page.id}
              className="glass-panel p-4 w-full text-left hover:shadow-md transition"
              onClick={() => handleSelect(page)}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-gray-600">
                {page.slug}
              </p>
              <h3 className="text-lg font-semibold text-[#0f1a0f]">{page.title}</h3>
            </button>
          ))}

          {pages.length === 0 && (
            <p className="text-sm text-gray-700">
              {hasSupabaseEnv
                ? "No pages found. Use the form to create one."
                : "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."}
            </p>
          )}
        </div>

        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#0f1a0f]">
              {editing.id ? "Edit Page" : "Create Page"}
            </h2>
            {editing.id && (
              <button
                onClick={() => setEditing(emptyPage)}
                className="text-sm font-semibold text-[#2fb3d5] hover:text-[#0f1a0f]"
              >
                Clear
              </button>
            )}
          </div>

          <form className="space-y-3" onSubmit={handleSave}>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="slug">
                Slug
              </label>
              <input
                id="slug"
                name="slug"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={editing.slug}
                onChange={handleChange}
                placeholder="home, services, about, contact"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={editing.title}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="hero_title">
                Hero Title
              </label>
              <input
                id="hero_title"
                name="hero_title"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={editing.hero_title || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="hero_subtitle">
                Hero Subtitle
              </label>
              <input
                id="hero_subtitle"
                name="hero_subtitle"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={editing.hero_subtitle || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="content">
                Content (HTML)
              </label>
              <textarea
                id="content"
                name="content"
                rows={8}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={editing.content}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#0f1a0f] text-white py-2 rounded-md font-semibold hover:bg-black transition disabled:opacity-70"
            >
              {saving ? "Saving..." : editing.id ? "Update Page" : "Create Page"}
            </button>

            {error && <p className="text-sm text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
