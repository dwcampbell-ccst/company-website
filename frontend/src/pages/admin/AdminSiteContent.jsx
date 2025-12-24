import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminNav from "../../components/AdminNav";
import { DEFAULT_SITE_CONTENT, getDefaultSiteContentRows } from "../../content/defaultSiteContent";

const scopeOptions = Object.keys(DEFAULT_SITE_CONTENT);

const sortByKey = (a, b) => (a.key || "").localeCompare(b.key || "");

export default function AdminSiteContent() {
  const [scope, setScope] = useState("global");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const load = async (selectedScope = scope) => {
    setLoading(true);
    setError("");
    setNotice("");

    const { data, error } = await supabase
      .from("site_content")
      .select("id,scope,key,value,updated_at")
      .eq("scope", selectedScope)
      .order("key", { ascending: true });

    if (error) {
      setError(error.message || "Failed to load site content.");
      setRows([]);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load(scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => (row.key || "").toLowerCase().includes(q));
  }, [rows, filter]);

  const handleChangeValue = (key, value) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, value } : row)));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = rows
        .filter((row) => row.key && row.key.trim())
        .map((row) => ({
          scope,
          key: row.key.trim(),
          value: row.value ?? "",
        }));

      const { error } = await supabase.from("site_content").upsert(payload, {
        onConflict: "scope,key",
      });

      if (error) throw error;

      setNotice("Saved.");
      await load(scope);
    } catch (err) {
      setError(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const key = newKey.trim();
    if (!key) {
      setError("Key is required.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("site_content").upsert(
        [
          {
            scope,
            key,
            value: newValue ?? "",
          },
        ],
        { onConflict: "scope,key" }
      );
      if (error) throw error;
      setNewKey("");
      setNewValue("");
      setNotice("Added.");
      await load(scope);
    } catch (err) {
      setError(err?.message || "Failed to add key.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key) => {
    const ok = window.confirm(`Delete "${scope}:${key}"?`);
    if (!ok) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { error } = await supabase
        .from("site_content")
        .delete()
        .eq("scope", scope)
        .eq("key", key);
      if (error) throw error;
      setNotice("Deleted.");
      await load(scope);
    } catch (err) {
      setError(err?.message || "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    setError("");
    setNotice("");

    try {
      const defaultsForScope = getDefaultSiteContentRows().filter((row) => row.scope === scope);
      if (defaultsForScope.length === 0) {
        setNotice("No defaults found for this scope.");
        setSeeding(false);
        return;
      }

      const { error } = await supabase.from("site_content").upsert(defaultsForScope, {
        onConflict: "scope,key",
        ignoreDuplicates: true,
      });
      if (error) throw error;
      setNotice("Seeded missing defaults.");
      await load(scope);
    } catch (err) {
      setError(err?.message || "Seeding failed.");
    } finally {
      setSeeding(false);
    }
  };

  const handleResetToDefaults = async () => {
    const ok = window.confirm(
      `This will overwrite ALL keys in "${scope}" with the repo defaults. Continue?`
    );
    if (!ok) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const defaultsForScope = getDefaultSiteContentRows().filter((row) => row.scope === scope);
      const { error } = await supabase.from("site_content").upsert(defaultsForScope, {
        onConflict: "scope,key",
      });
      if (error) throw error;
      setNotice("Reset to defaults.");
      await load(scope);
    } catch (err) {
      setError(err?.message || "Reset failed.");
    } finally {
      setSaving(false);
    }
  };

  const missingDefaultCount = useMemo(() => {
    const defaultKeys = new Set(Object.keys(DEFAULT_SITE_CONTENT[scope] || {}));
    if (defaultKeys.size === 0) return 0;
    const existing = new Set(rows.map((r) => r.key));
    let missing = 0;
    defaultKeys.forEach((k) => {
      if (!existing.has(k)) missing += 1;
    });
    return missing;
  }, [rows, scope]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="pill bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-700 w-fit">
            Admin
          </p>
          <h1 className="text-3xl font-bold text-[#0f1a0f]">Manage Site Text</h1>
          <p className="text-sm text-gray-700 max-w-3xl">
            Edit text-only copy used across the public pages (header, footer, and each page section). Keys are
            scoped by page.
          </p>
        </div>
        <AdminNav />
      </div>

      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-end justify-between">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700" htmlFor="scope">
              Scope
            </label>
            <select
              id="scope"
              className="rounded-md border border-gray-300 px-3 py-2 bg-white"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            >
              {scopeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {missingDefaultCount > 0 && (
              <p className="text-xs text-gray-600">{missingDefaultCount} default keys missing in this scope.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSeedDefaults}
              disabled={seeding || saving}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-white border border-gray-300 text-[#0f1a0f] hover:border-black disabled:opacity-60"
            >
              {seeding ? "Seeding..." : "Seed Missing Defaults"}
            </button>
            <button
              type="button"
              onClick={handleResetToDefaults}
              disabled={saving || seeding}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-white border border-gray-300 text-red-700 hover:border-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              Reset Scope to Defaults
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving || loading || seeding}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-[#0f1a0f] text-white hover:bg-black disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="flex-1 min-w-[240px] rounded-md border border-gray-300 px-3 py-2"
            placeholder="Filter keys (e.g. hero., footer., form.)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button
            type="button"
            onClick={() => load(scope)}
            disabled={loading || saving || seeding}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-white border border-gray-300 text-[#0f1a0f] hover:border-black disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_0.9fr] items-start">
        <div className="glass-panel p-5 space-y-4">
          <h2 className="text-lg font-semibold text-[#0f1a0f]">Keys</h2>
          {loading ? (
            <p className="text-sm text-gray-700">Loading...</p>
          ) : filteredRows.length === 0 ? (
            <p className="text-sm text-gray-700">
              No keys found for this scope. Use “Seed Missing Defaults” or create a new key.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredRows
                .slice()
                .sort(sortByKey)
                .map((row) => (
                <div key={row.key} className="border border-gray-200 rounded-lg p-3 bg-white/70 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-600">{row.key}</p>
                      {row.updated_at ? (
                        <p className="text-[11px] text-gray-500">
                          Updated {new Date(row.updated_at).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.key)}
                      disabled={saving || seeding}
                      className="text-xs font-semibold text-red-700 hover:text-red-800 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>

                  <textarea
                    rows={Math.min(10, Math.max(2, (row.value || "").split(/\r?\n/).length))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={row.value ?? ""}
                    onChange={(e) => handleChangeValue(row.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel p-5 space-y-4">
          <h2 className="text-lg font-semibold text-[#0f1a0f]">Add Key</h2>
          <form className="space-y-3" onSubmit={handleAdd}>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="newKey">
                Key
              </label>
              <input
                id="newKey"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="e.g. hero.tagline"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="newValue">
                Value
              </label>
              <textarea
                id="newValue"
                rows={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={saving || seeding}
              className="w-full bg-[#2fb3d5] text-white py-2 rounded-md font-semibold hover:bg-[#2295b2] transition disabled:opacity-70"
            >
              Add / Update
            </button>
            <p className="text-xs text-gray-600">
              Tip: lists are newline-separated. Paragraphs can be separated with a blank line.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
