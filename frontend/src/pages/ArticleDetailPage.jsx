import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSiteContent } from "../hooks/useSiteContent";
import { POSTS } from "../generated/content";
import Seo from "../components/Seo";

export default function ArticleDetailPage() {
  const { t } = useSiteContent("article_detail");
  const { slug } = useParams();
  const post = POSTS.find((item) => item.slug === slug) || null;
  const allPosts = POSTS;

  const recentPosts = useMemo(
    () => (post ? allPosts.filter((p) => p.slug !== post.slug).slice(0, 5) : []),
    [allPosts, post?.slug]
  );

  const archives = useMemo(() => {
    const groups = {};
    allPosts.forEach((item) => {
      const date = item.published_at ? new Date(item.published_at) : null;
      if (!date) return;
      const key = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
      groups[key] = true;
    });
    return Object.keys(groups).sort((a, b) => {
      const [ma, ya] = a.split(" ");
      const [mb, yb] = b.split(" ");
      return new Date(`${mb} 1, ${yb}`) - new Date(`${ma} 1, ${ya}`);
    });
  }, [allPosts]);

  if (!post) {
    return (
      <div className="p-6 text-sm text-red-700">
        {t("errorPrefix")} Article not found.
      </div>
    );
  }

  const placeholderImg =
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80";

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "";

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.excerpt || "",
        url: pageUrl,
      });
    } else {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
        "_blank"
      );
    }
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    image: post.hero_image_url || undefined,
    author: {
      "@type": "Organization",
      name: "Campbell Consulting Services of Tallahassee (CCST)",
    },
    publisher: {
      "@type": "Organization",
      name: "Campbell Consulting Services of Tallahassee (CCST)",
      logo: { "@type": "ImageObject", url: "https://www.consultcampbell.com/logo.png" },
    },
    mainEntityOfPage: `https://www.consultcampbell.com/articles/${post.slug}`,
  };

  return (
    <>
      <Seo
        title={post.seo_title || `${post.title} | Campbell Consulting`}
        description={post.seo_description || post.excerpt}
        path={`/articles/${post.slug}`}
        image={post.hero_image_url || "/og-consultcampbell.jpg"}
        type="article"
        structuredData={articleSchema}
      />
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <div className="text-sm text-white flex items-center gap-2">
            <Link to="/" className="hover:text-white/80">
              {t("breadcrumbs.home")}
            </Link>
            <span>&gt;</span>
            <Link to="/articles" className="hover:text-white/80">
              {t("breadcrumbs.articles")}
            </Link>
            <span>&gt;</span>
            <span className="text-white">{post.title}</span>
          </div>

          <div className="glass-panel p-4 md:p-6 space-y-4">
            <img
              src={post.hero_image_url || placeholderImg}
              alt={post.title}
              className="w-full h-72 md:h-96 object-cover rounded-md border border-gray-200"
              loading="lazy"
            />
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-[#0f1a0f] leading-tight">{post.title}</h1>
              {post.published_at && (
                <p className="text-sm text-gray-600">
                  {t("publishedPrefix")} {formatDate(post.published_at)}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="px-3 py-1 rounded-full bg-[#e7efe1] border border-gray-200">{post.slug}</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-[#0f1a0f] text-white px-4 py-2 rounded-md font-semibold hover:bg-black transition"
            >
              {t("shareButtonLabel")}
            </button>

            <article className="prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-panel p-4 space-y-3">
            <h3 className="text-lg font-semibold text-[#0f1a0f] border-b border-gray-200 pb-2">
              {t("sidebar.recentHeading")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-800">
              {recentPosts.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <span className="mt-1 text-[#0f1a0f]">-</span>
                  <Link to={`/articles/${item.slug}`} className="hover:text-[#2fb3d5] leading-snug">
                    {item.title}
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
    </>
  );
}
