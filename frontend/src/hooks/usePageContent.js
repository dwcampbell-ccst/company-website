import { useCallback, useEffect, useState } from "react";
import { supabase, hasSupabaseEnv } from "../lib/supabaseClient";

export function usePageContent(slug) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!hasSupabaseEnv || !supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setPage(data);
      setError("");
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return { page, loading, error, refresh: load };
}
