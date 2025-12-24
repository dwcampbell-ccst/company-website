import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useSiteContent } from "../hooks/useSiteContent";

export default function ArticlesPage() {
  const { t } = useSiteContent("articles");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, published_at, hero_image_url")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      setPosts(data || []);
      setLoading(false);
    };

    load();
  }, []);

  const recentPosts = useMemo(() => posts.slice(0, 5), [posts]);

  const archives = useMemo(() => {
    const groups = {};
    posts.forEach((post) => {
      const date = post.published_at ? new Date(post.published_at) : null;
      if (!date) return;
      const key = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
      groups[key] = true;
    });
    return Object.keys(groups).sort((a, b) => {
      const [ma, ya] = a.split(" ");
      const [mb, yb] = b.split(" ");
      return new Date(`${mb} 1, ${yb}`) - new Date(`${ma} 1, ${ya}`);
    });
  }, [posts]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "";

  const placeholderImg =
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80";

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-8">
      <div className="glass-panel p-6 md:p-8 space-y-3">
        <p className="pill bg-white/90 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#0f1a0f] w-fit">
          {t("page.eyebrow", "Articles")}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f1a0f]">{t("hero.title")}</h1>
        <p className="text-gray-800 text-lg max-w-3xl">{t("hero.subtitle")}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            to="/services"
            className="inline-flex items-center rounded-full bg-[#2fb3d5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2295b2] transition"
          >
            {t("hero.secondaryCtaLabel")}
          </Link>
          <span className="text-sm text-gray-700">{t("hero.optInText")}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {loading ? (
            <p className="text-sm text-gray-600">{t("list.loading")}</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-gray-700">{t("list.empty")}</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="glass-panel p-4 md:p-5 hover:shadow-lg transition-shadow fade-in space-y-4"
                >
                  <Link to={`/articles/${post.slug}`} className="block overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={post.hero_image_url || placeholderImg}
                      alt={post.title}
                      className="w-full h-64 object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-[#0f1a0f] leading-snug">
                      <Link to={`/articles/${post.slug}`} className="hover:text-[#2fb3d5]">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && <p className="text-gray-700">{post.excerpt}</p>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 items-center">
                    <span className="flex items-center gap-1">- {formatDate(post.published_at)}</span>
                    <span className="flex items-center gap-1">- {post.slug}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="glass-panel p-4 space-y-3">
            <h3 className="text-lg font-semibold text-[#0f1a0f] border-b border-gray-200 pb-2">
              {t("sidebar.recentHeading")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-800">
              {recentPosts.map((post) => (
                <li key={post.id} className="flex items-start gap-2">
                  <span className="mt-1 text-[#0f1a0f]">-</span>
                  <Link to={`/articles/${post.slug}`} className="hover:text-[#2fb3d5] leading-snug">
                    {post.title}
                  </Link>
                </li>
              ))}
              {recentPosts.length === 0 && <li className="text-gray-600">{t("sidebar.noPostsYet")}</li>}
            </ul>
          </div>

          <div className="glass-panel p-4 space-y-3">
            <h3 className="text-lg font-semibold text-[#0f1a0f] border-b border-gray-200 pb-2">
              {t("sidebar.archivesHeading")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-800">
              {archives.map((entry) => (
                <li key={entry} className="flex items-center gap-2">
                  <span className="text-[#0f1a0f]">-</span>
                  <span>{entry}</span>
                </li>
              ))}
              {archives.length === 0 && <li className="text-gray-600">{t("sidebar.noArchivesYet")}</li>}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
