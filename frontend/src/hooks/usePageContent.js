import { PAGES } from "../generated/content";

export function usePageContent(slug) {
  const source = PAGES[slug];
  const page = source
    ? {
        ...source,
        hero_title: source.heroTitle,
        hero_subtitle: source.heroSubtitle,
      }
    : null;
  return {
    page,
    loading: false,
    error: page ? "" : `Unknown page: ${slug}`,
    refresh: () => {},
  };
}
