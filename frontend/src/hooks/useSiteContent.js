import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { DEFAULT_SITE_CONTENT } from "../content/defaultSiteContent";

const uniq = (items) => Array.from(new Set(items.filter(Boolean)));

const normalizeScopes = (scopeOrScopes) => {
  if (Array.isArray(scopeOrScopes)) return uniq(scopeOrScopes);
  if (!scopeOrScopes) return [];
  return [scopeOrScopes];
};

const buildDefaultMap = (scopes) => {
  const merged = {};
  scopes.forEach((scope) => {
    Object.assign(merged, DEFAULT_SITE_CONTENT[scope] || {});
  });
  return merged;
};

export const splitLines = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export const splitParagraphs = (value) =>
  String(value || "")
    .split(/\r?\n\s*\r?\n/)
    .map((para) => para.trim())
    .filter(Boolean);

export function useSiteContent(scopeOrScopes) {
  const scopes = useMemo(() => {
    const requested = normalizeScopes(scopeOrScopes);
    if (requested.length === 0) return ["global"];
    return requested.includes("global") ? requested : ["global", ...requested];
  }, [scopeOrScopes]);

  const defaultContent = useMemo(() => buildDefaultMap(scopes), [scopes]);
  const [remoteRows, setRemoteRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("site_content")
      .select("scope,key,value")
      .in("scope", scopes);

    if (error) {
      setError(error.message || "Failed to load site content.");
      setRemoteRows([]);
      setLoading(false);
      return;
    }

    setRemoteRows(data || []);
    setLoading(false);
  }, [scopes]);

  useEffect(() => {
    load();
  }, [load]);

  const content = useMemo(() => {
    const merged = { ...defaultContent };

    const byScope = scopes.reduce((acc, scope, index) => {
      acc[scope] = index;
      return acc;
    }, {});

    const ordered = [...remoteRows].sort((a, b) => (byScope[a.scope] ?? 999) - (byScope[b.scope] ?? 999));
    ordered.forEach((row) => {
      merged[row.key] = row.value;
    });
    return merged;
  }, [defaultContent, remoteRows, scopes]);

  const t = useCallback(
    (key, fallback = "") => {
      const value = content[key];
      return value === undefined || value === null ? fallback : value;
    },
    [content]
  );

  const tLines = useCallback(
    (key, fallback = []) => {
      const raw = t(key, "");
      const lines = splitLines(raw);
      return lines.length ? lines : fallback;
    },
    [t]
  );

  const tParagraphs = useCallback(
    (key, fallback = []) => {
      const raw = t(key, "");
      const paragraphs = splitParagraphs(raw);
      return paragraphs.length ? paragraphs : fallback;
    },
    [t]
  );

  return { t, tLines, tParagraphs, content, loading, error, refresh: load, scopes };
}

