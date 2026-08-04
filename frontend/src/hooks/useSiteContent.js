import { useCallback, useMemo } from "react";
import { SITE_CONTENT } from "../generated/content";
import { DEFAULT_SITE_CONTENT } from "../content/defaultSiteContent";

const uniq = (items) => Array.from(new Set(items.filter(Boolean)));
const normalizeScopes = (scopeOrScopes) => {
  if (Array.isArray(scopeOrScopes)) return uniq(scopeOrScopes);
  return scopeOrScopes ? [scopeOrScopes] : [];
};

export const splitLines = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export const splitParagraphs = (value) =>
  String(value || "")
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export function useSiteContent(scopeOrScopes) {
  const scopes = useMemo(() => {
    const requested = normalizeScopes(scopeOrScopes);
    if (requested.length === 0) return ["global"];
    return requested.includes("global") ? requested : ["global", ...requested];
  }, [scopeOrScopes]);

  const content = useMemo(
    () => Object.assign(
      {},
      ...scopes.map((scope) => DEFAULT_SITE_CONTENT[scope] || {}),
      ...scopes.map((scope) => SITE_CONTENT[scope] || {})
    ),
    [scopes]
  );
  const t = useCallback(
    (key, fallback = "") => (content[key] === undefined || content[key] === null ? fallback : content[key]),
    [content]
  );
  const tLines = useCallback((key, fallback = []) => splitLines(t(key, "")).length ? splitLines(t(key, "")) : fallback, [t]);
  const tParagraphs = useCallback(
    (key, fallback = []) => splitParagraphs(t(key, "")).length ? splitParagraphs(t(key, "")) : fallback,
    [t]
  );

  return { t, tLines, tParagraphs, content, loading: false, error: "", refresh: () => {} };
}
