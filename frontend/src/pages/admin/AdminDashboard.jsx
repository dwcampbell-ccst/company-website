import { useEffect, useState } from "react";
import { supabase, hasSupabaseEnv } from "../../lib/supabaseClient";
import AdminNav from "../../components/AdminNav";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    published: 0,
    pages: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      const { count: postCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });

      const { count: publishedCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      const { count: pageCount } = await supabase
        .from("pages")
        .select("*", { count: "exact", head: true });

      const { count: messageCount } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true });

      setStats({
        posts: postCount || 0,
        published: publishedCount || 0,
        pages: pageCount || 0,
        messages: messageCount || 0,
      });
      setLoading(false);
    };

    loadStats();
  }, []);

  const cards = [
    { label: "Posts", value: stats.posts },
    { label: "Published", value: stats.published },
    { label: "Pages", value: stats.pages },
    { label: "Contact messages", value: stats.messages },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <p className="pill bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            Admin
          </p>
          <h1 className="text-3xl font-bold text-[#0f1a0f]">Dashboard</h1>
          <p className="text-gray-700">
            Quick snapshot of your content. Use the links below to manage pages and posts.
          </p>
          {!hasSupabaseEnv && (
            <p className="text-sm text-red-700">
              Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable
              admin data.
            </p>
          )}
        </div>
        <AdminNav />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="glass-panel p-4 text-center space-y-2 fade-in"
          >
            <p className="text-sm uppercase tracking-[0.18em] text-gray-600">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-[#0f1a0f]">
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
