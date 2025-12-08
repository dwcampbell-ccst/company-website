import { useEffect, useState } from "react";
import { supabase, hasSupabaseEnv } from "../../lib/supabaseClient";
import AdminNav from "../../components/AdminNav";

const emptyPost = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "draft",
  hero_image_url: "",
  published_at: null,
};

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(emptyPost);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadPosts = async () => {
    if (!hasSupabaseEnv || !supabase) {
      setPosts([]);
      return;
    }

    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data || []);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleEdit = (post) => {
    setEditing({ ...post });
  };

  const handleNew = () => {
    setEditing(emptyPost);
  };

  const handleDelete = async (id) => {
    if (!hasSupabaseEnv || !supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusyId(id);
    await supabase.from("posts").delete().eq("id", id);
    await loadPosts();
    if (editing.id === id) setEditing(emptyPost);
    setBusyId(null);
  };

  const handlePublish = async (post) => {
    if (!hasSupabaseEnv || !supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    setBusyId(post.id);
    await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: post.published_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);
    await loadPosts();
    setBusyId(null);
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

    const payload = {
      title: editing.title,
      slug: editing.slug,
      excerpt: editing.excerpt,
      content: editing.content,
      status: editing.status,
      hero_image_url: editing.hero_image_url,
      updated_at: new Date().toISOString(),
      published_at:
        editing.status === "published"
          ? editing.published_at || new Date().toISOString()
          : null,
    };

    try {
      if (editing.id) {
        await supabase.from("posts").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("posts").insert(payload);
      }
      await loadPosts();
      setEditing(emptyPost);
    } catch (err) {
      setError("Save failed. Check required fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <p className="pill bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            Admin
          </p>
          <h1 className="text-3xl font-bold text-[#0f1a0f]">Manage Posts</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <AdminNav />
          <button
            onClick={handleNew}
            className="pill bg-[#0f1a0f] text-white px-4 py-2 font-semibold hover:bg-black transition"
          >
            New Post
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="glass-panel p-4 flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-600">
                  {post.status}
                </p>
                <h3 className="text-lg font-semibold text-[#0f1a0f]">{post.title}</h3>
                <p className="text-sm text-gray-700">{post.slug}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-sm font-semibold text-[#2fb3d5] hover:text-[#0f1a0f]"
                >
                  Edit
                </button>
                {post.status !== "published" && (
                  <button
                    onClick={() => handlePublish(post)}
                    disabled={busyId === post.id}
                    className="text-xs font-semibold text-green-700 hover:text-green-900 disabled:opacity-60"
                  >
                    {busyId === post.id ? "Publishing..." : "Publish"}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={busyId === post.id}
                  className="text-xs font-semibold text-red-700 hover:text-red-900 disabled:opacity-60"
                >
                  {busyId === post.id ? "Removing..." : "Delete"}
                </button>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <p className="text-sm text-gray-700">
              {hasSupabaseEnv
                ? "No posts yet. Create your first article."
                : "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."}
            </p>
          )}
        </div>

        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#0f1a0f]">
              {editing.id ? "Edit Post" : "Create Post"}
            </h2>
            {editing.id && (
              <button
                onClick={handleNew}
                className="text-sm font-semibold text-[#2fb3d5] hover:text-[#0f1a0f]"
              >
                Clear
              </button>
            )}
          </div>

          <form className="space-y-3" onSubmit={handleSave}>
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
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="excerpt">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={editing.excerpt}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="content">
                Content (HTML or Markdown rendered as HTML)
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={editing.content}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="hero_image_url">
                Hero Image URL
              </label>
              <input
                id="hero_image_url"
                name="hero_image_url"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={editing.hero_image_url || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={editing.status}
                onChange={handleChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#0f1a0f] text-white py-2 rounded-md font-semibold hover:bg-black transition disabled:opacity-70"
            >
              {saving ? "Saving..." : editing.id ? "Update Post" : "Create Post"}
            </button>

            {error && <p className="text-sm text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
