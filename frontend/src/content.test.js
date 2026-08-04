import { describe, expect, it } from "vitest";
import { getStaticRoutes } from "./App";
import { PAGES, POSTS, SITE_CONTENT } from "./generated/content";

describe("generated public content", () => {
  it("has unique SEO metadata and canonical paths for every page", () => {
    const pages = Object.values(PAGES);
    expect(pages).toHaveLength(6);
    expect(new Set(pages.map((page) => page.seoTitle)).size).toBe(pages.length);
    expect(new Set(pages.map((page) => page.seoDescription)).size).toBe(pages.length);
    expect(new Set(pages.map((page) => page.canonicalPath)).size).toBe(pages.length);
  });

  it("publishes the Regent page and excludes drafts from static routes", () => {
    const routes = getStaticRoutes();
    expect(routes).toContain("/regent");
    for (const post of POSTS) {
      expect(post.status).toBe("published");
      expect(routes).toContain(`/articles/${post.slug}`);
    }
  });

  it("contains complete Regent FAQ content", () => {
    for (const item of [1, 2, 3, 4]) {
      expect(SITE_CONTENT.regent[`faq.${item}.question`]).toBeTruthy();
      expect(SITE_CONTENT.regent[`faq.${item}.answer`]).toBeTruthy();
    }
  });
});
